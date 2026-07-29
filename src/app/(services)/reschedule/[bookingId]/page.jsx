"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { cartService } from "@/api/cartService";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@hooks/use-toast";
import { format } from "date-fns";

const ReschedulePage = () => {
  const { bookingId } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [newBookingDate, setNewBookingDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await cartService.getBookingDataById(bookingId);
      console.log("Booking response:", response); // Debug log

      // Handle different response structures
      const bookingData = response.booking || response.data || response;
      setBooking(bookingData);

      // Set current values as default
      if (bookingData) {
        setNewBookingDate(bookingData.booking_date);
        setNewStartTime(bookingData.start_time);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!newBookingDate || !newStartTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      setRescheduling(true);

      const rescheduleData = {
        newBookingDate: newBookingDate,
        newStartTime: newStartTime,
      };

      await cartService.rescheduleBooking(bookingId, rescheduleData);

      toast({
        title: "Success",
        description: "Booking rescheduled successfully!",
        variant: "default",
      });

      // Redirect back to bookings or previous page
      router.push("/profile/customer/bookings");
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule booking",
        variant: "destructive",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      await cartService.customerCancellRescheduleBooking(bookingId);

      toast({
        title: "Success",
        description: "Booking cancelled successfully!",
        variant: "default",
      });

      setShowCancelDialog(false);
      // Redirect back to bookings
      router.push("/profile/customer/bookings");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.8s",
              }}
            ></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The booking you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Check if booking status is not cancelled
  if (booking.status !== "cancelled" && booking.status !== "reschedule") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-orange-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Booking Already Rescheduled
          </h2>
          <p className="text-gray-600 mb-2">
            This booking has already been rescheduled and cannot be rescheduled
            again.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Booking ID:</span>{" "}
              {booking.booking_id}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Current Status:</span>{" "}
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : booking.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status}
              </span>
            </p>
            {booking.booking_date && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Scheduled for:</span>{" "}
                {formatDate(booking.booking_date)}
                {booking.start_time && ` at ${booking.start_time}`}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/profile/customer/bookings")}
              className="inline-flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Current Booking Details - Left Side */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Customer Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {booking.user_id || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Current Schedule
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(booking.booking_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {booking.location && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Location
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status || "N/A"}
                    </span>
                  </div>
                  {booking.BookingPayment?.total_amount && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        Total Amount
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(booking.BookingPayment.total_amount)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Services */}
                {booking.BookingItems && booking.BookingItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      Services Booked
                    </h3>
                    <div className="space-y-2">
                      {booking.BookingItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.serviceItem?.name ||
                                item.packageItem?.name ||
                                "Service"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.total_price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reschedule Form - Right Side */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                    Select Date
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }, (_, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() + index);

                      const dateString = format(date, "yyyy-MM-dd");
                      const dayName =
                        index === 0
                          ? "Today"
                          : index === 1
                            ? "Tomorrow"
                            : format(date, "EEE, MMM dd");
                      const dayNumber = format(date, "dd");
                      const monthName = format(date, "MMM");

                      const isSelected = newBookingDate === dateString;

                      return (
                        <button
                          key={index}
                          onClick={() => setNewBookingDate(dateString)}
                          className={`p-4 border-2 rounded-xl text-center transition-all duration-300 hover:border-indigo-300 hover:shadow-md transform hover:scale-105 ${
                            isSelected
                              ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 shadow-lg"
                              : "border-gray-200 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-500 mb-1">
                            {dayName}
                          </div>
                          <div className="text-2xl font-bold mb-1">
                            {dayNumber}
                          </div>
                          <div className="text-xs font-medium text-gray-500">
                            {monthName}
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-indigo-600 mx-auto mt-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                    Select Time Slot
                  </h3>

                  <div className="relative">
                    <select
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-4 py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 appearance-none text-lg"
                    >
                      <option value="">Choose a time</option>
                      {/* Generate time slots from 8:00 AM to 7:30 PM */}
                      {(() => {
                        const timeSlots = [];

                        for (let hour = 8; hour < 20; hour++) {
                          const time24_00 = `${hour
                            .toString()
                            .padStart(2, "0")}:00`;
                          const time12_00 =
                            hour === 12
                              ? "12:00 PM"
                              : hour > 12
                                ? `${hour - 12}:00 PM`
                                : `${hour}:00 AM`;

                          timeSlots.push(
                            <option key={`${hour}-00`} value={time24_00}>
                              {time12_00}
                            </option>,
                          );

                          if (hour < 19 || (hour === 19 && true)) {
                            const time24_30 = `${hour
                              .toString()
                              .padStart(2, "0")}:30`;
                            const time12_30 =
                              hour === 12
                                ? "12:30 PM"
                                : hour > 12
                                  ? `${hour - 12}:30 PM`
                                  : `${hour}:30 AM`;

                            timeSlots.push(
                              <option key={`${hour}-30`} value={time24_30}>
                                {time12_30}
                              </option>,
                            );
                          }
                        }
                        return timeSlots;
                      })()}
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  {/* Primary Action Button */}
                  <Button
                    onClick={handleReschedule}
                    disabled={rescheduling || !newBookingDate || !newStartTime}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rescheduling ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Rescheduling...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Confirm Reschedule
                      </div>
                    )}
                  </Button>

                  {/* Secondary Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 text-base font-semibold rounded-xl transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(true)}
                      className="flex-1 border-2 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700 hover:bg-red-50 py-3 text-base font-semibold rounded-xl transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Booking ID:
              </span>
              <span className="text-sm text-gray-900 font-mono">
                {booking?.booking_id}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Date:</span>
              <span className="text-sm text-gray-900">
                {booking?.booking_date
                  ? formatDate(booking.booking_date)
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Time:</span>
              <span className="text-sm text-gray-900">
                {booking?.start_time} - {booking?.end_time}
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelling}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Yes, Cancel Booking
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReschedulePage;
