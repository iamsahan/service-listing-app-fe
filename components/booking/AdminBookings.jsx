"use client";
import React, { useState, useEffect } from "react";
import { adminBookingService } from "../../api/adminBookingService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AdminBookingDetailsModal } from "./AdminBookingDetailsModel";
import EligibleProvider from "./EligibleProvider";
import AssignmentHistory from "./AssignmentHistory";
import { serviceAPI } from "@/api/services";
import formatTime12Hour from "../ticketing/timeFormatter";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FileText, Download, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DeleteBookingDialog from "../admin/bookings/DeleteBookingDialog";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    limit: 10,
    search_query: null,
    status: "all",
    dateRange: "none",
    exactDate: null,
    startDate: null,
    endDate: null,
    city: "all",
    category: "all",
    sortOrder: "desc",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [bookingForProvider, setBookingForProvider] = useState(null);
  const [serviceCityOptions, setServiceCityOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignmentHistoryOpen, setIsAssignmentHistoryOpen] = useState(false);
  const [selectedBookingForHistory, setSelectedBookingForHistory] =
    useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    providerId: "",
    format: "pdf",
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (!serviceCityOptions?.length) fetchCities();
    if (!categoryOptions?.length) fetchCategories();
  }, [filters, currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Clean filters - remove null/undefined/"all"/"none" values
      const cleanedFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "all" &&
            value !== "none"
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      const { bookings, totalPages } = await adminBookingService.getAllBookings(
        cleanedFilters,
        currentPage,
      );
      setBookings(bookings);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await serviceAPI.getCities();
      const cityOptions = response.data.map((city) => ({
        value: city.city_id,
        label: city.name,
      }));
      setServiceCityOptions(cityOptions);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setError("Failed to load service cities");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await serviceAPI.getAllCategories();
      const categoryOptions = response.data.map((category) => ({
        value: category.category_id,
        label: category.name,
      }));
      setCategoryOptions(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load service categories");
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await adminBookingService.updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleAssignProvider = async (bookingId, providerId) => {
    try {
      await adminBookingService.assignServiceProvider(bookingId, providerId);
      fetchBookings();
      setIsProviderModalOpen(false);
      setBookingForProvider(null);
    } catch (error) {
      console.error("Error assigning provider:", error);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      await adminBookingService.updateBookingStatus(
        bookingToCancel,
        "cancelled",
        cancellationReason.trim(),
      );
      fetchBookings();
      setIsCancelDialogOpen(false);
      setBookingToCancel(null);
      setCancellationReason("");
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  const handleCancelWithReschedule = async () => {
    if (!cancellationReason.trim()) {
      alert("Please provide a reason for rescheduling");
      return;
    }

    try {
      await adminBookingService.cancelBooking(
        bookingToCancel?.booking_id,
        cancellationReason.trim(),
      );
      fetchBookings();
      setIsCancelDialogOpen(false);
      setBookingToCancel(null);
      setCancellationReason("");
      setIsRescheduleMode(false);
    } catch (error) {
      console.error("Error rescheduling booking:", error);
    }
  };

  const openCancelDialog = (bookingId) => {
    setBookingToCancel(bookingId);
    setCancellationReason("");
    setIsCancelDialogOpen(true);
  };

  const openRescheduleDialog = (booking) => {
    setBookingToCancel(booking);
    setCancellationReason("");
    setIsRescheduleMode(true);
    setIsCancelDialogOpen(true);
  };

  const closeRescheduleDialog = () => {
    setIsCancelDialogOpen(false);
    setBookingToCancel(null);
    setIsRescheduleMode(false);
    setCancellationReason("");
  };

  const openProviderModal = (booking) => {
    setBookingForProvider(booking);
    setIsProviderModalOpen(true);
  };

  const openAssignmentHistory = (booking) => {
    setSelectedBookingForHistory(booking);
    setIsAssignmentHistoryOpen(true);
  };

  const handleSearchSubmit = (query) => {
    if (query.trim() === "") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        search_query: null,
      }));
      setSearchQuery("");
      return;
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      search_query: query,
    }));
  };

  const handleClearSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search_query: null,
    }));
    setSearchQuery("");
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      // Build query params
      const params = {};
      if (reportFilters.startDate) params.startDate = reportFilters.startDate;
      if (reportFilters.endDate) params.endDate = reportFilters.endDate;
      if (reportFilters.status && reportFilters.status !== "all") {
        params.status = reportFilters.status;
      }
      if (reportFilters.providerId)
        params.providerId = reportFilters.providerId;
      if (reportFilters.format) params.format = reportFilters.format;

      // Call API to generate report
      const response = await adminBookingService.generateBookingReport(params);

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
      link.download = `booking-report-${Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Booking report generated successfully",
        variant: "default",
      });

      setIsReportModalOpen(false);
      setReportFilters({
        startDate: "",
        endDate: "",
        status: "all",
        providerId: "",
        format: "pdf",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate booking report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "payment_pending", label: "Payment Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "accepted", label: "Accepted" },
    { value: "reschedule", label: "In Reschedule" },
  ];

  const dateRangeOptions = [
    { value: "none", label: "None" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const handleClearDates = () => {
    setFilters({
      ...filters,
      dateRange: "none",
      exactDate: null,
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
  };

  const handleToggleSort = () => {
    setFilters({
      ...filters,
      sortOrder: filters.sortOrder === "desc" ? "asc" : "desc",
    });
    setCurrentPage(1);
  };

  const openDeleteDialog = (bookingId) => {
    const booking = bookings.find((b) => b.booking_id === bookingId);
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteBooking = async (isRestrictedMode) => {
    try {
      await adminBookingService.deleteBooking(
        selectedBooking?.booking_id,
        isRestrictedMode,
      );
      toast({
        title: "Success",
        description: "Booking deleted successfully",
        variant: "default",
      });
      setSelectedBooking(null);
      fetchBookings();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <Button
          onClick={() => setIsReportModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="w-full rounded-xl">
        <CardContent className="pt-6 space-y-4">
          {/* Row 1: Search, City, Category, Status */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex gap-2">
              <Input
                className="w-full"
                placeholder="Search by booking ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Button
                className="bg-[#5f60b9] hover:bg-[#5f60b9]/90 text-white whitespace-nowrap"
                onClick={() =>
                  filters.search_query
                    ? handleClearSearch()
                    : handleSearchSubmit(searchQuery)
                }
              >
                {!filters.search_query ? "Search" : "Clear"}
              </Button>
            </div>

            <Select
              value={filters.city}
              onValueChange={(value) => {
                setFilters({ ...filters, city: value });
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>

                {serviceCityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => {
                setFilters({ ...filters, category: value });
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>

                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters({ ...filters, status: value });
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Created Within, Start Date, End Date, Registration Date, Actions */}
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Created Within</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => {
                  setFilters({
                    ...filters,
                    dateRange: value,
                    exactDate: null,
                    startDate: null,
                    endDate: null,
                  });
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Start Date</Label>
              <Input
                type="date"
                className="h-10"
                value={filters.startDate || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    startDate: e.target.value,
                    dateRange: "none",
                    exactDate: null,
                  });
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">End Date</Label>
              <Input
                type="date"
                className="h-10"
                value={filters.endDate || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    endDate: e.target.value,
                    dateRange: "none",
                    exactDate: null,
                  });
                  setCurrentPage(1);
                }}
                min={filters.startDate || undefined}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Booking Date</Label>
              <Input
                type="date"
                className="h-10"
                value={filters.exactDate || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    exactDate: e.target.value,
                    dateRange: "none",
                    startDate: null,
                    endDate: null,
                  });
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={handleToggleSort}
                >
                  Sort {filters.sortOrder === "desc" ? "↓" : "↑"}
                </Button>
                <Button
                  onClick={handleClearDates}
                  variant="outline"
                  className="h-10 flex-1"
                  disabled={
                    filters.dateRange === "none" &&
                    !filters.exactDate &&
                    !filters.startDate &&
                    !filters.endDate
                  }
                >
                  Clear Dates
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="w-full rounded-xl">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SubCategory</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned SP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell>{booking.booking_id}</TableCell>
                    <TableCell>{booking.customer?.name}</TableCell>
                    <TableCell>{booking?.City?.name}</TableCell>
                    <TableCell>
                      {booking?.BookingItems[0]?.category_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {booking?.BookingItems[0]?.sub_category_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.booking_date).toLocaleDateString()}
                      {" - "}
                      {formatTime12Hour(booking.start_time)}
                    </TableCell>
                    <TableCell className="capitalize">
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleStatusChange(booking.booking_id, value)
                        }
                        disabled={["cancelled", "refunded"].includes(
                          booking.status,
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions
                            .filter((option) => option.value !== "all")
                            .map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-left text-wrap">
                          {booking.provider?.User?.name ||
                            booking.provider?.business_name ||
                            "Unassigned"}{" "}
                          - {booking.provider?.exact_address}
                        </span>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignmentHistory(booking)}
                          >
                            Assignment History
                          </Button>

                          {!["completed", "refunded"].includes(
                            booking.status,
                          ) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openProviderModal(booking)}
                              disabled={["cancelled"].includes(booking.status)}
                            >
                              Change Provider
                            </Button>
                          )}

                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 w-[130px]"
                              title="Cancel Booking"
                              onClick={() => openRescheduleDialog(booking)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reshedule
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            Details
                          </Button>
                          {!["cancelled", "completed", "refunded"].includes(
                            booking.status,
                          ) && (
                            <Button
                              variant="destructive"
                              onClick={() =>
                                openCancelDialog(booking.booking_id)
                              }
                            >
                              Cancel
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            onClick={() => openDeleteDialog(booking.booking_id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between mt-5">
            <div className="flex items-center">
              <Label>Page Size:</Label>
              <Select
                value={String(filters.limit)}
                onValueChange={(e) => {
                  setFilters({ ...filters, limit: Number(e) });
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 border-none font-semibold">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-5">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
              >
                Previous
              </Button>

              <span className="self-center">{`Page ${currentPage} of ${totalPages}`}</span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AdminBookingDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={(open) => {
          setIsDetailsModalOpen(open);
          setSelectedBooking(null);
        }}
        id={selectedBooking?.booking_id}
      />

      <Dialog
        open={isCancelDialogOpen}
        onOpenChange={(open) => {
          setIsCancelDialogOpen(open);
          if (!open) {
            closeRescheduleDialog();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>

            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">
                Cancellation Reason <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="cancellation-reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => closeRescheduleDialog()}>
                No, Go Back
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  isRescheduleMode
                    ? handleCancelWithReschedule()
                    : handleCancelBooking()
                }
                disabled={!cancellationReason.trim()}
              >
                Yes, Cancel Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProviderModalOpen} onOpenChange={setIsProviderModalOpen}>
        {bookingForProvider && (
          <EligibleProvider
            cityId={bookingForProvider?.City?.city_id}
            categoryIds={
              bookingForProvider?.BookingItems?.map(
                (item) => item.category_id,
              ) || []
            }
            currentProvider={bookingForProvider?.provider}
            onAssign={(providerId) =>
              handleAssignProvider(bookingForProvider.booking_id, providerId)
            }
            booking={bookingForProvider}
            onClose={() => {
              setIsProviderModalOpen(false);
              setBookingForProvider(null);
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={isAssignmentHistoryOpen}
        onOpenChange={setIsAssignmentHistoryOpen}
      >
        {selectedBookingForHistory && (
          <AssignmentHistory bookingId={selectedBookingForHistory.booking_id} />
        )}
      </Dialog>

      <Dialog
        open={isReportModalOpen}
        onOpenChange={(open) => {
          setIsReportModalOpen(open);
          if (!open) {
            setReportFilters({
              startDate: "",
              endDate: "",
              status: "all",
              providerId: "",
              format: "pdf",
            });
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Booking Report
          </DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure filters to generate a detailed booking report in PDF or
              Excel format.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      endDate: e.target.value,
                    })
                  }
                  min={reportFilters.startDate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-status">Status</Label>
              <Select
                value={reportFilters.status}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    status: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="report-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="payment_pending">
                    Payment Pending
                  </SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="provider-id">Provider ID (Optional)</Label>
              <Input
                id="provider-id"
                type="text"
                placeholder="Enter provider ID"
                value={reportFilters.providerId}
                onChange={(e) =>
                  setReportFilters({
                    ...reportFilters,
                    providerId: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Leave empty to include all providers
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportFilters({
                    startDate: "",
                    endDate: "",
                    status: "all",
                    providerId: "",
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

      <DeleteBookingDialog
        isOpen={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        handleDeleteBooking={handleDeleteBooking}
      />
    </div>
  );
};

export default AdminBookings;
