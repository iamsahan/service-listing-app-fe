"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Views } from "react-big-calendar";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

import EmployeeSelectionModal from "@/components/serviceProvider/modals/EmployeeSelectionModal";
import ConfirmationModal from "@/components/serviceProvider/modals/ConfirmationModal";
import RejectBookingModal from "@/components/serviceProvider/modals/RejectBookingModal";
import CancelBookingModal from "@/components/serviceProvider/modals/CancelBookingModal";
import PenaltyDetailsModal from "@/components/serviceProvider/modals/PenaltyDetailsModal";
import BookingDetailsModal from "@/components/booking/BookingDetailsModal";
import BookingPaymentsModal from "@/components/booking/BookingPaymentsModal";
import ProviderBookingEditModel from "@/components/business-employee/ProviderBookingEditModel";
import BookingStartModal from "@/components/business-employee/BookingStartModal";
import BookingStopModal from "@/components/business-employee/BookingStopModal";
import BookingCalendar from "@/components/serviceProvider/calendar/BookingCalendar";
import TodaysSummary from "@/components/serviceProvider/TodaysSummary";
import BookingTable from "@/components/serviceProvider/BookingTable";
import StatBox from "@/components/serviceProvider/StatBox";

import { useProfileRefresh } from "@/src/context/ProfileRefreshContext";
import { useSocketNotifications } from "@/src/context/SocketNotificationContext";
import withSuspensionCheck from "@/src/hoc/withSuspensionCheck";
import { providerAPI } from "@/api/provider";

const Page = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [user, setUser] = useState();
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [acceptedBookings, setAcceptedBookings] = useState(null);
  const [bookingRequests, setBookingRequests] = useState();
  const [bookingDates, setBookingDates] = useState();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isStartModalOpen, setStartModalOpen] = useState(false);
  const [isStopModalOpen, setStopModalOpen] = useState(false);
  const [selectedBookingForStart, setSelectedBookingForStart] = useState(null);
  const [selectedBookingForStop, setSelectedBookingForStop] = useState(null);
  const [ongoingBookings, setOngoingBookings] = useState([]);
  const [isBookingEdit, setIsBookingEdit] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [bookingToReject, setBookingToReject] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [selectedBookingForPayments, setSelectedBookingForPayments] =
    useState(null);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [penaltyDetails, setPenaltyDetails] = useState(null);
  const [activeTableFilter, setActiveTableFilter] = useState("Requests");
  const [bookingStats, setBookingStats] = useState({
    completed: 0,
    upcoming: 0,
    today: {
      completed: 0,
      pending: 0,
      cancelled: 0,
    },
  });

  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNewAssignment, setHasNewAssignment] = useState(false);

  const { refreshKey } = useProfileRefresh();
  const { bookingAssignmentEvent, clearEvent, socket } =
    useSocketNotifications();

  // Handle real-time booking assignment updates
  useEffect(() => {
    if (
      bookingAssignmentEvent &&
      bookingAssignmentEvent.status === "assigned"
    ) {
      console.log("New booking assignment received:", bookingAssignmentEvent);

      // Show visual indicator for new assignment
      setHasNewAssignment(true);

      // Auto-clear the indicator after 5 seconds
      setTimeout(() => setHasNewAssignment(false), 5000);

      // Refresh booking requests to show the new assignment
      if (providerId) {
        const fetchBookingRequests = async () => {
          try {
            const response = await providerAPI.getProviderBookingRequests(
              providerId
            );
            console.log("Updated booking requests:", response.data.data);
            setBookingRequests(response.data.data);

            // If currently viewing the Requests tab, this will show the new booking immediately
            if (activeTableFilter === "Requests") {
              console.log(
                "Requests tab is active, new booking will be visible"
              );
            }
          } catch (error) {
            console.error("Error refreshing booking requests:", error);
          }
        };

        fetchBookingRequests();
      }

      // Clear the event after processing to prevent duplicate handling
      clearEvent("booking_assignment_update");
    }
  }, [bookingAssignmentEvent, providerId, activeTableFilter, clearEvent]);

  // Memoized handlers to prevent unnecessary re-renders
  const refreshBookings = useCallback(async () => {
    if (!providerId) return;

    setIsRefreshing(true);
    try {
      // Fetch main bookings
      const response = await providerAPI.getProviderBookings(providerId);
      if (Array.isArray(response.data)) {
        const formattedBookings = response.data.map((booking) => ({
          id: booking.booking_id,
          title: booking.booking_id,
          start: new Date(`${booking.booking_date}T${booking.start_time}`),
          end: new Date(`${booking.booking_date}T${booking.end_time}`),
          details: booking,
        }));

        const acceptBookings = response.data.filter(
          (booking) => booking.status === "accepted"
        );

        const ongingBookings = response.data.filter(
          (booking) => booking.status === "in_progress"
        );

        setBookings(response.data);
        setBookingDates(formattedBookings);
        setOngoingBookings(ongingBookings);
        setAcceptedBookings(acceptBookings);
      }

      // Fetch booking requests
      const requestsResponse = await providerAPI.getProviderBookingRequests(
        providerId
      );
      setBookingRequests(requestsResponse.data.data);

      setError(null);
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      setError("Failed to refresh bookings");
    } finally {
      setIsRefreshing(false);
    }
  }, [providerId]);

  // Listen for booking acceptance/rejection events from dialog
  useEffect(() => {
    const handleBookingAccepted = () => {
      console.log("Booking accepted event received, refreshing data...");
      if (providerId) {
        refreshBookings();
      }
    };

    const handleBookingRejected = () => {
      console.log("Booking rejected event received, refreshing data...");
      if (providerId) {
        refreshBookings();
      }
    };

    const handleBookingExpired = () => {
      console.log("Booking expired event received, refreshing data...");
      if (providerId) {
        refreshBookings();
      }
    };

    window.addEventListener("booking-accepted", handleBookingAccepted);
    window.addEventListener("booking-rejected", handleBookingRejected);
    window.addEventListener("booking-expired", handleBookingExpired);

    return () => {
      window.removeEventListener("booking-accepted", handleBookingAccepted);
      window.removeEventListener("booking-rejected", handleBookingRejected);
      window.removeEventListener("booking-expired", handleBookingExpired);
    };
  }, [providerId, refreshBookings]);

  const handleConfirmCancel = useCallback(async () => {
    try {
      if (!cancellationReason.trim()) {
        alert("Please provide a cancellation reason");
        return;
      }

      await providerAPI.providerCancellAcceptedBookings(
        bookingToCancel.booking_id,
        {
          providerId: providerId,
          cancellationReason: cancellationReason.trim(),
        }
      );

      refreshBookings();

      // Reset states
      setShowCancelModal(false);
      setCancellationReason("");
      setBookingToCancel(null);

      // Refresh bookings data
      const response = await providerAPI.getProviderBookings(providerId);
      if (Array.isArray(response.data)) {
        setBookings(response.data);

        const acceptBookings = response.data.filter(
          (booking) => booking.status === "accepted"
        );
        setAcceptedBookings(acceptBookings);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  }, [cancellationReason, bookingToCancel, providerId]);

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        setUser(user);

        if (!user?.uId) {
          setError("Please log in to view bookings");
          setLoading(false);
          return;
        }

        const response = await providerAPI.getProviderByUserId(user.uId);
        if (response.data && response.data.provider_id) {
          setProviderId(response.data.provider_id);
        } else {
          setError("Provider information not found");
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
        setError("Failed to load provider information");
        setLoading(false);
      }
    };

    fetchProviderId();
  }, []);

  // Fetch booking requests from new endpoint
  useEffect(() => {
    if (!providerId) return;
    const fetchBookingRequests = async () => {
      try {
        const response = await providerAPI.getProviderBookingRequests(
          providerId
        );

        console.log(response.data.data);
        // Map to match old structure for bookingRequests
        setBookingRequests(response.data.data);
      } catch (error) {
        console.error("Error fetching booking requests:", error);
      }
    };

    const fetchBookingStats = async () => {
      try {
        const statsResponse = await providerAPI.getBookingsStats();
        if (statsResponse?.data) {
          setBookingStats(statsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching booking stats:", err);
      }
    };

    fetchBookingStats();
    fetchBookingRequests();
  }, [providerId]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!providerId) return;

      try {
        const response = await providerAPI.getProviderBookings(providerId);
        if (Array.isArray(response.data)) {
          const formattedBookings = response.data.map((booking) => ({
            id: booking.booking_id,
            title: booking.booking_id,
            start: new Date(`${booking.booking_date}T${booking.start_time}`),
            end: new Date(`${booking.booking_date}T${booking.end_time}`),
            details: booking,
          }));

          const acceptBookings = response.data.filter(
            (booking) => booking.status === "accepted"
          );

          const ongingBookings = response.data.filter(
            (booking) => booking.status === "in_progress"
          );

          setBookings(response.data);
          setBookingDates(formattedBookings);
          setOngoingBookings(ongingBookings);
          setAcceptedBookings(acceptBookings);

          setError(null);
        } else {
          setError("No Active Bookings Found");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("No Active Bookings Found");
      } finally {
        setLoading(false);
      }
    };

    if (providerId) {
      fetchBookings();
    }
  }, [
    providerId,
    isBookingEdit,
    isDialogOpen,
    isStartModalOpen,
    showEmployeeModal,
    showConfirmationModal,
    refreshKey,
  ]);

  const getFilteredBookings = () => {
    switch (activeTableFilter) {
      case "Upcoming":
        return acceptedBookings || [];
      case "Ongoing":
        return ongoingBookings || [];
      case "Requests":
        return bookingRequests || [];
      case "History":
        return bookings?.filter((b) =>
          ["completed", "cancelled", "rejected", "stopped"].includes(b.status)
        );
      default:
        return bookings || [];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const handleCalenderEventSelect = (event) => {
    setSelectedBooking(event?.details);
    setDialogOpen(true);
  };

  const handleRowSelect = (booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  const handleOrderAcceptence = async (booking) => {
    try {
      setSelectedBooking(booking);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error handling booking acceptance:", error);
    }
  };

  const handleOrderRejection = async (booking) => {
    try {
      setBookingToReject(booking);
      setShowRejectModal(true);
    } catch (error) {
      console.error("Error handling booking rejection:", error);
    }
  };

  const handleConfirmReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        alert("Please provide a rejection reason");
        return;
      }

      await providerAPI.RejectProviderBookings(bookingToReject.assignment_id, {
        providerId: providerId,
        rejectionReason: rejectionReason.trim(),
      });

      refreshBookings();

      // Reset states
      setShowRejectModal(false);
      setRejectionReason("");
      setBookingToReject(null);

      // Refresh booking requests
      const response = await providerAPI.getProviderBookingRequests(providerId);

      console.log(response.data.data);
      setBookingRequests(response.data.data);
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Failed to reject booking. Please try again.");
    }
  };

  const handleBookingCancellation = async (booking) => {
    try {
      setBookingToCancel(booking);

      // First get penalty details
      const penaltyResponse = await providerAPI.getProviderCancellationPenalty(
        booking.booking_id,
        { providerId: providerId }
      );

      if (penaltyResponse.data) {
        setPenaltyDetails(penaltyResponse.data);
        setShowPenaltyModal(true);
      }
    } catch (error) {
      console.error("Error getting penalty details:", error);
      // Fallback to old modal if penalty API fails
      setShowCancelModal(true);
    }
  };

  const handleBookingPayments = (booking) => {
    setSelectedBookingForPayments(booking);
    setShowPaymentsModal(true);
  };

  const handlePenaltyModalConfirm = () => {
    setShowPenaltyModal(false);
    setShowCancelModal(true);
  };

  const handlePenaltyModalCancel = () => {
    setShowPenaltyModal(false);
    setPenaltyDetails(null);
    setBookingToCancel(null);
  };

  const handleConfirmation = async () => {
    try {
      if (user.role === "business_service_provider") {
        const employeesResponse = await providerAPI.getAvailableEmployees(
          providerId,
          selectedBooking.booking_id,
          selectedBooking.booking_date,
          selectedBooking.start_time,
          selectedBooking.end_time
        );

        setAvailableEmployees(employeesResponse.data.availableEmployees);
        setCurrentBookingId(selectedBooking.booking_id);
        setShowEmployeeModal(true);
      } else {
        await providerAPI.acceptProviderBookings(selectedBooking.booking_id, {
          providerId: providerId,
        });

        // Emit custom event to refresh the page
        window.dispatchEvent(
          new CustomEvent("booking-accepted", {
            detail: { bookingId: selectedBooking.booking_id },
          })
        );
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
    setShowConfirmationModal(false);
  };

  const handleEmployeeConfirmation = async () => {
    try {
      if (!selectedEmployee) {
        alert("Please select an employee");
        return;
      }

      await providerAPI.acceptProviderBookings(currentBookingId, {
        employee_id: selectedEmployee,
        providerId: providerId,
      });

      // Emit custom event to refresh the page
      window.dispatchEvent(
        new CustomEvent("booking-accepted", {
          detail: { bookingId: currentBookingId },
        })
      );

      refreshBookings();

      setShowEmployeeModal(false);
      setSelectedEmployee(null);
      setCurrentBookingId(null);
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
  };

  const handleStartBooking = async (booking) => {
    try {
      await providerAPI.sendBookingStartOtp({
        bookingId: booking.booking_id,
        userId: booking?.user_id,
        mobile: booking?.customer?.mobile,
        providerId: providerId,
      });
      // Join the booking room
      if (socket) {
        socket.emit("join-booking", booking.user_id);
      }
      setSelectedBookingForStart(booking);
      setStartModalOpen(true);
    } catch (error) {
      console.error("Error Sending Otp", error);
    }
  };

  const handleStopBooking = async (booking) => {
    try {
      await providerAPI.stopOngoingBooking({
        bookingId: booking?.booking_id,
        userId: booking?.user_id,
        mobile: booking?.customer?.mobile,
      });
      // Join the booking room
      if (socket) {
        socket.emit("join-booking", booking.user_id);
      }
      setSelectedBookingForStop(booking); // Store the selected booking
      setStopModalOpen(true);
    } catch (error) {
      console.error("Error Sending Otp", error);
    }
  };

  const handleConfirmStart = (booking) => {
    setOngoingBookings((prev) => [
      ...prev,
      { ...booking, startTime: new Date() },
    ]);
  };

  const handleConfirmStop = () => {
    setOngoingBookings();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Booking Management
          </h1>
          {hasNewAssignment && (
            <div className="animate-pulse bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              New Booking Assigned!
            </div>
          )}
        </div>
        {/* <Button
          onClick={refreshBookings}
          disabled={isRefreshing}
          variant="outline"
          className="flex bg-green-300 hover:bg-green-500 items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button> */}
      </div>
      {/* Stat boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <StatBox title="Completed Bookings" count={bookingStats.completed} />
        <StatBox title="Upcoming Bookings" count={bookingStats.upcoming} />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Booking Table */}
        <BookingTable
          bookings={getFilteredBookings()}
          onAccept={handleOrderAcceptence}
          onReject={handleOrderRejection}
          onStart={handleStartBooking}
          onEdit={() => setIsBookingEdit(true)}
          onStop={handleStopBooking}
          onCancel={handleBookingCancellation}
          onPayments={handleBookingPayments}
          activeFilter={activeTableFilter}
          onFilterChange={setActiveTableFilter}
          onRowClick={handleRowSelect}
          bookingAssignmentEvent={bookingAssignmentEvent}
        />

        {/* Today's Summary */}
        <div className="space-y-8 min-w-[300px]">
          <TodaysSummary stats={bookingStats.today} />

          <BookingCalendar
            bookingDates={bookingDates}
            view={view}
            onViewChange={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            onSelectEvent={handleCalenderEventSelect}
          />
        </div>
      </div>
      {/* Modals */}
      <PenaltyDetailsModal
        open={showPenaltyModal}
        onClose={setShowPenaltyModal}
        penaltyDetails={penaltyDetails}
        onConfirm={handlePenaltyModalConfirm}
        onCancel={handlePenaltyModalCancel}
      />
      <EmployeeSelectionModal
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        employees={availableEmployees}
        selectedEmployee={selectedEmployee}
        onSelect={setSelectedEmployee}
        onConfirm={handleEmployeeConfirmation}
      />
      <ConfirmationModal
        open={showConfirmationModal}
        onCancel={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmation}
      />
      <RejectBookingModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        booking={bookingToReject}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirm={handleConfirmReject}
      />
      <CancelBookingModal
        showCancelModal={showCancelModal}
        setShowCancelModal={setShowCancelModal}
        bookingToCancel={bookingToCancel}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        handleConfirmCancel={handleConfirmCancel}
      />
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <BookingDetailsModal booking={selectedBooking} />
      </Dialog>
      <Dialog open={isBookingEdit} onOpenChange={setIsBookingEdit}>
        <ProviderBookingEditModel
          booking={ongoingBookings?.[0] || null}
          onClose={() => setIsBookingEdit(false)}
        />
      </Dialog>
      <Dialog open={isStartModalOpen} onOpenChange={setStartModalOpen}>
        <BookingStartModal
          booking={selectedBookingForStart}
          onConfirm={handleConfirmStart}
          onClose={() => setStartModalOpen(false)}
        />
      </Dialog>
      <Dialog open={isStopModalOpen} onOpenChange={setStopModalOpen}>
        <BookingStopModal
          booking={selectedBookingForStop}
          onConfirm={handleConfirmStop}
          onClose={() => setStopModalOpen(false)}
        />
      </Dialog>
      <BookingPaymentsModal
        isOpen={showPaymentsModal}
        onClose={() => setShowPaymentsModal(false)}
        booking={selectedBookingForPayments}
      />
    </div>
  );
};

export default withSuspensionCheck(Page);
