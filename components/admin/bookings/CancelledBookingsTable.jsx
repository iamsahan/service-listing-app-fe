"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  FileText,
  Clock,
  DollarSign,
} from "lucide-react";

const CancelledBookingsTable = ({
  bookings,
  loading,
  pagination,
  onViewDetails,
  onWaveOff,
  onRefresh,
  onPageChange,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const getPenaltyStatusColor = (status) => {
    const statusColors = {
      no_penalty: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      fully_settled_advance: "bg-blue-100 text-blue-800",
      partially_settled_advance: "bg-orange-100 text-orange-800",
      apply_next_booking: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const formatPenaltyStatus = (status) => {
    const statusLabels = {
      no_penalty: "No Penalty",
      pending: "Pending",
      fully_settled_advance: "Fully Settled (Advance)",
      partially_settled_advance: "Partially Settled (Advance)",
      apply_next_booking: "Apply to Next Booking",
      completed: "Completed",
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading cancelled bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                No cancelled bookings found
              </h3>
              <p className="text-gray-500">
                There are no cancelled bookings to display.
              </p>
            </div>
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Cancelled Bookings</CardTitle>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Booking Details</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Provider</th>
                <th className="text-left p-3 font-medium">Cancellation</th>
                {/* <th className="text-left p-3 font-medium">Penalty Status</th> */}
                <th className="text-left p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.booking_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="font-medium">#{booking.booking_id}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.start_time} - {booking.end_time}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {booking.customer?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.customer?.email || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.customer?.mobile || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {booking.provider?.business_name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.provider?.User?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.provider?.User?.mobile || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-red-600">
                        {formatDate(booking.cancellation_time)}
                      </div>
                      <div className="text-sm text-gray-600">
                        By: {booking.cancelled_by}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-32">
                        {booking.cancellation_reason || "No reason provided"}
                      </div>
                    </div>
                  </td>
                  {/* <td className="p-3">
                    <Badge
                      className={getPenaltyStatusColor(booking.penalty_status)}
                    >
                      {formatPenaltyStatus(booking.penalty_status)}
                    </Badge>
                  </td> */}
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(booking.BookingPayment?.total_amount)}
                      </div>
                      {booking.penalty_amount && (
                        <div className="text-sm text-red-600">
                          Penalty: {formatCurrency(booking.penalty_amount)}
                        </div>
                      )}
                      {booking.BookingPayment?.payment_status && (
                        <div className="text-xs">
                          <Badge
                            className={
                              booking.BookingPayment.payment_status ===
                              "refunded"
                                ? "bg-green-100 text-green-800"
                                : booking.BookingPayment.payment_status ===
                                  "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {booking.BookingPayment.payment_status ===
                            "refunded"
                              ? "Refunded"
                              : booking.BookingPayment.payment_status ===
                                "completed"
                              ? "Completed"
                              : booking.BookingPayment.payment_status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => onViewDetails(booking)}
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                      {booking.BookingPayment?.payment_status !== "refunded" &&
                        booking.penalty_status !== "no_penalty" &&
                        booking.penalty_amount > 0 && (
                          <Button
                            onClick={() => onWaveOff(booking)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            Wave Off
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-600">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalBookings} total bookings)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CancelledBookingsTable;
