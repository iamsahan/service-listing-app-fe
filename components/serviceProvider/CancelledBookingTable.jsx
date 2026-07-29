import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import formatTime12Hour from "../ticketing/timeFormatter";
import StatusBadge from "./StatusBadge";
import { providerAPI } from "@/api/provider";

const CancelledBookingTable = ({ activeFilter, onRowClick }) => {
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCancelledBookings = async () => {
      if (activeFilter !== "Cancelled") return;

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching cancelled bookings...");

        const response = await providerAPI.getProviderCancelledBookings();
        console.log("Cancelled bookings response:", response);

        // Handle different possible response structures
        if (response?.data) {
          const cancelledData = Array.isArray(response.data)
            ? response.data
            : response.data.data || response.data.bookings || [];

          const finalData = Array.isArray(cancelledData) ? cancelledData : [];

          // Don't filter by date - show all cancelled bookings
          console.log("All cancelled bookings:", finalData);
          setCancelledBookings(finalData);
        } else {
          console.log("No data in response, setting empty array");
          setCancelledBookings([]);
        }
      } catch (error) {
        console.error("Error fetching cancelled bookings:", error);
        setError("Failed to load cancelled bookings");
        setCancelledBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCancelledBookings();
  }, [activeFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">
          Loading cancelled bookings...
        </span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-full">
      {/* Cancelled Bookings Table */}
      <div className="overflow-x-auto min-h-[540px] shadow rounded-md max-w-[22rem] lg:max-w-full">
        <table className="min-w-full">
          <thead className="bg-red-50">
            <tr>
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                Booking ID
              </th>
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                User ID
              </th>
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                Date & Time
              </th>
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                Cancellation Reason
              </th>
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                Penalty
              </th>
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                Total Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {cancelledBookings?.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    No cancelled bookings found.
                  </div>
                </td>
              </tr>
            ) : (
              cancelledBookings.map((booking) => {
                // Safety check for booking object
                if (!booking || typeof booking !== "object") {
                  console.warn("Invalid booking object:", booking);
                  return null;
                }

                // Ensure required properties exist - map API response to expected format
                const safeBooking = {
                  booking_id: booking.booking_id || "N/A",
                  booking_date:
                    booking.booking_date ||
                    new Date().toISOString().split("T")[0],
                  start_time: booking.booking_start_time || "00:00",
                  end_time: booking.booking_end_time || "00:00",
                  status: "cancelled",
                  customer: { name: `User ${booking.user_id || "Unknown"}` },
                  cancellation_reason:
                    booking.cancellation_reason ||
                    booking.reason ||
                    "No reason provided",
                  cancelled_by: booking.cancelled_by || "Provider",
                  cancelled_at: booking.cancellation_time || booking.updated_at,
                  penalty_amount: booking.penalty_amount || "0.00",
                  penalty_applied: booking.penalty_applied || false,
                  cancellation_category:
                    booking.cancellation_category || "other",
                  booking_total_amount: booking.booking_total_amount || "0.00",
                  ...booking,
                };

                const dateTime = `${new Date(
                  safeBooking.booking_date
                ).toDateString()}, ${formatTime12Hour(
                  safeBooking.start_time
                )} - ${formatTime12Hour(safeBooking.end_time)}`;

                return (
                  <tr
                    key={`${safeBooking.booking_id}-${safeBooking.id}`}
                    className="border-b last:border-none text-sm hover:bg-red-50 cursor-pointer"
                  >
                    <td className="py-4 px-4 font-medium">
                      {safeBooking.booking_id}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      User {safeBooking.user_id}
                    </td>
                    <td className="py-4 px-4">{dateTime}</td>
                    <td className="py-4 px-4 max-w-xs">
                      <div
                        className="truncate"
                        title={safeBooking.cancellation_reason}
                      >
                        {safeBooking.cancellation_reason}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Category: {safeBooking.cancellation_category}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {safeBooking.penalty_applied ? (
                        <div className="text-red-600 font-medium">
                          ${safeBooking.penalty_amount}
                        </div>
                      ) : (
                        <div className="text-green-600 font-medium">
                          No Penalty
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-medium">
                      ${safeBooking.booking_total_amount}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {cancelledBookings?.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 bg-red-50 p-3 rounded">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Total Cancelled Bookings:</strong>{" "}
              {cancelledBookings.length}
            </div>
            <div>
              <strong>With Penalty:</strong>{" "}
              {cancelledBookings.filter((b) => b.penalty_applied).length}
            </div>
            <div>
              <strong>Total Penalty Amount:</strong> $
              {cancelledBookings
                .filter((b) => b.penalty_applied)
                .reduce((sum, b) => sum + parseFloat(b.penalty_amount || 0), 0)
                .toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelledBookingTable;
