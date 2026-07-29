"use client";

import { SocketNotificationProvider } from "@/src/context/SocketNotificationContext";
import { useSocket } from "@/src/context/SocketContext";
import { ToastProvider } from "@components/ui/toast";
import { useAuth } from "@/src/context/AuthContext";

export default function Providers({ children }) {
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    connectionState,
    lastHeartbeat,
    forceReconnect,
  } = useSocket();

  return (
    <ToastProvider>
      <SocketNotificationProvider
        socket={socket}
        user={user}
        isConnected={isConnected}
        connectionState={connectionState}
        lastHeartbeat={lastHeartbeat}
        forceReconnect={forceReconnect}
      >
        {children}
      </SocketNotificationProvider>
    </ToastProvider>
  );
}
