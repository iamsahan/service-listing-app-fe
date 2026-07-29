"use client";
import React, { useState, useEffect, cloneElement } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@components/isAuth";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@src/context/AuthContext";
import ProfileSidebar from "@components/profile/sidebar";
import { useSocket } from "@src/context/SocketContext.js";
import {
  ProfileRefreshProvider,
  useProfileRefresh,
} from "@src/context/ProfileRefreshContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

// Child component to use useProfileRefresh within provider
const SocketHandler = ({ setCurrentOtp, socket, user, router }) => {
  const { triggerRefresh } = useProfileRefresh();

  useEffect(() => {
    if (!socket) {
      console.error("Socket is null or undefined");
      toast({
        title: "Socket Error",
        description: "Socket connection not initialized.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.uId) {
      console.warn("user.uId is missing:", user);
      router.push("/login");
      return;
    }

    const onConnect = () => {
      console.log("🔌 Socket connected:", socket.id);
      socket.emit("join-booking", user.uId);
      console.log("Emitted join-booking with uId:", user.uId);
    };

    const onDisconnect = () => {
      console.log("🔌 Socket disconnected");
    };

    const onConnectError = (err) => {
      console.error("Socket connection error:", err.message);
    };

    const onOtpReceived = (data) => {
      console.log("OTP event received:", data);
      const otp =
        data.otp || data.code || data.otpCode || data.value || data.OTP;
      if (otp) {
        setCurrentOtp(otp);
        triggerRefresh();
        toast({
          title: "OTP Received",
          description: data.customerMessage
            ? `${data.customerMessage}`
            : `Your booking OTP is ${otp}`,
        });
      } else {
        console.warn("No OTP field found in data:", data);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("otp-generated", onOtpReceived);

    if (socket.connected) {
      console.log("Socket already connected, joining booking:", user.uId);
      socket.emit("join-booking", user.uId);
    } else {
      console.log("Socket not connected, attempting to connect...");
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("otp-generated", onOtpReceived);
    };
  }, [socket, user?.uId, router, setCurrentOtp, triggerRefresh]);

  return null;
};

const layout = ({ children }) => {
  const [currentOtp, setCurrentOtp] = useState(null);
  const { socket } = useSocket();
  const { logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentOtp) {
      console.log("Current OTP updated:", currentOtp);
    }
  }, [currentOtp]);

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    logout();
    router.push("/login");
  };

  return (
    <ProfileRefreshProvider>
      <SocketHandler
        setCurrentOtp={setCurrentOtp}
        socket={socket}
        user={user}
        router={router}
      />
      <div>
        <div className="flex">
          <div className="fixed left-0 top-0 h-full z-50">
            <ProfileSidebar handleUserLogout={handleLogout} />
          </div>

          <div className="flex-1 lg:ml-[360px] flex flex-col items-center">
            <ProfileHeader />

            <div className="py-6 px-5 pt-2 md:pt-6 w-full pb-12 md:pb-16">
              {React.Children.map(children, (child) =>
                cloneElement(child, { currentOtp })
              )}
            </div>
          </div>
        </div>

        {/* SUPPORT CONTACT BUTTON */}
        <Link href="/support">
          <span
            aria-label="Contact Support"
            className="fixed bottom-6 right-6 z-50 bg-[#5f60b9] hover:bg-[#4a4a9f] text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 sm:px-3 sm:py-3 md:px-4 md:py-3"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="hidden text-sm pr-1 lg:inline">
              Contact Support
            </span>
          </span>
        </Link>
      </div>
    </ProfileRefreshProvider>
  );
};

export default withAuth(layout, ["customer"]);
