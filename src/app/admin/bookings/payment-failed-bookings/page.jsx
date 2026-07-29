"use client";
import React, { useState, useEffect } from "react";
import { adminBookingService } from "@/api/adminBookingService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { serviceAPI } from "@/api/services";
import formatTime12Hour from "@/components/ticketing/timeFormatter";
import {
  CreditCard,
  Clock,
  Calendar,
  MapPin,
  User,
  IndianRupee,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Download,
} from "lucide-react";

const PaymentPendingBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search_query: "",
    dateRange: "none",
    exactDate: null,
    startDate: null,
    endDate: null,
    city: "all",
    sort: "created_at",
    order: "DESC",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    has_next: false,
    has_prev: false,
  });
  const [serviceCityOptions, setServiceCityOptions] = useState([]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPaymentPendingBookings(true); // Pass true to indicate it's a search
    }, 500); // 500ms delay for search

    return () => clearTimeout(timer);
  }, [filters.search_query]);

  useEffect(() => {
    fetchPaymentPendingBookings();
    if (!serviceCityOptions?.length) fetchCities();
  }, [
    filters.page,
    filters.limit,
    filters.dateRange,
    filters.exactDate,
    filters.startDate,
    filters.endDate,
    filters.city,
    filters.sort,
    filters.order,
  ]);

  const fetchPaymentPendingBookings = async (isSearch = false) => {
    try {
      // Use different loading state for search to avoid losing input focus
      if (isSearch) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Clean filters - remove null/undefined/"all"/"none" values
      const cleanedFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "all" &&
            value !== "none" &&
            value !== ""
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const response = await adminBookingService.getPaymentPendingBookings(
        cleanedFilters
      );

      if (response.success) {
        setBookings(response.data.bookings);
        setPagination(response.data.pagination);
        setSummaryStats(response.data.summary_stats);
      } else {
        throw new Error(response.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Error fetching payment pending bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsSearching(false);
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
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleToggleSort = () => {
    setFilters((prev) => ({
      ...prev,
      order: prev.order === "DESC" ? "ASC" : "DESC",
      page: 1,
    }));
  };

  const handleClearDates = () => {
    setFilters((prev) => ({
      ...prev,
      dateRange: "none",
      exactDate: null,
      startDate: null,
      endDate: null,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const dateRangeOptions = [
    { value: "none", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Latest First" },
    { value: "booking_date", label: "Booking Date" },
    { value: "total_amount", label: "Amount" },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <span className="ml-4 text-gray-600">
            Loading payment pending bookings...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-800">
              <div className="text-red-600">⚠️</div>
              <div>
                <h3 className="font-semibold">Error Loading Data</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold">Payment Pending Bookings</h1>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-600 text-sm">Total Pending</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summaryStats.total_payment_pending_bookings || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-600 text-sm">Total Amount Pending</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(summaryStats.total_amount_pending)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-gray-600 text-sm">This Month</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summaryStats.current_month_count || 0}
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="w-full rounded-xl">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Row 1: Search, City, Sort By, Sort Order */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Search</Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by booking ID..."
                      value={filters.search_query}
                      onChange={(e) =>
                        handleFilterChange("search_query", e.target.value)
                      }
                      className="h-10"
                    />
                    <Button
                      onClick={() => handleFilterChange("search_query", "")}
                      variant="outline"
                      className="h-10"
                      disabled={!filters.search_query}
                    >
                      Clear
                    </Button>
                  </div>
                  {isSearching && (
                    <div className="absolute right-20 top-1/2 -translate-y-1/2">
                      <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">City</Label>
                <Select
                  value={filters.city}
                  onValueChange={(value) => handleFilterChange("city", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
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
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Sort By</Label>
                <Select
                  value={filters.sort}
                  onValueChange={(value) => handleFilterChange("sort", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Sort Order</Label>
                <Select
                  value={filters.order}
                  onValueChange={(value) => handleFilterChange("order", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Descending</SelectItem>
                    <SelectItem value="ASC">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Date Filters and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                      page: 1,
                    });
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
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
                      page: 1,
                    });
                  }}
                  max={filters.endDate || undefined}
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
                      page: 1,
                    });
                  }}
                  min={filters.startDate || undefined}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Created Date</Label>
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
                      page: 1,
                    });
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Actions</Label>
                <div className="flex gap-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="w-full rounded-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Payment Pending Bookings</CardTitle>
            <span className="text-sm text-gray-600">
              {pagination.total_records} bookings
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Payment Pending Bookings
              </h3>
              <p className="text-gray-600">
                There are no bookings with pending payment status.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="font-medium text-gray-900">
                    Booking Details
                  </TableHead>
                  <TableHead className="font-medium text-gray-900">
                    Customer
                  </TableHead>
                  <TableHead className="font-medium text-gray-900">
                    Payment Details
                  </TableHead>
                  <TableHead className="font-medium text-gray-900">
                    Created Date
                  </TableHead>
                  <TableHead className="font-medium text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow
                    key={booking.booking_id}
                    className="border-b border-gray-100"
                  >
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {booking.booking_id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Status: {booking?.status}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {booking.customer?.name || "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.customer?.email}
                        </div>
                        <div className="text-xs text-blue-600">
                          Account Balance: ₹0.00
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="font-bold text-lg text-gray-900">
                          {formatCurrency(booking.payment?.total_amount)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <Button
                        onClick={() => handleViewDetails(booking)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center p-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Page Size:</Label>
              <Select
                value={String(filters.limit)}
                onValueChange={(value) =>
                  handleFilterChange("limit", Number(value))
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {(pagination.current_page - 1) * filters.limit + 1} to{" "}
                {Math.min(
                  pagination.current_page * filters.limit,
                  pagination.total_records
                )}{" "}
                of {pagination.total_records} entries
              </span>

              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                  variant="outline"
                >
                  Previous
                </Button>

                <span className="flex items-center px-3 py-2 text-sm">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>

                <Button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Booking Details - {selectedBooking?.booking_id}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Name</Label>
                      <p className="font-medium">
                        {selectedBooking.customer?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Email</Label>
                      <p className="font-medium">
                        {selectedBooking.customer?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Mobile</Label>
                      <p className="font-medium">
                        {selectedBooking.customer?.mobile || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Booking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Booking Date
                      </Label>
                      <p className="font-medium">
                        {new Date(
                          selectedBooking.booking_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Time</Label>
                      <p className="font-medium">
                        {formatTime12Hour(selectedBooking.start_time)} -{" "}
                        {formatTime12Hour(selectedBooking.end_time)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Status</Label>
                      <p className="font-medium text-red-600">
                        Payment Pending
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Category</Label>
                      <p className="font-medium">
                        {selectedBooking.category?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        Subcategory
                      </Label>
                      <p className="font-medium">
                        {selectedBooking.subcategory?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Items</Label>
                      <p className="font-medium">
                        {selectedBooking.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>

                  {selectedBooking.items &&
                    selectedBooking.items.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm text-gray-600">
                          Service Items
                        </Label>
                        <div className="mt-2 space-y-2">
                          {selectedBooking.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">
                                {formatCurrency(item.total_price)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Total Amount
                      </Label>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedBooking.payment?.total_amount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        Payment Method
                      </Label>
                      <p className="font-medium">
                        {selectedBooking.payment?.payment_method || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Subtotal</Label>
                      <p className="font-medium">
                        {formatCurrency(selectedBooking.payment?.subtotal)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        Advance Payment
                      </Label>
                      <p className="font-medium">
                        {formatCurrency(
                          selectedBooking.payment?.advance_payment
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">City</Label>
                    <p className="font-medium">
                      {selectedBooking.city?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Service Address
                    </Label>
                    <p className="font-medium">
                      {selectedBooking.service_address || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentPendingBookingsPage;
