import formatTime12Hour from "../ticketing/timeFormatter";
import StatusBadge from "./StatusBadge";
import CancelledBookingTable from "./CancelledBookingTable";
import CountdownTimer from "../ui/CountdownTimer";
import timeoutManager from "../../utils/timeoutManager";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { useMobile } from "@/src/hooks/useMobile";

const filters = ["Requests", "Upcoming", "Ongoing", "History", "Cancelled"];

const BookingTable = ({
  bookings,
  onAccept,
  onReject,
  onStart,
  onStop,
  onEdit,
  onCancel,
  onPayments,
  activeFilter,
  onFilterChange,
  onRowClick,
  bookingAssignmentEvent,
}) => {
  const isMobile = useMobile();
  const [hiddenBookings, setHiddenBookings] = useState(new Set());
  const [assignmentTimeouts, setAssignmentTimeouts] = useState(new Map());
  const [timeoutRefreshTrigger, setTimeoutRefreshTrigger] = useState(0);

  // Force refresh timeouts from centralized manager
  const refreshTimeouts = useCallback(() => {
    const activeTimeouts = timeoutManager.getActiveTimeouts();
    const newMap = new Map();

    Object.entries(activeTimeouts).forEach(([bookingId, data]) => {
      newMap.set(bookingId, {
        timeoutMs: data.remainingMs,
        startTime: Date.now(),
        originalTimeout: data.originalTimeout,
      });
    });

    setAssignmentTimeouts(newMap);
    console.log(
      `Refreshed timeouts from manager:`,
      Object.keys(activeTimeouts)
    );
  }, []);

  // Initialize timeouts from centralized manager on mount
  useEffect(() => {
    console.log("Initializing BookingTable with centralized timeout manager");
    refreshTimeouts();
  }, [refreshTimeouts]);

  // Listen to timeout manager events
  useEffect(() => {
    const removeListener = timeoutManager.addListener((event) => {
      console.log("Timeout manager event:", event);

      switch (event.event) {
        case "timeout_stored":
          // Refresh timeouts when new timeout is stored
          refreshTimeouts();
          break;
        case "timeout_expired":
          // Hide the booking when timeout expires
          setHiddenBookings((prev) => new Set(prev).add(event.bookingId));
          refreshTimeouts();
          break;
        case "timeout_removed":
          // Refresh timeouts when timeout is removed
          refreshTimeouts();
          break;
        case "timeouts_cleaned":
          // Refresh after cleanup
          refreshTimeouts();
          break;
      }
    });

    return removeListener;
  }, [refreshTimeouts]);

  // Periodic refresh to keep timeouts in sync
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTimeouts();
      setTimeoutRefreshTrigger((prev) => prev + 1);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refreshTimeouts]);

  // Handle new booking assignment events - critical for showing repeat assignments
  useEffect(() => {
    if (!bookingAssignmentEvent) return;

    const { bookingId, status, eventId, receivedAt } = bookingAssignmentEvent;

    if (status === "assigned" && bookingId) {
      console.log(`Processing new assignment event for booking ${bookingId}:`, {
        eventId,
        receivedAt: receivedAt
          ? new Date(receivedAt).toLocaleTimeString()
          : "unknown",
      });

      // Unhide the booking if it was previously hidden (for repeat assignments)
      setHiddenBookings((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(bookingId)) {
          newSet.delete(bookingId);
          console.log(`Unhid booking ${bookingId} for new assignment`);
        }
        return newSet;
      });

      // Force immediate refresh of timeout data to pick up the new assignment
      refreshTimeouts();

      // Trigger UI refresh to show the newly assigned booking immediately
      setTimeoutRefreshTrigger((prev) => prev + 1);
    }
  }, [bookingAssignmentEvent, refreshTimeouts]);

  // Helper function to match booking IDs flexibly
  const isBookingMatch = useCallback((eventBookingId, bookingId) => {
    if (!eventBookingId || !bookingId) return false;

    // Direct match
    if (eventBookingId === bookingId) return true;

    // Handle format differences
    const eventBase = eventBookingId.split("-")[0];
    const bookingBase = bookingId.split("-")[0];

    return (
      eventBase === bookingBase ||
      eventBase === bookingId ||
      eventBookingId === bookingBase
    );
  }, []);

  // Handle timeout expiration - hide the booking and remove from manager
  const handleTimeout = useCallback((bookingId) => {
    console.log(`Booking ${bookingId} assignment timeout expired`);

    // Hide the booking for this session only
    setHiddenBookings((prev) => new Set(prev).add(bookingId));

    // Remove timeout data from centralized manager
    timeoutManager.removeTimeout(bookingId);
  }, []);

  // Filter out hidden bookings
  const visibleBookings = useMemo(() => {
    return (
      bookings?.filter((booking) => !hiddenBookings.has(booking.booking_id)) ||
      []
    );
  }, [bookings, hiddenBookings]);

  // Debug timeout manager state
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      window.getTimeoutDebugInfo = () => {
        return {
          timeoutManager: timeoutManager.getDebugInfo(),
          localTimeouts: Object.fromEntries(assignmentTimeouts),
          hiddenBookings: Array.from(hiddenBookings),
          visibleBookingsCount: visibleBookings.length,
        };
      };
    }
  }, [assignmentTimeouts, hiddenBookings, visibleBookings.length]);
  return (
    <div className="w-full max-w-[88vw]">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold">Bookings</h3>
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                activeFilter === filter
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Rendering: Show CancelledBookingTable for Cancelled filter */}
      {activeFilter === "Cancelled" ? (
        <CancelledBookingTable
          activeFilter={activeFilter}
          onRowClick={onRowClick}
        />
      ) : (
        /* Regular Booking Table */
        <div className="overflow-x-auto min-h-[540px] shadow rounded-md max-w-[22rem] lg:max-w-full">
          <table className="min-w-full">
            <thead className="bg-gray-100/75">
              <tr>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Booking ID
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                  Customer
                </th>
                <th className="py-4 px-4 text-nowrap text-left text-sm font-semibold text-gray-700">
                  Date & Time
                </th>
                <th className="py-4 px-4 text-nowrap text-left text-sm font-semibold text-gray-700">
                  Status / Action
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                visibleBookings.map((b) => {
                  const dateTime = `${new Date(
                    b.booking_date
                  ).toDateString()}, ${formatTime12Hour(
                    b.start_time
                  )} - ${formatTime12Hour(b.end_time)}`;

                  let actionElement;
                  switch (b.status) {
                    case "pending":
                      actionElement = (
                        <button
                          onClick={() => onAccept(b)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                        >
                          Accept
                        </button>
                      );
                      break;

                    case "assigned":
                      actionElement = (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onReject(b)}
                            className="border px-3 py-1 rounded-md"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() => onAccept(b)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => onRowClick(b)}
                            className="border px-3 py-1 rounded-md"
                          >
                            Details
                          </button>
                        </div>
                      );
                      break;

                    case "accepted":
                      actionElement = (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onStart(b)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => onCancel(b)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => onRowClick(b)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                          >
                            Details
                          </button>
                        </div>
                      );
                      break;

                    case "ongoing":
                    case "in_progress":
                      actionElement = (
                        <div className="grid grid-cols-2 w-48 sm:w-auto sm:flex flex-wrap gap-2">
                          <button
                            onClick={() => onStop(b)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Stop
                          </button>
                          <button
                            onClick={() => onRowClick(b)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onEdit(b)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPayments(b);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Payments
                          </button>
                        </div>
                      );
                      break;

                    case "cancelled":
                    case "completed":
                    case "rejected":
                    case "stopped":
                      actionElement = (
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={b.status} />
                        </div>
                      );
                      break;

                    default:
                      actionElement = <StatusBadge status={b.status} />;
                      break;
                  }

                  return (
                    <React.Fragment key={b.booking_id}>
                      <tr className="border-b last:border-none text-sm hover:bg-muted/50 cursor-pointer z-0">
                        <td className="py-4 px-4">{b.booking_id}</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {b.customer?.name}
                        </td>
                        <td className="py-4 px-4 text-nowrap">
                          {isMobile
                            ? dateTime.split(",").map((s) => (
                                <>
                                  {s} <br />
                                </>
                              ))
                            : dateTime}
                        </td>
                        <td className="py-4 px-4 z-10">{actionElement}</td>
                      </tr>

                      {/* Show countdown timer row for assigned bookings */}
                      {b.status === "assigned" && (
                        <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                          <td colSpan="4" className="py-3 px-4">
                            <div className="flex items-center justify-center gap-3">
                              {(() => {
                                // Get real-time remaining time from timeout manager
                                const remainingTimeData =
                                  timeoutManager.getRemainingTime(b.booking_id);

                                if (
                                  remainingTimeData &&
                                  !remainingTimeData.hasExpired
                                ) {
                                  return (
                                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                                      <Clock className="h-4 w-4 text-amber-600" />
                                      <span className="text-sm font-medium text-gray-700">
                                        Assignment expires in:
                                      </span>
                                      <CountdownTimer
                                        key={`${b.booking_id}-${timeoutRefreshTrigger}`}
                                        timeoutMs={
                                          remainingTimeData.remainingMs
                                        }
                                        onTimeout={() =>
                                          handleTimeout(b.booking_id)
                                        }
                                        className=""
                                        showProgress={true}
                                        prefix=""
                                      />
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-orange-200 shadow-sm">
                                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                                      <span className="text-sm font-medium text-orange-700">
                                        Assignment pending - Loading timeout
                                        data...
                                      </span>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
