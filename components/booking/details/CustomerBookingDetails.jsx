"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MessageCircle,
  PhoneCall,
  CreditCard,
  Clock,
  MapPin,
  Package,
  Receipt,
  CheckCircle,
  Info,
} from "lucide-react";
import { useSocketNotifications } from "@/src/context/SocketNotificationContext";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { cartService } from "@/api/cartService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMobile } from "@/src/hooks/useMobile";
import FindingProBanner from "./FindingProBanner";
import CancelledBanner from "./CancelledBanner";
import OtpBanner from "./OtpBanner";
import BookingHeader from "./BookingHeader";
import { CustomerBookingDetailsSkeleton } from "@/components/skeletons/CustomerBookingDetailsSkeleton";
import PaymentPendingBanner from "./PaymentPendingBanner";
import PaymentSuccessBanner from "./PaymentSuccessBanner";
import Banner from "@/components/Banner";

const RequestBookingRefundDialog = dynamic(
  () => import("./RequestRefundDialog"),
);

const BookingCancellationDialog = dynamic(
  () => import("@/components/booking/BookingCancellationDialog"),
);
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("GOOGLE_MAPS_API_KEY is not defined");
}

if (!API_ENDPOINT) {
  throw new Error("API_ENDPOINT is not defined");
}

export default function CustomerBookingDetails({ baseUrl }) {
  // Get payment success flag
  const searchParams = useSearchParams();
  const bps = searchParams.get("bps");

  const { id } = useParams();
  const { toast } = useToast();
  const isMobile = useMobile();
  const {
    otpData,
    bookingUpdatedEvent,
    enableOnlinePayEvent,
    clearEvent,
    closeDialog,
  } = useSocketNotifications();

  // Use refs to avoid stale closures in callbacks
  const idRef = useRef(id);
  const toastRef = useRef(toast);

  // Track processed events to prevent infinite loops
  const processedEventsRef = useRef(new Set());

  // Track previous values to detect actual changes
  const prevOtpDataRef = useRef();
  const prevBookingUpdateEventRef = useRef();
  const prevEnableOnlinePayEventRef = useRef();

  // Update refs when values change
  useEffect(() => {
    idRef.current = id;
    toastRef.current = toast;
  }, [id, toast]);

  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [bookingPayment, setBookingPayment] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [refundInfo, setRefundInfo] = useState();
  const [isRefundLoading, setIsRefundLoading] = useState();
  const [bookingToCancell, setBookingToCancell] = useState();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [penaltyDetails, setPenaltyDetails] = useState({
    penalty: "No penalty",
  });
  const profileImageUrl = useMemo(
    () =>
      bookingData?.provider?.User?.photo
        ? `${API_ENDPOINT}${bookingData.provider.User.photo}`
        : "",
    [bookingData?.provider?.User?.photo],
  );

  const providerInitials = useMemo(
    () => bookingData?.provider?.User?.name?.slice(0, 2).toUpperCase(),
    [bookingData?.provider?.User?.name],
  );

  const bookingDate = useMemo(
    () =>
      bookingData?.booking_date ? new Date(bookingData.booking_date) : null,
    [bookingData?.booking_date],
  );

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute.padStart(2, "0")} ${ampm}`;
  };

  const fetchBookingData = useCallback(async () => {
    console.log("fetchBookingData called - starting API request");
    setIsLoading(true);
    try {
      const response = await cartService.getBookingDataById(idRef.current);
      console.log("Full API response:", response); // Debug log
      setBookingData({
        ...response.booking,
        payment_summary: response.payment_summary,
        max_buffer_time: response.max_buffer_time,
      });
      setBookingPayment(response.payment_summary);
      console.log("Booking data successfully updated from API");
    } catch (error) {
      console.error("Error fetching booking data:", error);
      toastRef.current({
        title: "Error",
        description: "Unable to fetch booking details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("fetchBookingData completed");
    }
  }, []); // No dependencies - use refs for current values

  useEffect(() => {
    // Check if any of the events have actually changed
    const otpChanged =
      JSON.stringify(otpData) !== JSON.stringify(prevOtpDataRef.current);
    const bookingUpdateChanged =
      JSON.stringify(bookingUpdatedEvent) !==
      JSON.stringify(prevBookingUpdateEventRef.current);
    const onlinePayChanged =
      JSON.stringify(enableOnlinePayEvent) !==
      JSON.stringify(prevEnableOnlinePayEventRef.current);

    if (!otpChanged && !bookingUpdateChanged && !onlinePayChanged) {
      return; // No actual changes, skip processing
    }

    // Update refs with current values
    prevOtpDataRef.current = otpData;
    prevBookingUpdateEventRef.current = bookingUpdatedEvent;
    prevEnableOnlinePayEventRef.current = enableOnlinePayEvent;

    // Helper function to check if booking IDs match (handles partial matches)
    const isBookingMatch = (eventData, currentId) => {
      if (!eventData || !currentId) return false;

      // Check full booking ID
      if (eventData.bookingId === currentId) return true;

      // Check base booking ID if provided by backend
      if (eventData.baseBookingId && eventData.baseBookingId === currentId)
        return true;

      // Fallback: check if current ID starts with event booking ID
      if (
        eventData.bookingId &&
        currentId.startsWith(eventData.bookingId + "-")
      )
        return true;

      // Fallback: check if event booking ID starts with current ID
      if (
        eventData.bookingId &&
        eventData.bookingId.startsWith(currentId + "-")
      )
        return true;

      return false;
    };

    // Generate unique keys for each event
    const otpEventKey =
      otpData && isBookingMatch(otpData, id) && otpData?.otp
        ? `otp-${otpData.bookingId}-${otpData.otp}`
        : null;

    const bookingUpdateEventKey =
      bookingUpdatedEvent && isBookingMatch(bookingUpdatedEvent, id)
        ? `booking-${bookingUpdatedEvent.bookingId}-${
            bookingUpdatedEvent.status || "update"
          }-${
            bookingUpdatedEvent.updatedAt ||
            bookingUpdatedEvent.timestamp ||
            "now"
          }`
        : null;

    const onlinePayEventKey =
      enableOnlinePayEvent && isBookingMatch(enableOnlinePayEvent, id)
        ? `pay-${enableOnlinePayEvent.bookingId}-${JSON.stringify(
            enableOnlinePayEvent,
          )}`
        : null;

    // Debug logging for booking_update events
    if (bookingUpdatedEvent) {
      console.log("Booking update event received:", {
        eventBookingId: bookingUpdatedEvent.bookingId,
        eventBaseBookingId: bookingUpdatedEvent.baseBookingId,
        currentPageId: id,
        eventMatch: isBookingMatch(bookingUpdatedEvent, id),
        eventData: bookingUpdatedEvent,
        generatedKey: bookingUpdateEventKey,
        status: bookingUpdatedEvent.status,
        timestamp: bookingUpdatedEvent.timestamp,
      });
    }

    // Debug logging for enable_online_pay events
    if (enableOnlinePayEvent) {
      console.log("Enable online pay event received:", {
        eventBookingId: enableOnlinePayEvent.bookingId,
        eventBaseBookingId: enableOnlinePayEvent.baseBookingId,
        currentPageId: id,
        eventMatch: isBookingMatch(enableOnlinePayEvent, id),
        eventData: enableOnlinePayEvent,
        generatedKey: onlinePayEventKey,
      });
    }

    const eventsToProcess = [
      otpEventKey,
      bookingUpdateEventKey,
      onlinePayEventKey,
    ].filter((key) => key && !processedEventsRef.current.has(key));

    console.log("Event processing check:", {
      otpEventKey,
      bookingUpdateEventKey,
      onlinePayEventKey,
      processedEvents: Array.from(processedEventsRef.current),
      eventsToProcess,
      processedEventsSize: processedEventsRef.current.size,
      otpChanged,
      bookingUpdateChanged,
      onlinePayChanged,
    });

    if (eventsToProcess.length === 0) {
      console.log(
        "No events to process - all events already processed or invalid",
      );
      return;
    }

    console.log("Refetching booking data due to socket event", {
      events: eventsToProcess,
    });

    // Mark events as processed immediately to prevent double processing
    eventsToProcess.forEach((key) => processedEventsRef.current.add(key));

    // Close OTP dialog if booking_update event is being processed
    if (
      bookingUpdateEventKey &&
      eventsToProcess.includes(bookingUpdateEventKey)
    ) {
      console.log("Closing OTP dialog due to booking_update event");
      closeDialog();
    }

    // Execute immediately instead of using setTimeout to avoid race conditions
    console.log("About to call fetchBookingData immediately");
    fetchBookingData()
      .then(() => {
        // Clear the specific events after API call completes
        if (
          bookingUpdateEventKey &&
          eventsToProcess.includes(bookingUpdateEventKey)
        ) {
          console.log("Clearing booking_update event after processing");
          clearEvent("booking_update");
        }
        if (onlinePayEventKey && eventsToProcess.includes(onlinePayEventKey)) {
          console.log("Clearing enable_online_pay event after processing");
          clearEvent("enable_online_pay");
        }
      })
      .catch((error) => {
        console.error("Error in fetchBookingData:", error);
      });
  }, [
    id,
    otpData,
    bookingUpdatedEvent,
    enableOnlinePayEvent,
    fetchBookingData,
    clearEvent,
    closeDialog,
  ]);

  // Separate useEffect for initial data loading - only run once
  useEffect(() => {
    console.log("Loading initial booking data");
    fetchBookingData();
  }, [fetchBookingData]); // fetchBookingData is stable now with no dependencies

  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const response = await cartService.proceedRemainingBookingPayment(id);
      if (response.checkoutPageUrl) {
        window.location.href = response.checkoutPageUrl;
      } else {
        toast({
          title: "Error",
          description: "Payment URL not received. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description:
          error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelbooking = async (bookingId) => {
    try {
      setBookingToCancell(bookingId);
      setIsCancelDialogOpen(true);
      const response = await cartService.cancellBookingByCustomer(bookingId);
      setPenaltyDetails(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelConfirmBooking = async ({ needBankRefund }) => {
    try {
      const response = await cartService.confirmCancellBookingByCustomer(
        bookingToCancell,
        {
          penalty: penaltyDetails.penalty,
          needBankRefund: needBankRefund,
        },
      );
      setPenaltyDetails(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCancelDialogOpen(false);
      setBookingToCancell(null);
      fetchBookingData();
    }
  };

  const handleRequestRefund = async (bookingId) => {
    setIsRefundLoading(true);
    try {
      setIsRefundDialogOpen(true);
      const response = await cartService.customerRequestRefund(bookingId);
      setRefundInfo(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefundLoading(false);
    }
  };

  const handleRescheduleBooking = () => {
    window.location.href = `/reschedule/${bookingData?.booking_id}`;
  };

  if (isLoading) {
    return <CustomerBookingDetailsSkeleton />;
  }

  const isFindingProvider =
    !bookingData?.provider &&
    ![
      "cancelled",
      "completed",
      "refunded",
      "in_progress",
      "payment_pending",
    ].includes(bookingData?.status);

  const displayProviderInfo =
    bookingData?.provider &&
    !["assigned", "cancelled", "refunded"].includes(bookingData?.status);

  const displayProviderContactInfo =
    bookingData?.provider &&
    bookingData?.booking_date &&
    bookingData?.start_time &&
    !["assigned", "cancelled", "completed", "refunded"].includes(
      bookingData?.status,
    ) &&
    (bookingData.max_buffer_time === 0 ||
      (() => {
        // Combine booking date with start time
        const bookingDateTime = new Date(
          `${bookingData.booking_date}T${bookingData.start_time}`,
        );

        // Subtract minutes from the bookingDateTime
        const graceDateTime = new Date(bookingDateTime);
        graceDateTime.setMinutes(
          bookingDateTime.getMinutes() - bookingData.max_buffer_time,
        );

        const now = new Date();
        return now >= graceDateTime;
      })());

  const isRefundEnabled =
    bookingData?.status === "cancelled" &&
    bookingData?.BookingPayment?.payment_status === "completed";

  const isRefundPending =
    bookingData?.BookingPayment?.refund_status === "pending";

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto space-y-4">
      {bps === "true" && <PaymentSuccessBanner />}

      {/* HEADER */}
      {isMobile && (
        <div className="space-y-4 bg-gray-50 rounded-xl px-2 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="[&_svg]:size-6"
              asChild
            >
              <Link href={baseUrl}>
                <ArrowLeft />
              </Link>
            </Button>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {bookingData?.subCategory?.name}
              </h1>
              <p className="text-sm text-gray-600">
                {bookingDate?.toDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Banners  */}
      {bookingData?.status === "cancelled" ? (
        <CancelledBanner
          isRefundEnabled={isRefundEnabled}
          isRefundLoading={isRefundLoading}
          isRefundPending={isRefundPending}
          reason={bookingData?.cancellation_reason}
          cancelledBy={bookingData?.cancelled_by}
          handleRequestRefund={() =>
            handleRequestRefund(bookingData?.booking_id)
          }
          handleReschedule={handleRescheduleBooking}
        />
      ) : bookingData?.status === "payment_pending" ? (
        <PaymentPendingBanner id={id} />
      ) : (
        <BookingHeader
          status={bookingData?.status}
          handleReschedule={handleRescheduleBooking}
          handleCancel={() => handleCancelbooking(bookingData?.booking_id)}
        />
      )}

      {/* OTP BANNER */}
      {bookingData?.otp && new Date() < new Date(bookingData?.otp_expires) && (
        <OtpBanner otp={bookingData?.otp} status={bookingData?.status} />
      )}

      {/* PAYMENT PENDING */}
      {enableOnlinePayEvent === id ||
        (bookingData?.is_payment_button_enabled && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl">
            <div className="flex items-start sm:items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-amber-100 flex-shrink-0">
                <CreditCard className="size-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">
                  Payment Required
                </h3>
                <p className="text-sm text-amber-700">
                  Complete your booking by paying the remaining balance
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700">Amount to pay:</p>
                <p className="text-xl font-bold text-amber-800">
                  ₹{bookingData?.payment_summary?.total_pending_payments}
                </p>
              </div>

              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4"
                onClick={handleProcessPayment}
                disabled={isProcessingPayment}
              >
                <CreditCard className="w-4 h-4" />
                {isProcessingPayment ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>
        ))}

      {/* FINDING A PROVIDER */}
      {isFindingProvider && <FindingProBanner />}

      {/* PROVIDER CONTACT */}
      {displayProviderInfo && (
        <div className="bg-gray-100/50 border border-gray-200/75 sm:border-none rounded-xl p-4">
          {/* Desktop: Collapsible */}
          <div className="hidden sm:block">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profileImageUrl} alt="provider-avatar" />
                    <AvatarFallback className="uppercase bg-[#5f60b9]/10 text-[#5f60b9] font-semibold text-xs">
                      {providerInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <Label className="font-medium text-gray-900 text-sm">
                      {bookingData?.provider?.User?.name}
                    </Label>
                    <p className="text-xs text-gray-600">
                      {bookingData?.provider?.business_name}
                    </p>
                  </div>

                  {displayProviderContactInfo && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#5f60b9] font-semibold text-xs"
                    >
                      Contact Info
                    </Button>
                  )}
                </div>
              </CollapsibleTrigger>

              {displayProviderContactInfo && (
                <CollapsibleContent className="mt-3 ml-13 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3 h-3 text-[#5f60b9]" />
                    <span>{bookingData?.provider?.User?.email}</span>
                  </div>

                  {bookingData?.provider?.User?.mobile && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <PhoneCall className="w-3 h-3 text-[#5f60b9]" />
                      <span>{bookingData?.provider?.User?.mobile}</span>
                    </div>
                  )}
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>

          {/* Mobile: Direct contact */}
          <div className="sm:hidden">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profileImageUrl} alt="provider-avatar" />
                <AvatarFallback className="uppercase bg-[#5f60b9]/10 text-[#5f60b9] font-semibold text-xs">
                  {providerInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Label className="font-medium text-gray-900 text-sm">
                  {bookingData?.provider?.User?.name}
                </Label>
                <p className="text-xs text-gray-600">
                  {bookingData?.provider?.business_name}
                </p>
              </div>
            </div>

            {displayProviderContactInfo && (
              <div className="flex gap-2">
                {bookingData?.provider?.User?.mobile && (
                  <a
                    href={`tel:${bookingData.provider.User.mobile}`}
                    className="flex items-center justify-center bg-[#5f60b9]/10 text-[#5f60b9] p-2.5 rounded-lg gap-2 font-medium flex-1 hover:bg-[#5f60b9]/20 transition-colors text-xs"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Call
                  </a>
                )}
                <a
                  href={`mailto:${bookingData?.provider?.User?.email}`}
                  className="flex items-center justify-center bg-[#5f60b9]/10 text-[#5f60b9] p-2.5 rounded-lg gap-2 font-medium flex-1 hover:bg-[#5f60b9]/20 transition-colors text-xs"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKING DETAILS */}
      <div className="bg-white border border-gray-200/75 sm:border-none rounded-xl overflow-hidden lg:pb-4">
        <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[#5f60b9]" />
            <h2 className="font-semibold text-gray-900">Booking Details</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pb-0 lg:pb-4">
            {/* Left column */}
            <div className="space-y-5 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-3 h-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Booking ID
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {bookingData?.booking_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Date
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {bookingDate?.toDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Time
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatTime(bookingData?.start_time)} -{" "}
                    {formatTime(bookingData?.end_time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5 sm:space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Payment Method
                  </p>
                  <p className="font-medium text-gray-900 capitalize text-sm">
                    {bookingData?.BookingPayment?.payment_method === "cash"
                      ? "After Service"
                      : bookingData?.BookingPayment?.payment_method}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Payment Status
                  </p>
                  <p className="font-medium text-gray-900 capitalize text-sm">
                    {bookingData?.BookingPayment?.payment_status}
                  </p>
                </div>
              </div>

              {bookingData?.service_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Address
                    </p>
                    <p className="font-medium text-gray-900 leading-relaxed text-sm">
                      {bookingData?.service_address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Instructions */}
          {bookingData?.customer_notes && (
            <div className="flex items-start gap-2 bg-gray-50 p-3 lg:rounded-xl">
              <Info className="w-3 h-3 text-gray-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Special Instructions
                </p>
                <p className="font-medium text-gray-900 leading-relaxed text-sm">
                  {bookingData.customer_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOOKING ITEMS */}
      <div className="space-y-6 bg-muted/50 p-5 rounded-lg border sm:border-none">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-[#5f60b9]" />
            <h2 className="font-semibold text-gray-900">Booking Items</h2>
          </div>
          <hr />
        </div>

        <div className="space-y-3">
          {bookingData?.BookingItems?.map((item, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {item.serviceItem?.name ||
                    item.packageItem?.name ||
                    item.custom_item_name ||
                    "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div>
                <p>₹{item.total_price}</p>
              </div>
            </div>
          ))}

          <div className="space-y-1 text-sm">
            <hr className="pb-3" />

            {/* Show subtotal from payment_summary */}
            {bookingPayment?.total_subtotal && (
              <p className="py-1 font-semibold text-base flex justify-between">
                <span>Subtotal</span> ₹
                {Number(bookingPayment?.total_subtotal).toFixed(2)}
              </p>
            )}
            {/* Show aggregated tax from payment_summary */}
            {(bookingPayment?.total_tax ||
              bookingData?.BookingPayment?.tax_amount) > 0 && (
              <p className="py-1 text-muted-foreground font-medium flex justify-between">
                <span>Tax & Other Charges</span> + ₹
                {Number(
                  bookingPayment?.total_tax ||
                    bookingData?.BookingPayment?.tax_amount,
                ).toFixed(2)}
              </p>
            )}

            {/* Account balance used */}
            {bookingData?.payment_summary?.acc_balance_used !== undefined &&
              bookingData?.payment_summary?.acc_balance_used != 0 && (
                <p className="py-1 text-muted-foreground font-medium flex justify-between">
                  <span>
                    {Number(bookingData?.payment_summary?.acc_balance_used) > 0
                      ? "Previous Acc Balance"
                      : "Previous Penalties"}
                  </span>

                  <span
                    className={`${
                      Number(bookingData?.payment_summary?.acc_balance_used) > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {Number(bookingData?.payment_summary?.acc_balance_used) > 0
                      ? `- ₹${Number(
                          bookingData?.payment_summary?.acc_balance_used,
                        ).toFixed(2)}`
                      : `+ ₹${Math.abs(
                          Number(
                            bookingData?.payment_summary?.acc_balance_used,
                          ),
                        ).toFixed(2)}`}
                  </span>
                </p>
              )}

            {bookingData?.payment_summary?.total_discount_amount > 0 && (
              <p className="py-1 text-muted-foreground font-medium flex justify-between">
                <span>Discount</span>
                <span className="text-green-500">
                  - ₹
                  {Number(
                    bookingData?.payment_summary?.total_discount_amount,
                  ).toFixed(2)}
                </span>
              </p>
            )}
            {/* Show total tip from payment_summary */}
            {(bookingPayment?.total_tip_amount ||
              bookingData?.BookingPayment?.tip_amount) > 0 && (
              <p className="py-1 font-semibold flex justify-between">
                <span>Tip</span>+ ₹
                {Number(
                  bookingPayment?.total_tip_amount ||
                    bookingData?.BookingPayment?.tip_amount,
                ).toFixed(2)}
              </p>
            )}

            <div className="space-y-1 pt-3">
              <hr />

              <p className="py-2 text-lg font-semibold flex justify-between">
                <span>Total Amount</span>
                <span className="text-[#5f60b9]">
                  ₹{bookingData?.payment_summary?.final_total_amount.toFixed(2)}
                </span>
              </p>

              {bookingData?.BookingPayment?.payment_status ===
                "advance_only_paid" && (
                <>
                  <p className="py-2 text-base flex justify-between">
                    <span>Advance Paid</span>
                    <span className="text-orange-600">
                      ₹
                      {bookingData?.payment_summary?.total_advance_payment.toFixed(
                        2,
                      )}
                    </span>
                  </p>

                  <p className="py-2 text-base flex justify-between">
                    <span>Remaining Balance</span>
                    <span>
                      ₹
                      {bookingData?.payment_summary?.total_pending_payments.toFixed(
                        2,
                      )}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 sm:pt-8">
        <Banner position="booking_details" cityId="all" />
      </div>

      {/* SUPPORT CONTACT BUTTON */}
      <Link href={`/support?bookingId=${bookingData?.booking_id}`}>
        <div className="fixed bottom-6 right-6 z-50 bg-[#5f60b9] hover:bg-[#4a4a9f] text-white px-3 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 hover:shadow-xl">
          <MessageCircle className="w-5 h-5" />
          <span className="hidden text-xs pr-1 lg:inline">Contact Support</span>
        </div>
      </Link>

      {/* CANCELLATION DIALOG */}
      <BookingCancellationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleCancelConfirmBooking}
        penaltyDetails={penaltyDetails}
      />

      {/* REFUND DIALOG */}
      <RequestBookingRefundDialog
        open={isRefundDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            fetchBookingData();
          }
          setIsRefundDialogOpen(open);
        }}
        data={refundInfo}
        isLoading={isRefundLoading}
      />
    </div>
  );
}
