"use client";
import { adminBookingService } from "@/api/adminBookingService";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminBookingPayments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [dateRange, setDateRange] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    payment_status: "all",
    payment_method: "all",
    dateRange: "",
    createdWithin: "",
    format: "pdf",
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    fetchAllTransactions();
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchAllTransactions();
    }
  }, [
    searchQuery,
    paymentStatus,
    paymentMethod,
    dateRange,
    startDate,
    endDate,
  ]);

  const fetchAllTransactions = async () => {
    try {
      // Build query parameters to match backend API
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      // Add search query
      if (searchQuery.trim()) {
        params.append("search_query", searchQuery.trim());
      }

      // Add payment status filter
      if (paymentStatus && paymentStatus !== "all") {
        params.append("payment_status", paymentStatus);
      }

      // Add payment method filter
      if (paymentMethod && paymentMethod !== "all") {
        params.append("payment_method", paymentMethod);
      }

      // Add date range filter
      if (dateRange && ["today", "week", "month"].includes(dateRange)) {
        params.append("dateRange", dateRange);
      }

      // Add custom date range
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }

      const response = await adminBookingService.getBookingTransactions(
        currentPage,
        params.toString()
      );

      // Handle both old and new response formats
      const totalPages =
        response.pagination?.totalPages || response.total_pages || 1;
      const transactions = response.transactions || [];

      setTransactions(transactions);
      setTotalPages(totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1) return;
    if (page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Clear custom dates when using predefined ranges
    if (range) {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleCustomDateChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    // Clear predefined range when using custom dates
    if (value) {
      setDateRange("");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "advance_only_paid":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      // Build query params
      const params = {};

      // Add payment status filter
      if (
        reportFilters.payment_status &&
        reportFilters.payment_status !== "all"
      ) {
        params.payment_status = reportFilters.payment_status;
      }

      // Add payment method filter
      if (
        reportFilters.payment_method &&
        reportFilters.payment_method !== "all"
      ) {
        params.payment_method = reportFilters.payment_method;
      }

      // Handle date filters (priority: custom > relative > predefined)
      if (reportFilters.startDate && reportFilters.endDate) {
        params.startDate = reportFilters.startDate;
        params.endDate = reportFilters.endDate;
      } else if (reportFilters.createdWithin) {
        params.createdWithin = reportFilters.createdWithin;
      } else if (reportFilters.dateRange) {
        params.dateRange = reportFilters.dateRange;
      }

      // Add format parameter
      if (reportFilters.format) params.format = reportFilters.format;

      // Call API to generate report
      const response = await adminBookingService.generateTransactionLogsReport(
        params
      );

      // Determine file extension and MIME type based on format
      const format = reportFilters.format || "pdf";
      const mimeType =
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf";
      const fileExtension = format === "excel" ? "xlsx" : "pdf";

      // Create blob from response
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `transaction-logs-report-${Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Transaction logs report generated successfully",
        variant: "default",
      });

      setIsReportModalOpen(false);
      setReportFilters({
        startDate: "",
        endDate: "",
        payment_status: "all",
        payment_method: "all",
        dateRange: "",
        createdWithin: "",
        format: "pdf",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to generate transaction logs report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transaction Logs</h1>
        <Button
          onClick={() => setIsReportModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Booking ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />

        {/* Payment Status Filter */}
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="all">All Payment Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="advance_only_paid">Advance Only Paid</option>
          <option value="failed">Failed</option>
        </select>

        {/* Payment Method Filter */}
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="all">All Payment Methods</option>
          <option value="card">Card</option>
          <option value="user_account_balance">Account Balance</option>
          <option value="cash">Cash</option>
        </select>

        {/* Date Range Filter */}
        <select
          value={dateRange}
          onChange={(e) => handleDateRangeChange(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">Select Date Range</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Custom Date Range */}
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleCustomDateChange("start", e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleCustomDateChange("end", e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={() => {
              setSearchQuery("");
              setPaymentStatus("all");
              setPaymentMethod("all");
              setDateRange("");
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            variant="outline"
            className="p-2"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Payment ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Booking ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.payment_id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.payment_id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.booking_id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {transaction.Booking?.customer?.name || "N/A"}
                      </div>
                      <div className="text-gray-500">
                        {transaction.Booking?.customer?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{transaction.total_amount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.payment_method}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                        transaction.payment_status
                      )}`}
                    >
                      {transaction.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No transactions found.</p>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            variant="outline"
          >
            Previous
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-10 h-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            variant="outline"
          >
            Next
          </Button>

          <div className="ml-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      <Dialog
        open={isReportModalOpen}
        onOpenChange={(open) => {
          setIsReportModalOpen(open);
          if (!open) {
            setReportFilters({
              startDate: "",
              endDate: "",
              payment_status: "all",
              payment_method: "all",
              dateRange: "",
              createdWithin: "",
              format: "pdf",
            });
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Transaction Logs Report
          </DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure filters to generate a detailed transaction logs report
              in PDF or Excel format.
            </p>

            {/* Report Format Filter */}
            <div className="space-y-2">
              <Label htmlFor="report-format">Report Format</Label>
              <Select
                value={reportFilters.format}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    format: value,
                  })
                }
              >
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="report-payment-status">Payment Status</Label>
              <Select
                value={reportFilters.payment_status}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    payment_status: value === "all" ? "all" : value,
                  })
                }
              >
                <SelectTrigger id="report-payment-status">
                  <SelectValue placeholder="All Payment Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="advance_only_paid">
                    Advance Only Paid
                  </SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label htmlFor="report-payment-method">Payment Method</Label>
              <Select
                value={reportFilters.payment_method}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    payment_method: value === "all" ? "all" : value,
                  })
                }
              >
                <SelectTrigger id="report-payment-method">
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="user_account_balance">
                    Account Balance
                  </SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Predefined Date Range */}
            <div className="space-y-2">
              <Label htmlFor="report-date-range">Quick Date Range</Label>
              <Select
                value={reportFilters.dateRange}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    dateRange: value,
                    createdWithin: "", // Clear relative range
                    startDate: "", // Clear custom dates
                    endDate: "",
                  })
                }
              >
                <SelectTrigger id="report-date-range">
                  <SelectValue placeholder="Select quick range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Relative Date Range */}
            <div className="space-y-2">
              <Label htmlFor="report-created-within">Relative Date Range</Label>
              <Select
                value={reportFilters.createdWithin}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    createdWithin: value,
                    dateRange: "", // Clear predefined range
                    startDate: "", // Clear custom dates
                    endDate: "",
                  })
                }
              >
                <SelectTrigger id="report-created-within">
                  <SelectValue placeholder="Select relative range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="last3">Last 3 Months</SelectItem>
                  <SelectItem value="last6">Last 6 Months</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-2">
              <Label>Custom Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-start-date" className="text-xs">
                    Start Date
                  </Label>
                  <Input
                    id="report-start-date"
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) =>
                      setReportFilters({
                        ...reportFilters,
                        startDate: e.target.value,
                        dateRange: "", // Clear predefined range
                        createdWithin: "", // Clear relative range
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-end-date" className="text-xs">
                    End Date
                  </Label>
                  <Input
                    id="report-end-date"
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) =>
                      setReportFilters({
                        ...reportFilters,
                        endDate: e.target.value,
                        dateRange: "", // Clear predefined range
                        createdWithin: "", // Clear relative range
                      })
                    }
                    min={reportFilters.startDate}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Custom dates override quick and relative ranges
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportFilters({
                    startDate: "",
                    endDate: "",
                    payment_status: "all",
                    payment_method: "all",
                    dateRange: "",
                    createdWithin: "",
                    format: "pdf",
                  });
                }}
                disabled={isGeneratingReport}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate{" "}
                    {reportFilters.format === "excel" ? "Excel" : "PDF"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingPayments;
