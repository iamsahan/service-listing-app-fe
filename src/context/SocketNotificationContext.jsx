"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "@hooks/use-toast";
import timeoutManager from "../../utils/timeoutManager";
import BookingAssignmentDialog from "@/components/dialogs/BookingAssignmentDialog";

const SocketNotificationContext = createContext(null);

export const SocketNotificationProvider = ({
  socket,
  user,
  isConnected,
  connectionState,
  lastHeartbeat,
  forceReconnect,
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [otpData, setOtpData] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [bookingUpdatedEvent, setBookingUpdatedEvent] = useState(null);
  const [ticketReplyEvent, setTicketReplyEvent] = useState(null);
  const [enableOnlinePayEvent, setEnableOnlinePayEvent] = useState(null);
  const [bookingAssignmentEvent, setBookingAssignmentEvent] = useState(null);

  // Booking assignment dialog state
  const [assignmentData, setAssignmentData] = useState(null);
  const [isAssignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentCountdown, setAssignmentCountdown] = useState(null);
  const [isProcessingAssignment, setIsProcessingAssignment] = useState(false);

  // Connect to notification room
  const connectToRoom = useCallback(() => {
    if (!socket || !user?.uId) {
      console.log("Socket or user not available for room connection");
      return;
    }

    console.log("Connecting to notifications room...");
    socket.emit("join-room", "notifications");
  }, [socket, user?.uId]);

  // Monitor connection state changes and rejoin room when reconnected
  useEffect(() => {
    if (connectionState === "connected" && socket && user?.uId) {
      connectToRoom();
    }
  }, [connectionState, socket, user?.uId, connectToRoom]);

  // Handle OTP received
  const onOtpReceived = useCallback((data) => {
    const { bookingId, expiresIn, mobile, otp } = data;
    if (!bookingId || !otp) {
      console.warn("Invalid OTP data received", data);
      return;
    }

    setOtpData({ bookingId, expiresIn, mobile, otp });
    setOtpCountdown(expiresIn || 30);
    setDialogOpen(true);
  }, []);

  // Countdown
  useEffect(() => {
    if (!otpCountdown || otpCountdown <= 0) return;

    const interval = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDialogOpen(false);
          setOtpData(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Assignment countdown - check against server expires_at time
  useEffect(() => {
    if (!assignmentCountdown || assignmentCountdown <= 0) return;
    if (!assignmentData?.expires_at) return;

    const interval = setInterval(() => {
      // Check current time against server's expires_at
      const now = Date.now();
      const expiresAt = assignmentData.expires_at;

      if (now >= expiresAt) {
        // Time has passed the expiration time
        clearInterval(interval);
        setAssignmentDialogOpen(false);
        setAssignmentData(null);
        setAssignmentCountdown(null);

        toast({
          title: "Assignment Expired",
          description:
            "The booking assignment has timed out. Refreshing orders...",
          variant: "destructive",
        });

        // Emit custom event to notify orders page to refresh
        window.dispatchEvent(new CustomEvent('booking-expired'));

        return;
      }

      // Update countdown based on remaining time
      const remainingMs = expiresAt - now;
      const remainingSeconds = Math.floor(remainingMs / 1000);

      setAssignmentCountdown(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        setAssignmentDialogOpen(false);
        setAssignmentData(null);

        toast({
          title: "Assignment Expired",
          description:
            "The booking assignment has timed out. Refreshing orders...",
          variant: "destructive",
        });

        // Emit custom event to notify orders page to refresh
        window.dispatchEvent(new CustomEvent('booking-expired'));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assignmentCountdown, assignmentData?.expires_at, router, pathname]);

  // Booking update handler
  const onBookingUpdate = (data) => {
    if (!data?.bookingId) {
      console.warn("Invalid booking-update data", data);
      return;
    }

    setBookingUpdatedEvent(data);
    // toast({
    //   title: "Booking Updated",
    //   description: `Your booking with ID ${data.bookingId} has been updated.`,
    // });
  };

  // Ticket reply handler
  const onTicketReply = (data) => {
    if (!data?.ticketId) {
      console.warn("Invalid ticket-reply data", data);
      return;
    }

    setTicketReplyEvent(data);
    toast({
      title: "Chats",
      description: "You have new messages.",
    });
  };

  // Booking assignment handler
  const onBookingAssignment = useCallback(
    (data) => {
      if (!data?.bookingId) {
        console.warn("Invalid booking_assignment_update data", data);
        return;
      }

      console.log("Processing booking_assignment_update event:", data);
      console.log("User ID from context:", user?.uId);

      // Use server-provided timestamp instead of client Date.now()
      const serverTimestamp = data.timestamp || Date.now();
      const expiresAt =
        data.expires_at || serverTimestamp + (data.timeout_ms || 60000);

      // Immediately store timeout data in centralized manager with server timestamps
      if (data.status === "assigned" && data.timeout_ms) {
        const stored = timeoutManager.storeTimeout(
          data.bookingId,
          data.timeout_ms,
          serverTimestamp,
          expiresAt
        );

        if (stored) {
          console.log(
            `Stored timeout data for booking ${data.bookingId} with server timestamp: ${data.timestamp_formatted}`
          );
        }
      }

      // Add timestamp and unique properties to make events more distinct
      const enhancedEventData = {
        ...data,
        receivedAt: serverTimestamp,
        eventId:
          data.eventId || `assignment_${data.bookingId}_${serverTimestamp}`,
      };

      setBookingAssignmentEvent(enhancedEventData);

      // Show assignment dialog for new booking assignment
      if (data.status === "assigned") {
        // Calculate initial countdown based on server time
        const now = Date.now();
        const remainingMs = Math.max(0, expiresAt - now);
        const remainingSeconds = Math.floor(remainingMs / 1000);

        setAssignmentData({
          bookingId: data.bookingId,
          timeout_ms: data.timeout_ms,
          expires_at: expiresAt,
          timestamp: serverTimestamp,
          ...data,
        });
        setAssignmentCountdown(remainingSeconds);
        setAssignmentDialogOpen(true);

        toast({
          title: "New Booking Assigned!",
          description: `You have been assigned a new booking: ${
            data.bookingId
          }. Timeout: ${Math.round((data.timeout_ms || 0) / 1000)}s`,
          duration: 10000, // Show for 10 seconds since it's important
        });
      }
    },
    [user?.uId]
  );

  // Enable online payment handler
  const onEnableOnlinePay = (data) => {
    if (!data?.bookingId) {
      console.warn("Invalid enable_online_pay data", data);
      return;
    }

    console.log("Processing enable_online_pay event:", data);

    // Add timestamp and unique properties to make events more distinct
    const enhancedEventData = {
      ...data,
      receivedAt: Date.now(),
      eventId: data.eventId || `enable_pay_${data.bookingId}_${Date.now()}`,
    };

    setEnableOnlinePayEvent(enhancedEventData);

    // const statusText =
    //   data.isEnabled !== undefined
    //     ? data.isEnabled
    //       ? "enabled"
    //       : "disabled"
    //     : "updated";

    // toast({
    //   title: "Payment Settings Updated",
    //   description: `Online payment has been ${statusText} for your booking: ${data.bookingId}.`,
    // });
  };

  const closeAssignmentDialog = useCallback(() => {
    setAssignmentDialogOpen(false);
    setAssignmentData(null);
    setAssignmentCountdown(null);
  }, []);

  // Main socket event listeners for notifications only
  useEffect(() => {
    if (!socket || !user?.uId) return;

    const handleNotification = (data) => {
      if (!data?.type) return;

      console.log("Received notification:", data.type);

      switch (data.type) {
        case "otp":
          onOtpReceived(data);
          break;
        case "booking_update":
          onBookingUpdate(data);
          break;
        case "ticket_reply":
          onTicketReply(data);
          break;
        case "enable_online_pay":
          onEnableOnlinePay(data);
          break;
        case "booking_assignment_update":
          onBookingAssignment(data);
          break;
        default:
          console.warn("Unknown notification type:", data.type);
      }
    };

    // Register notification listener only
    socket.on("notifications", handleNotification);

    return () => {
      socket.off("notifications", handleNotification);
    };
  }, [socket, user?.uId, onOtpReceived, onBookingAssignment]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setOtpData(null);
    setOtpCountdown(null);
  }, []);

  const clearEvent = useCallback((name) => {
    console.log("Clearing event:", name);
    if (name === "booking_update") {
      setBookingUpdatedEvent(null);
    } else if (name === "ticket_reply") {
      setTicketReplyEvent(null);
    } else if (name === "enable_online_pay") {
      setEnableOnlinePayEvent(null);
    } else if (name === "booking_assignment_update") {
      setBookingAssignmentEvent(null);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      otpData,
      isDialogOpen,
      closeDialog,
      bookingUpdatedEvent,
      ticketReplyEvent,
      enableOnlinePayEvent,
      bookingAssignmentEvent,
      clearEvent,
      connectionState,
      isConnected,
      forceReconnect,
      lastHeartbeat,
      socket, // Expose socket for direct usage
      // Assignment dialog
      assignmentData,
      isAssignmentDialogOpen,
      assignmentCountdown,
      isProcessingAssignment,
      setIsProcessingAssignment,
      closeAssignmentDialog,
    }),
    [
      otpData,
      isDialogOpen,
      closeDialog,
      bookingUpdatedEvent,
      ticketReplyEvent,
      enableOnlinePayEvent,
      bookingAssignmentEvent,
      clearEvent,
      connectionState,
      isConnected,
      forceReconnect,
      lastHeartbeat,
      socket,
      assignmentData,
      isAssignmentDialogOpen,
      assignmentCountdown,
      isProcessingAssignment,
      setIsProcessingAssignment,
      closeAssignmentDialog,
    ]
  );

  return (
    <SocketNotificationContext.Provider value={contextValue}>
      {children}

      {/* Connection Status Debug Info only for devs*/}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              connectionState === "connected"
                ? "bg-green-100 text-green-800"
                : connectionState === "connecting" ||
                  connectionState === "reconnecting"
                ? "bg-yellow-100 text-yellow-800"
                : connectionState === "stale"
                ? "bg-orange-100 text-orange-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Socket: {connectionState}
            {lastHeartbeat && (
              <span className="ml-1">
                ({Math.round((Date.now() - lastHeartbeat) / 1000)}s ago)
              </span>
            )}
          </div>
        </div>
      )}

      {otpData && (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="w-full max-w-sm"
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <DialogHeader className="space-y-3">
              <DialogTitle>OTP Received</DialogTitle>

              <DialogDescription>
                Your booking OTP for booking {otpData.bookingId} is{" "}
                <strong>{otpData.otp}</strong>
                {otpCountdown !== null && otpCountdown > 0 && (
                  <>
                    <br />
                    <small>Expires in: {otpCountdown} seconds</small>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button onClick={closeDialog}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Assignment Dialog */}
      {!["customer", "admin"].includes(user?.role) && (
        <BookingAssignmentDialog
          assignmentData={assignmentData}
          isAssignmentDialogOpen={isAssignmentDialogOpen}
          assignmentCountdown={assignmentCountdown}
          isProcessingAssignment={isProcessingAssignment}
          setIsProcessingAssignment={setIsProcessingAssignment}
          onClose={closeAssignmentDialog}
        />
      )}
    </SocketNotificationContext.Provider>
  );
};

export const useSocketNotifications = () => {
  const context = useContext(SocketNotificationContext);
  if (!context) {
    throw new Error(
      "useSocketNotifications must be used within a SocketNotificationProvider"
    );
  }
  return context;
};
