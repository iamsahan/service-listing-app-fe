// @components/serviceProvider/NotificationListener.js
"use client";
import { useEffect } from "react";
import { useSocket } from "@/src/context/SocketContext";
import { toast } from "@hooks/use-toast";
import { useProfileRefresh } from "@/src/context/ProfileRefreshContext";

export default function NotificationListener({ disabled }) {
  const { socket } = useSocket();
  const { triggerRefresh } = useProfileRefresh();

  useEffect(() => {
    if (!socket || disabled) return;

    const handleNotification = (data) => {
      toast({
        title: data.title,
        description: data.message,
        variant: "destructive",
      });
      triggerRefresh();
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, triggerRefresh]);

  return null;
}
