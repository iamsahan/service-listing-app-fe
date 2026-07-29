"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  UserCheck,
  X,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  CreditCard,
} from "lucide-react";
import { SyncDisabledTwoTone } from "@mui/icons-material";

const AdminAssignmentTable = ({
  queue,
  loading,
  error,
  onViewBooking,
  onAssignProvider,
  onTriggerAlgorithm,
  onCancelBooking,
  triggeringAlgorithm,
  algorithmBooking,
  filters,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Assignment Queue
            </h2>
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            )}
          </div>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {queue.length} {queue.length === 1 ? "booking" : "bookings"} found
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Error loading data</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading assignment queue...
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Please wait while we fetch the latest bookings
          </p>
        </div>
      ) : queue.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No bookings in queue
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {filters.priority || filters.search || filters.urgent_only
              ? "No bookings match your current filters. Try adjusting your search criteria."
              : "All bookings have been successfully assigned! Great work managing the queue."}
          </p>
          {(filters.priority || filters.search || filters.urgent_only) && (
            <Button
              onClick={onResetFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-900 py-4">
                  <div className="flex items-center gap-2">
                    <span>Booking ID</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Priority</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>Category</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>City</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date & Time</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>Address</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-900">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((item) => (
                <TableRow
                  key={item.booking_id + item.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  <TableCell className="font-mono font-semibold text-blue-600 py-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                        #{item.booking_id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        item.priority === 1 || item.priority === 2
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      <AlertCircle className="h-3 w-3" />
                      {item.priority === 1 || item.priority === 2
                        ? "High"
                        : "Low"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${
                        item.status === "queued"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : item.status === "assigned"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : item.status === "completed"
                              ? "bg-gray-100 text-gray-700 border-gray-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      {item.status === "queued" ? (
                        <Clock className="h-3 w-3" />
                      ) : item.status === "assigned" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : item.status === "completed" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {item.booking?.subCategory?.ServiceCategory?.name ||
                          "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.booking?.subCategory?.name || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <div className="font-medium">
                      {item.booking?.City?.name || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {item.booking?.booking_date
                          ? new Date(
                              item.booking.booking_date,
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.booking?.start_time
                          ? `${item.booking.start_time} - ${item.booking.end_time}`
                          : "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${
                        item.booking?.BookingPayment?.payment_status ===
                        "completed"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : item.booking?.BookingPayment?.payment_status ===
                              "pending"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.booking?.BookingPayment?.payment_status ===
                      "completed" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : item.booking?.BookingPayment?.payment_status ===
                        "pending" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {item.booking?.BookingPayment?.payment_status || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700 max-w-xs">
                    <div
                      className="truncate"
                      title={item.booking?.service_address || "-"}
                    >
                      {item.booking?.service_address || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50 w-[130px]"
                        title="View Booking Details"
                        onClick={() => onViewBooking(item)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {item.status === "queued" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white w-[130px]"
                          title="Assign Provider"
                          onClick={() => onAssignProvider(item)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      )}
                      {item.booking?.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white w-[130px]"
                          title="Run Algorithm"
                          onClick={() => onTriggerAlgorithm(item)}
                          disabled={triggeringAlgorithm}
                        >
                          <SyncDisabledTwoTone className="h-4 w-4 mr-1" />
                          {triggeringAlgorithm &&
                          algorithmBooking?.booking_id === item.booking_id
                            ? "Triggering..."
                            : "Algorithm"}
                        </Button>
                      )}
                      {item.status === "assigned" ? (
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white w-[130px]"
                          title="Change Provider"
                          onClick={() => onAssignProvider(item)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Change
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 w-[130px]"
                          title="Cancel Booking"
                          onClick={() => onCancelBooking(item)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reshedule
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminAssignmentTable;
