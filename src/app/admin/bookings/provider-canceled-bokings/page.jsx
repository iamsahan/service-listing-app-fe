"use client";
import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  AlertTriangleIcon,
  BuildingIcon,
  CreditCardIcon,
  RefreshCwIcon,
  XIcon,
  UsersIcon,
  PhoneIcon,
  MailIcon,
} from "lucide-react";
import { format } from "date-fns";
import { adminBookingService } from "@api/adminBookingService";
import { toast } from "react-hot-toast";
import CancelledBookingsProviderTab from "@/components/booking/CancelledBookingsProviderTab";
import ReassignedBookingsProviderTab from "@/components/booking/ReassignedBookingsProviderTab";

const ProviderCancelledBookingsPage = () => {
  // Refs to access tab component methods
  const cancelledTabRef = useRef();
  const reassignedTabRef = useRef();

  // Tab and dialog states
  const [activeTab, setActiveTab] = useState("cancelled");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Provider assignment state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [eligibleProviders, setEligibleProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Reschedule dialog state
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");

  const handlePenaltyAction = async (bookingId, action) => {
    try {
      // This would call the penalty handling API
      const response = await adminBookingService.handleCancelledBookingPanalty({
        bookingId,
        action,
      });
      toast.success(`Penalty ${action} successfully`);
      // Tab components will handle their own data refresh
    } catch (error) {
      console.error("Error handling penalty:", error);
      toast.error(`Failed to ${action} penalty`);
    }
  };

  const getTimeSinceCancellation = (cancellationTime) => {
    const now = new Date();
    const cancelled = new Date(cancellationTime);
    const diffInHours = Math.floor((now - cancelled) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Less than 1 hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return "N/A";
    try {
      return format(new Date(`${date}T${time}`), "MMM dd, yyyy - hh:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPenaltyStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "waived":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const viewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const closeDetailsDialog = () => {
    setShowDetailsDialog(false);
    setSelectedBooking(null);
  };

  // Provider assignment functions
  const handleAssignProvider = async (booking) => {
    setSelectedBooking(booking);
    setAssignDialogOpen(true);
    setProvidersLoading(true);
    try {
      const response =
        await adminBookingService.getEligibleProvidersForManualAssignment(
          booking.booking_id
        );
      setEligibleProviders(
        response.map((p) => ({
          provider_id: p.providerId,
          business_type: p.businessType,
          city_id: p.cityId,
          distance: p.distance,
          name: p.name,
          email: p.email,
          mobile: p.mobile,
          serviceLocation: p.serviceLocation,
          ...p,
        }))
      );
    } catch (error) {
      console.error("Error fetching eligible providers:", error);
      toast.error("Failed to fetch eligible providers");
      setEligibleProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedBooking(null);
    setEligibleProviders([]);
  };

  const handleProviderAssignment = async (booking, provider) => {
    setAssigning(true);
    try {
      await adminBookingService.assignProviderToBooking(
        booking.booking_id,
        provider.providerId || provider.provider_id
      );
      toast.success("Provider assigned successfully");
      closeAssignDialog();

      // Refetch data in both tabs after successful assignment
      if (cancelledTabRef.current) {
        cancelledTabRef.current.refetch();
      }
      if (reassignedTabRef.current) {
        reassignedTabRef.current.refetch();
      }
    } catch (error) {
      console.error("Error assigning provider:", error);
      toast.error("Failed to assign provider");
    } finally {
      setAssigning(false);
    }
  };

  // Reschedule booking functions
  const handleRescheduleBooking = (booking) => {
    setBookingToReschedule(booking);
    setShowRescheduleDialog(true);
    setRescheduleReason("");
  };

  const handleRescheduleDialogClose = () => {
    setShowRescheduleDialog(false);
    setBookingToReschedule(null);
    setRescheduleReason("");
  };

  const handleConfirmReschedule = async () => {
    setRescheduling(true);
    try {
      await adminBookingService.rescheduleBooking(
        bookingToReschedule?.booking_id,
        rescheduleReason
      );
      handleRescheduleDialogClose();
      fetchCancelledBookings(); // Refresh list
      toast.success("Booking rescheduled successfully");
    } catch (err) {
      console.error("Error rescheduling booking:", err);
      toast.error(err?.message || "Failed to reschedule booking");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Provider Cancelled Bookings
          </h1>
          <p className="text-gray-600">
            Manage and review bookings cancelled by service providers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "cancelled"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4" />
                Cancelled Bookings
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reassigned")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "reassigned"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Reassigned Bookings
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "cancelled" ? (
            <CancelledBookingsProviderTab
              ref={cancelledTabRef}
              onViewDetails={viewDetails}
              onAssignProvider={handleAssignProvider}
              formatDateTime={formatDateTime}
              formatCurrency={formatCurrency}
            />
          ) : (
            <ReassignedBookingsProviderTab
              ref={reassignedTabRef}
              onViewDetails={viewDetails}
              formatDateTime={formatDateTime}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>

      {/* Details Dialog */}
      {showDetailsDialog && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Booking Details - #{selectedBooking.booking_id}
                </h3>
                <button
                  onClick={closeDetailsDialog}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.customer?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.customer?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.customer?.mobile || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Check if booking is reassigned */}
                {selectedBooking.reassignment_successful ? (
                  // Show both original and newly assigned provider
                  <div className="space-y-4">
                    {/* Original Provider (who cancelled) */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4" />
                        Original Provider (Cancelled)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <BuildingIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {selectedBooking.cancelledProvider?.business_name ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {selectedBooking.cancelledProvider?.user?.name ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {selectedBooking.cancelledProvider?.user?.mobile ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Newly Assigned Provider */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4" />
                        Newly Assigned Provider
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <BuildingIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {selectedBooking.newlyAssignedProvider
                              ?.business_name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {selectedBooking.newlyAssignedProvider?.user
                              ?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {selectedBooking.newlyAssignedProvider?.user
                              ?.mobile || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show only original provider for cancelled bookings
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <BuildingIcon className="h-4 w-4" />
                      Provider Information (Cancelled)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {selectedBooking.cancelledProvider?.business_name ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {selectedBooking.cancelledProvider?.user?.name ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {selectedBooking.cancelledProvider?.user?.mobile ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Booking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date & Time:</span>
                    <p className="font-medium">
                      {formatDateTime(
                        selectedBooking.booking?.booking_date,
                        selectedBooking.booking?.start_time
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">
                      {selectedBooking.booking?.start_time} -{" "}
                      {selectedBooking.booking?.end_time}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">City:</span>
                    <p className="font-medium">
                      {selectedBooking.booking?.city?.name || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <span className="text-gray-600">Service Address:</span>
                    <p className="font-medium">
                      {selectedBooking.booking?.service_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangleIcon className="h-4 w-4" />
                  Cancellation Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-red-600">Cancelled At:</span>
                    <p className="font-medium text-red-900">
                      {format(
                        new Date(selectedBooking.cancellation_time),
                        "MMM dd, yyyy - hh:mm a"
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-red-600">Penalty Amount:</span>
                    <p className="font-medium text-red-900">
                      {formatCurrency(selectedBooking.penalty_amount)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-red-600">Reason:</span>
                    <p className="font-medium text-red-900 bg-red-100 p-2 rounded mt-1">
                      {selectedBooking.cancellation_reason ||
                        "No reason provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Items */}
              {selectedBooking.BookingItems && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">
                    Service Items
                  </h4>
                  <div className="space-y-3">
                    {selectedBooking.BookingItems.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 border border-purple-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-purple-900">
                              {item.serviceItem?.name || item.packageItem?.name}
                            </h5>
                            <p className="text-sm text-purple-600">
                              Quantity: {item.quantity} ×{" "}
                              {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-900">
                              {formatCurrency(item.total_price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Details */}
              {selectedBooking.BookingPayment && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-yellow-600">Subtotal:</span>
                      <p className="font-semibold text-yellow-900">
                        {formatCurrency(
                          selectedBooking.BookingPayment?.subtotal || 0
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-yellow-600">Tax:</span>
                      <p className="font-semibold text-yellow-900">
                        {formatCurrency(
                          selectedBooking.BookingPayment?.tax_amount || 0
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-yellow-600">Total:</span>
                      <p className="font-semibold text-yellow-900">
                        {formatCurrency(
                          selectedBooking.BookingPayment?.total_amount || 0
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-yellow-600">Payment Status:</span>
                      <Badge
                        className={getStatusColor(
                          selectedBooking.BookingPayment?.payment_status
                        )}
                      >
                        {selectedBooking.BookingPayment?.payment_status ||
                          "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDetailsDialog}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                {/* {activeTab === "cancelled" &&
                  !selectedBooking.penalty_status && (
                    <button
                      onClick={() =>
                        handlePenaltyAction(selectedBooking.booking_id, "waive")
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Waive Penalty
                    </button>
                  )} */}
                {activeTab === "cancelled" && (
                  <button
                    onClick={() => {
                      closeDetailsDialog();
                      handleAssignProvider(selectedBooking);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Assign Provider
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Assignment Dialog */}
      {assignDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] max-w-[95vw] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Assign New Provider for Booking #{selectedBooking?.booking_id}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-700 p-1"
                onClick={closeAssignDialog}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Service Date:</strong>{" "}
                {selectedBooking &&
                  formatDateTime(
                    selectedBooking.booking?.booking_date,
                    selectedBooking.booking?.start_time
                  )}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Address:</strong>{" "}
                {selectedBooking?.booking?.service_address}
              </p>
              <p className="text-sm text-blue-800">
                <strong>City:</strong> {selectedBooking?.booking?.city?.name}
              </p>
            </div>

            {providersLoading ? (
              <div className="py-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Loading eligible providers...
              </div>
            ) : eligibleProviders.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-lg font-medium">
                  No eligible providers found
                </p>
                <p className="text-sm">
                  There are no available providers for this booking at the
                  moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Available Providers ({eligibleProviders.length})
                </h4>
                {eligibleProviders.map((provider) => (
                  <div
                    key={provider.provider_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-semibold text-gray-900">
                            {provider.name}
                          </h5>
                          {provider.business_type && (
                            <Badge variant="outline" className="text-xs">
                              {provider.business_type}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Email:</strong> {provider.email}
                          </p>
                          <p>
                            <strong>Mobile:</strong> {provider.mobile}
                          </p>
                          {provider.distance && (
                            <p>
                              <strong>Distance:</strong> {provider.distance} km
                            </p>
                          )}
                          {provider.rating && (
                            <p>
                              <strong>Rating:</strong> {provider.rating}/5
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm ml-3 disabled:opacity-50"
                        disabled={assigning}
                        onClick={() =>
                          handleProviderAssignment(selectedBooking, provider)
                        }
                      >
                        {assigning ? "Assigning..." : "Assign"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeAssignDialog}
                disabled={assigning}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Confirmation Dialog */}
      {showRescheduleDialog && bookingToReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Reschedule Booking
                </h3>
                <button
                  onClick={handleRescheduleDialogClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Booking Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">
                  Booking Details
                </h4>
                <div className="text-sm text-orange-800 space-y-1">
                  <p>
                    <strong>Booking ID:</strong> #
                    {bookingToReschedule.booking_id}
                  </p>
                  <p>
                    <strong>Customer:</strong>{" "}
                    {bookingToReschedule.customer?.name}
                  </p>
                  <p>
                    <strong>Service Date:</strong>{" "}
                    {formatDateTime(
                      bookingToReschedule.booking?.booking_date,
                      bookingToReschedule.booking?.start_time
                    )}
                  </p>
                  <p>
                    <strong>Provider:</strong>{" "}
                    {bookingToReschedule.cancelledProvider?.business_name}
                  </p>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reschedule Reason
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Please provide a reason for rescheduling this booking..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <p>
                      Rescheduling this booking will move it back to the pending
                      queue for reassignment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleRescheduleDialogClose}
                disabled={rescheduling}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={rescheduling || !rescheduleReason.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                {rescheduling && (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                )}
                {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderCancelledBookingsPage;
