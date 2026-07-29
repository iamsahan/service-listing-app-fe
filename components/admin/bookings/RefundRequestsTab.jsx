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

const RefundRequestsTab = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [summaryStats, setSummaryStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessRefundModal, setShowProcessRefundModal] = useState(false);
  const [processRefundLoading, setProcessRefundLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [refundId, setRefundId] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search_query: "",
    dateRange: "all",
    sort: "latest",
  });

  const refundStatuses = [
    "pending",
    "approved",
    "rejected",
    "processed",
    "completed",
  ];

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRefundRequests(true); // Pass true to indicate it's a search
    }, 500); // 500ms delay for search

    return () => clearTimeout(timer);
  }, [filters.search_query]);

  useEffect(() => {
    fetchRefundRequests();
  }, [filters.page, filters.limit, filters.dateRange, filters.sort]);

  const fetchRefundRequests = async (isSearch = false) => {
    try {
      // Use different loading state for search to avoid losing input focus
      if (isSearch) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await adminBookingService.getRefundRequests(filters);

      if (response.success) {
        setRefundRequests(response.data.refund_requests);
        setPagination(response.data.pagination);
        setSummaryStats(response.data.summary_stats);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching refund requests:", err);
      toast({
        title: "Error",
        description: "Failed to fetch refund requests",
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
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleProcessRefund = (request) => {
    setSelectedRequest(request);
    setShowProcessRefundModal(true);
    setAdminNotes("");
    setRefundId("");
  };

  const processRefund = async () => {
    if (!selectedRequest) return;

    try {
      setProcessRefundLoading(true);

      const payload = {
        adminNotes:
          adminNotes ||
          `Refund processed for booking ${selectedRequest.booking_id}`,
        refundId: refundId || `REF_${selectedRequest.booking_id}_${Date.now()}`,
      };

      await adminBookingService.processBookingRefund(
        selectedRequest.booking_id,
        payload
      );

      toast({
        title: "Success!",
        description: "Refund has been processed successfully",
        variant: "default",
      });

      // Reset modal state
      setShowProcessRefundModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
      setRefundId("");

      // Refresh the data
      fetchRefundRequests();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setProcessRefundLoading(false);
    }
  };

  const closeProcessRefundModal = () => {
    setShowProcessRefundModal(false);
    setSelectedRequest(null);
    setAdminNotes("");
    setRefundId("");
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
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      failed: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: XCircle,
      },
      approved: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: CheckCircle,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: XCircle,
      },
      processed: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: RefreshCw,
      },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: RefreshCw,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text}`}>
        <span className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
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
            <span>Loading refund requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summaryStats && Object.keys(summaryStats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">
                Total Requests
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {summaryStats.total?.count || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {summaryStats.pending?.count || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">
                Completed
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {summaryStats.completed?.count || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">
                Total Refund Amount
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(summaryStats.total?.amount || 0)}
            </div>
          </div>
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Error loading refund requests</span>
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
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_high">
                    Amount: High to Low
                  </SelectItem>
                  <SelectItem value="amount_low">
                    Amount: Low to High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex space-x-2">
                <Button
                  onClick={() => fetchRefundRequests()}
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

      {/* Refund Requests Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Refund Requests</CardTitle>
          <Badge variant="outline">{refundRequests.length} requests</Badge>
        </CardHeader>
        <CardContent>
          {refundRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No refund requests found
              </h3>
              <p className="text-gray-500">
                There are no refund requests matching your filters.
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
                      Payment Details
                    </th>
                    <th className="text-left p-3 font-medium">Refund Status</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refundRequests.map((request) => (
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
                            Status: {request.booking_status}
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
                              {request.customer.hold_acc_balance &&
                                parseFloat(request.customer.hold_acc_balance) >
                                  0 && (
                                  <div className="flex items-center justify-between bg-amber-50 px-2 py-1 rounded text-xs">
                                    <span className="text-amber-700 font-medium">
                                      Hold Balance:
                                    </span>
                                    <span className="text-amber-800 font-bold">
                                      {formatCurrency(
                                        request.customer.hold_acc_balance
                                      )}
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(request.payment?.total_amount)}
                          </div>
                          <div className="text-sm text-green-600">
                            Refund:{" "}
                            {formatCurrency(request.payment?.refund_amount)}
                          </div>
                          <div className="text-xs text-red-600">
                            Penalty: {formatCurrency(request.penalty_amount)}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {getStatusBadge(request.payment?.refund_status)}
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(request.payment?.requested_at)}
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
                            View
                          </Button>
                          {(request.payment?.refund_status === "approved" ||
                            request.payment?.refund_status === "pending") && (
                            <Button
                              onClick={() => handleProcessRefund(request)}
                              size="sm"
                              className="text-xs bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Process Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_items > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total_items
                  )}{" "}
                  of {pagination.total_items} results
                </div>
                {pagination.total_pages > 1 && (
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
                      disabled={
                        pagination.current_page >= pagination.total_pages
                      }
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
                  Refund Request Details - {selectedRequest.booking_id}
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
                      <span>{selectedRequest.booking_status}</span>
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

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Payment Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-medium">
                        {selectedRequest.payment?.payment_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span>
                        {formatCurrency(selectedRequest.payment?.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Amount:</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(selectedRequest.payment?.refund_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penalty Amount:</span>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(selectedRequest.penalty_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Status:</span>
                      <span>
                        {getStatusBadge(selectedRequest.payment?.refund_status)}
                      </span>
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
                      <span>{selectedRequest.customer?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Provider Information
                  </h4>
                  {selectedRequest.provider ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest.provider.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest.provider.owner_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest.provider.phone}</span>
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
                        <span className="text-gray-600">Refund ID:</span>
                        <span className="font-medium">
                          {selectedRequest.payment.refund_id}
                        </span>
                      </div>
                    )}
                  </div>
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
                <Button onClick={() => handleProcessRefund(selectedRequest)}>
                  Process Refund
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showProcessRefundModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Process Refund - {selectedRequest.booking_id}
                </h3>
                <button
                  onClick={closeProcessRefundModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={processRefundLoading}
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Refund Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium">
                      {selectedRequest.booking_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span>{selectedRequest.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span>
                      {formatCurrency(selectedRequest.payment?.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Amount:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(selectedRequest.payment?.refund_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Penalty:</span>
                    <span className="text-red-600">
                      {formatCurrency(selectedRequest.penalty_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter notes for this refund (optional)"
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  disabled={processRefundLoading}
                />
              </div>

              {/* Refund ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Refund ID
                </label>
                <Input
                  value={refundId}
                  onChange={(e) => setRefundId(e.target.value)}
                  placeholder="Enter custom refund transaction ID"
                  disabled={processRefundLoading}
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Warning
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This action will process the refund and cannot be undone. Make
                  sure all details are correct.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-end gap-3">
                <Button
                  onClick={closeProcessRefundModal}
                  variant="outline"
                  disabled={processRefundLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processRefund}
                  disabled={processRefundLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processRefundLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Process Refund
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundRequestsTab;
