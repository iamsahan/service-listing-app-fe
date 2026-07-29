"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  RefreshCw,
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { adminBookingService } from "@/api/adminBookingService";
import { toast } from "@/hooks/use-toast";

const CompletedRefundRequestsTab = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [summaryStats, setSummaryStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search_query: "",
    dateRange: "",
    sort: "latest",
  });

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompletedRefundRequests(true); // Pass true to indicate it's a search
    }, 500); // 500ms delay for search

    return () => clearTimeout(timer);
  }, [filters.search_query]);

  useEffect(() => {
    fetchCompletedRefundRequests();
  }, [filters.page, filters.limit, filters.dateRange, filters.sort]);

  // Remove client-side filtering since we're using server-side filtering

  const fetchCompletedRefundRequests = async (isSearch = false) => {
    try {
      // Use different loading state for search to avoid losing input focus
      if (isSearch) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }
      setError(null);
      console.log("Fetching completed refund requests with filters:", filters);

      // Extract page from filters and pass other filters separately
      const { page, ...otherFilters } = filters;
      const response = await adminBookingService.getCompletedRefundRequests(
        otherFilters,
        page
      );
      console.log("API Response:", response);

      if (response.success) {
        // Map the bookings to the expected format
        const bookings = response.data.bookings || [];
        console.log("Bookings received:", bookings.length, "items");
        console.log("Pagination received:", response.data.pagination);
        setRefundRequests(bookings);
        setFilteredRequests(bookings); // Set filtered requests same as refund requests since filtering is done server-side
        setPagination(response.data.pagination || {});

        // Create summary stats from the response
        const stats = {
          total: {
            count:
              response.data.summary_stats?.total_requests || bookings.length,
            amount: response.data.summary_stats?.total_refunded_amount || 0,
          },
          this_month: {
            count: bookings.filter((booking) => {
              const refundDate = new Date(
                booking.BookingPayment?.updated_at || booking.cancellation_time
              );
              const now = new Date();
              return (
                refundDate.getMonth() === now.getMonth() &&
                refundDate.getFullYear() === now.getFullYear()
              );
            }).length,
          },
        };
        setSummaryStats(stats);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching completed refund requests:", err);
      toast({
        title: "Error",
        description: "Failed to fetch completed refund requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    console.log("Changing page from", filters.page, "to", newPage);
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      processed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: RefreshCw,
      },
    };

    const config = statusConfig[status] || statusConfig.completed;
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text}`}>
        <span className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {status?.charAt(0).toUpperCase() + status?.slice(1) || "Completed"}
        </span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading completed refund requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summaryStats && Object.keys(summaryStats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">
                Total Completed
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {summaryStats.total?.count || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">
                Total Refunded Amount
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(summaryStats.total?.amount || 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">
                This Month
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {summaryStats.this_month?.count || 0}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">
              Error loading completed refund requests
            </span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by booking ID"
                  value={filters.search_query}
                  onChange={(e) =>
                    handleFilterChange(
                      "search_query",
                      e.target.value.toLowerCase()
                    )
                  }
                  className="pl-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  handleFilterChange("dateRange", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Latest First" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_high">Highest Amount</SelectItem>
                  <SelectItem value="amount_low">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex space-x-2">
                <Button
                  onClick={fetchCompletedRefundRequests}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Refund Requests Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Completed Refund Requests
          </CardTitle>
          <Badge variant="outline">{filteredRequests.length} requests</Badge>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No completed refund requests found
              </h3>
              <p className="text-gray-500">
                There are no completed refund requests matching your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">
                      Booking Details
                    </th>
                    <th className="text-left p-3 font-medium">Customer</th>
                    <th className="text-left p-3 font-medium">
                      Refund Details
                    </th>
                    <th className="text-left p-3 font-medium">
                      Completed Date
                    </th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.booking_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {request.booking_id}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(request.booking_date)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Status: {request.status}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {request.customer?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 px-2">
                            {request.customer?.email || "N/A"}
                          </div>

                          {/* Account Balance Information */}
                          {request.customer && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between bg-blue-50 px-2 py-1 rounded text-xs">
                                <span className="text-blue-700 font-medium">
                                  Account Balance:
                                </span>
                                <span className="text-blue-800 font-bold">
                                  {formatCurrency(
                                    request.customer.acc_balance || 0
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(
                              request.BookingPayment?.total_amount
                            )}
                          </div>
                          <div className="text-sm text-green-600">
                            Refunded:{" "}
                            {formatCurrency(
                              request.BookingPayment?.refund_amount
                            )}
                          </div>
                          <div className="text-xs text-red-600">
                            Penalty: {formatCurrency(request.penalty_amount)}
                          </div>
                          {request.BookingPayment?.refund_id && (
                            <div className="text-xs text-gray-500">
                              Ref ID: {request.BookingPayment.refund_id}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {getStatusBadge(
                            request.BookingPayment?.refund_status
                          )}
                          <div className="text-sm text-gray-600">
                            {formatDate(
                              request.BookingPayment?.updated_at ||
                                request.cancellation_time
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col space-y-1">
                          <Button
                            onClick={() => viewDetails(request)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total_count
                  )}{" "}
                  of {pagination.total_count} results
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page <= 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="flex items-center px-3 py-2 text-sm">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  <Button
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={pagination.current_page >= pagination.total_pages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Completed Refund Details - {selectedRequest.booking_id}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Booking Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium">
                        {selectedRequest.booking_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date:</span>
                      <span>{formatDate(selectedRequest.booking_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span>{selectedRequest.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancelled By:</span>
                      <span>{selectedRequest.cancelled_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancellation Time:</span>
                      <span>
                        {formatDate(selectedRequest.cancellation_time)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">
                    Refund Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Payment ID:</span>
                      <span className="font-medium">
                        {selectedRequest?.BookingPayment?.transaction_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Total Amount:</span>
                      <span>
                        {formatCurrency(
                          selectedRequest?.BookingPayment?.total_amount
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Refund Amount:</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(
                          selectedRequest?.BookingPayment?.refund_amount
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Penalty Amount:</span>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(selectedRequest.penalty_amount)}
                      </span>
                    </div>

                    {selectedRequest.payment?.refund_id && (
                      <div className="flex justify-between">
                        <span className="text-green-600">Refund ID:</span>
                        <span className="font-medium">
                          {selectedRequest?.BookingPayment?.refund_id}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-green-600">Refund Id:</span>
                      <span>{selectedRequest?.BookingPayment?.refund_id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer and Provider Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.customer?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.customer?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.customer?.mobile}</span>
                    </div>
                    <div className="mt-3 p-2 bg-blue-100 rounded">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Account Balance:</span>
                        <span className="font-bold">
                          {formatCurrency(
                            selectedRequest.customer?.acc_balance || 0
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-100 rounded">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">
                          Hold Account Balance:
                        </span>
                        <span className="font-bold">
                          {formatCurrency(
                            selectedRequest.customer?.hold_acc_balance || 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Provider Information
                  </h4>
                  {selectedRequest.provider ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest?.provider?.User?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest?.provider?.User?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest?.provider?.User?.mobile}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No provider assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              {selectedRequest.payment?.transaction_id && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Transaction Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">
                        {selectedRequest.payment.transaction_id}
                      </span>
                    </div>
                    {selectedRequest.payment.refund_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Refund Transaction ID:
                        </span>
                        <span className="font-medium">
                          {selectedRequest.payment.refund_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.payment?.admin_notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Admin Notes
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedRequest.payment.admin_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedRefundRequestsTab;
