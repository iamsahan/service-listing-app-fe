"use client";
import { adminBookingService } from "@/api/adminBookingService";
import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

// Import the separated components
import CancelledBookingsFilters from "./CancelledBookingsFilters";
import CancelledBookingsTable from "./CancelledBookingsTable";
import CancelledBookingsDialogs from "./CancelledBookingsDialogs";

const penaltyStatuses = [
  "no_penalty",
  "pending",
  "fully_settled_advance",
  "partially_settled_advance",
  "apply_next_booking",
  "completed",
];

const CancelledBookingsTab = () => {
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openWaveOffDialog, setOpenWaveOffDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [waveOffType, setWaveOffType] = useState("full");
  const [waveOffAmount, setWaveOffAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState({
    totalPages: 0,
    currentPage: 1,
    totalBookings: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search_query: "",
    dateRange: "all",
    startDate: "",
    endDate: "",
  });

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCancelledBookings(true); // Pass true to indicate it's a search
    }, 500); // 500ms delay for search

    return () => clearTimeout(timer);
  }, [filters.search_query]);

  useEffect(() => {
    fetchCancelledBookings();
  }, [
    filters.page,
    filters.limit,
    filters.dateRange,
    filters.startDate,
    filters.endDate,
  ]);

  const fetchCancelledBookings = async (isSearch = false) => {
    try {
      // Use different loading state for search to avoid losing input focus
      if (isSearch) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      if (filters.search_query)
        queryParams.append("search_query", filters.search_query);
      if (filters.dateRange && filters.dateRange !== "all")
        queryParams.append("dateRange", filters.dateRange);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await adminBookingService.getCancelledBookingsByCustomer(
        `?${queryParams}`
      );

      // Handle different response structures
      let bookings;
      let paginationData = {};

      if (Array.isArray(response)) {
        bookings = response;
      } else if (response.data && Array.isArray(response.data)) {
        bookings = response.data;
      } else if (response.bookings && Array.isArray(response.bookings)) {
        bookings = response.bookings;
        paginationData = {
          totalPages: response.totalPages || 0,
          currentPage: response.currentPage || 1,
          totalBookings: response.totalBookings || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        };
      } else {
        console.warn("Unexpected response structure:", response);
        bookings = [];
      }

      setCancelledBookings(bookings);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching cancelled bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cancelled bookings",
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

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      search_query: "",
      dateRange: "all",
      startDate: "",
      endDate: "",
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setOpenDetailsDialog(true);
  };

  const handleWaveOffClick = (booking) => {
    setSelectedBooking(booking);
    setWaveOffType("full");
    setWaveOffAmount("");
    setOpenWaveOffDialog(true);
  };

  const handleUpdatePenalty = async () => {
    if (!selectedBooking || !selectedType) {
      toast({
        title: "Error",
        description: "Please select a penalty status",
        variant: "destructive",
      });
      return;
    }

    try {
      const reqBody = {
        bookingId: selectedBooking.booking_id,
        type: "update_status",
        penaltyStatus: selectedType,
      };

      await adminBookingService.handleCancelledBookingPanalty(reqBody);

      toast({
        title: "Success",
        description: "Penalty status updated successfully",
      });

      setOpenDialog(false);
      setSelectedBooking(null);
      setSelectedType("");
      fetchCancelledBookings();
    } catch (error) {
      console.error("Error updating penalty status:", error);
      toast({
        title: "Error",
        description: "Failed to update penalty status",
        variant: "destructive",
      });
    }
  };

  const handleWaveOffPenalty = async () => {
    try {
      if (!selectedBooking) return;

      const amount =
        waveOffType === "full"
          ? selectedBooking.penalty_amount
          : parseFloat(waveOffAmount);

      const reqBody = {
        bookingId: selectedBooking.booking_id,
        type: "wave_off",
        penaltyAmount: amount,
      };

      await adminBookingService.handleCancelledBookingPanalty(reqBody);

      fetchCancelledBookings();
      setOpenWaveOffDialog(false);
      setSelectedBooking(null);
      setWaveOffType("full");
      setWaveOffAmount("");
      toast({
        title: "Success!",
        description: `Penalty waived off successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while processing the request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <CancelledBookingsFilters
        filters={filters}
        isSearching={isSearching}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Table */}
      <CancelledBookingsTable
        bookings={cancelledBookings}
        loading={loading}
        pagination={pagination}
        onViewDetails={handleViewDetails}
        onWaveOff={handleWaveOffClick}
        onRefresh={fetchCancelledBookings}
        onPageChange={handlePageChange}
      />

      {/* Dialogs */}
      <CancelledBookingsDialogs
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        openWaveOffDialog={openWaveOffDialog}
        setOpenWaveOffDialog={setOpenWaveOffDialog}
        openDetailsDialog={openDetailsDialog}
        setOpenDetailsDialog={setOpenDetailsDialog}
        selectedBooking={selectedBooking}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        waveOffType={waveOffType}
        setWaveOffType={setWaveOffType}
        waveOffAmount={waveOffAmount}
        setWaveOffAmount={setWaveOffAmount}
        onUpdatePenalty={handleUpdatePenalty}
        onWaveOffPenalty={handleWaveOffPenalty}
        penaltyStatuses={penaltyStatuses}
      />
    </div>
  );
};

export default CancelledBookingsTab;
