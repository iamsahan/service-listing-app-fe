"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [lastHeartbeat, setLastHeartbeat] = useState(null);
  const socketRef = useRef(null);

  // Force reconnection
  const forceReconnect = useCallback(() => {
    if (!socketRef.current) return;

    console.log("Forcing socket reconnection...");
    setConnectionState("reconnecting");

    if (socketRef.current.connected) {
      socketRef.current.emit("ping", { timestamp: Date.now() });
    } else {
      socketRef.current.connect();
    }
  }, []);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_ENDPOINT, {
      path: "/socket.io/",
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Register user and setup connection handlers
    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      setConnectionState("connected");
      setLastHeartbeat(Date.now());

      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const USER_IDENTIFIER = user?.role === "admin" ? "admin" : user?.uId;

      if (USER_IDENTIFIER) {
        newSocket.emit("join-user", USER_IDENTIFIER);
      }
    });

    // Handle disconnects
    newSocket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setIsConnected(false);
      setConnectionState("disconnected");
      setLastHeartbeat(null);

      if (reason === "transport close" || reason === "ping timeout") {
        setConnectionState("reconnecting");
        // Force reconnect attempt
        setTimeout(() => {
          if (!newSocket.connected) newSocket.connect();
        }, 2000);
      }
    });

    // Handle connection errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnectionState("error");
      setIsConnected(false);
    });

    // Handle reconnection
    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setConnectionState("connected");
      setLastHeartbeat(Date.now());
    });

    // Handle tab sleep/wake
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab became visible - checking socket connection");

        const now = Date.now();
        // Use ref to get current heartbeat value to avoid stale closures
        const currentHeartbeat = socketRef.current?.lastHeartbeat || 0;
        const timeSinceLastHeartbeat = currentHeartbeat
          ? now - currentHeartbeat
          : Infinity;

        if (!newSocket?.connected || timeSinceLastHeartbeat > 60000) {
          console.log("Socket connection appears stale, forcing reconnection");
          // Direct reconnection logic instead of using forceReconnect
          if (newSocket.connected) {
            newSocket.emit("ping", { timestamp: now });
          } else {
            newSocket.connect();
          }
        } else {
          newSocket.emit("ping", { timestamp: now });
        }
      } else {
        console.log("Tab became hidden");
        setConnectionState("dormant");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Unified heartbeat system with pong response
    const pingInterval = setInterval(() => {
      if (newSocket.connected && document.visibilityState === "visible") {
        const timestamp = Date.now();
        newSocket.emit("ping", { timestamp });

        // Use ref to get current heartbeat value to avoid stale closures
        const currentHeartbeat = socketRef.current?.lastHeartbeat || 0;
        if (currentHeartbeat && timestamp - currentHeartbeat > 30000) {
          console.warn("No heartbeat response, connection might be stale");
          setConnectionState("stale");
        }
      }
    }, 15000);

    // Handle pong responses
    const handlePong = (data) => {
      const now = Date.now();
      setLastHeartbeat(now);
      // Store in ref for access in closures
      if (socketRef.current) {
        socketRef.current.lastHeartbeat = now;
      }
      setConnectionState((prevState) =>
        prevState !== "connected" ? "connected" : prevState
      );
    };

    newSocket.on("pong", handlePong);

    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      newSocket.off("pong", handlePong);
      newSocket.disconnect();
    };
  }, []); // only run once on mount

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionState,
        lastHeartbeat,
        forceReconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
