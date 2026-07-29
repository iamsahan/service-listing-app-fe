"use client";
import React, { useEffect, useState } from "react";
import { adminBookingService } from "@/api/adminBookingService";
import { Dialog } from "@/components/ui/dialog";
import AssignmentHistory from "./AssignmentHistory";
import AdminAssignmentFilters from "./AdminAssignmentFilters";
import AdminAssignmentTable from "./AdminAssignmentTable";
import AdminAssignmentModals from "./AdminAssignmentModals";
import AdminAssignmentPagination from "./AdminAssignmentPagination";

const defaultFilters = {
  page: 1,
  limit: 20,
  priority: "",
  status: "queued",
  search: "",
  urgent_only: false,
  overdue_only: false,
  sortBy: "createdAt",
  sortOrder: "DESC",
};

const AdminManuallyAssignment = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    has_prev_page: false,
    has_next_page: false,
    prev_page: null,
    next_page: null,
  });
  const [stats, setStats] = useState({});

  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [eligibleProviders, setEligibleProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelingBooking, setCancelingBooking] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Algorithm confirmation state
  const [showAlgorithmConfirm, setShowAlgorithmConfirm] = useState(false);
  const [triggeringAlgorithm, setTriggeringAlgorithm] = useState(false);
  const [algorithmBooking, setAlgorithmBooking] = useState(null);

  // Assignment history state
  const [isAssignmentHistoryOpen, setIsAssignmentHistoryOpen] = useState(false);
  const [selectedBookingForHistory, setSelectedBookingForHistory] =
    useState(null);

  // Search debouncing
  const [searchInput, setSearchInput] = useState("");

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput,
        page: 1,
      }));
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const fetchQueue = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching queue with params:", { ...filters, ...params });
      const response = await adminBookingService.getUnassignedBookings({
        ...filters,
        ...params,
      });
      console.log("Queue response:", response);
      setQueue(response.data || []);
      setPagination({
        current_page: response.pagination?.current_page || 1,
        total_pages: response.pagination?.total_pages || 1,
        has_prev_page: response.pagination?.has_prev_page || false,
        has_next_page: response.pagination?.has_next_page || false,
        prev_page: response.pagination?.prev_page || null,
        next_page: response.pagination?.next_page || null,
      });
      setStats(response.statistics || {});
    } catch (err) {
      console.error("Error fetching queue:", err);
      setError(`Failed to fetch manual assignment queue: ${err.message}`);
    } finally {
      setLoading(false);
      console.log("Loading set to false");
    }
  };

  // Initial load
  useEffect(() => {
    console.log("Initial component mount - loading queue");
    fetchQueue();
  }, []);

  // Handle filter changes
  useEffect(() => {
    console.log("Filters changed:", filters);
    if (filters !== defaultFilters) {
      fetchQueue();
    }
  }, [filters]);

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle search input separately for debouncing
    if (name === "search") {
      setSearchInput(value);
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      page: 1,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchInput("");
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Assignment dialog handlers
  const handleAssign = async (item) => {
    setSelectedBooking(item);
    setAssignDialogOpen(true);
    setProvidersLoading(true);
    try {
      const res =
        await adminBookingService.getEligibleProvidersForManualAssignment(
          item.booking_id
        );
      console.log(res);
      setEligibleProviders(
        res.map((p) => ({
          provider_id: p.providerId,
          business_type: p.businessType,
          city_id: p.cityId,
          distance: p.distance,
          ...p,
        }))
      );
    } catch {
      setEligibleProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedBooking(null);
    setEligibleProviders([]);
  };

  const handleProviderAssign = async (booking, provider) => {
    setAssigning(true);
    setAssignError(null);
    try {
      await adminBookingService.assignProviderToBooking(
        booking.booking_id,
        provider.providerId || provider.provider_id
      );
      closeAssignDialog();
      fetchQueue();
    } catch (err) {
      setAssignError(err.message || "Failed to assign provider");
    } finally {
      setAssigning(false);
    }
  };

  // Cancel dialog handlers
  const handleCancelBooking = (item) => {
    setBookingToCancel(item);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setCancelReason("");
    setBookingToCancel(null);
  };

  const handleCancelReasonChange = (e) => {
    setCancelReason(e.target.value);
  };

  const handleConfirmCancel = async () => {
    setCancelingBooking(true);
    setAssignError(null);

    try {
      await adminBookingService.cancelBooking(
        bookingToCancel?.booking_id,
        cancelReason
      );
      handleCancelDialogClose();
      fetchQueue(); // Refresh list
    } catch (err) {
      setAssignError(err?.message || "Failed to cancel booking");
    } finally {
      setCancelingBooking(false);
    }
  };

  // Algorithm handlers
  const handleAlgorithmClick = (item) => {
    setAlgorithmBooking(item);
    setShowAlgorithmConfirm(true);
  };

  const closeAlgorithmConfirm = () => {
    setShowAlgorithmConfirm(false);
    setAlgorithmBooking(null);
  };

  const triggerAlgorithm = async () => {
    setTriggeringAlgorithm(true);
    setAssignError(null);

    try {
      await adminBookingService.triggerAlgorithm(algorithmBooking.booking_id);
      setShowAlgorithmConfirm(false);
      setAlgorithmBooking(null);
      fetchQueue(); // Refresh list
    } catch (err) {
      setAssignError(err?.message || "Failed to trigger algorithm");
    } finally {
      setTriggeringAlgorithm(false);
    }
  };

  // Assignment history handlers
  const openAssignmentHistory = (item) => {
    setSelectedBookingForHistory(item);
    setIsAssignmentHistoryOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manual Assignment Queue</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Filters Component */}
      <AdminAssignmentFilters
        filters={filters}
        searchInput={searchInput}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
        onResetFilters={resetFilters}
        stats={stats}
      />

      {/* Table Component */}
      <AdminAssignmentTable
        queue={queue}
        loading={loading}
        error={error}
        onViewBooking={openAssignmentHistory}
        onAssignProvider={handleAssign}
        onTriggerAlgorithm={handleAlgorithmClick}
        onCancelBooking={handleCancelBooking}
        triggeringAlgorithm={triggeringAlgorithm}
        algorithmBooking={algorithmBooking}
        filters={filters}
        onResetFilters={resetFilters}
      />

      {/* Pagination Component */}
      <AdminAssignmentPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Modals Component */}
      <AdminAssignmentModals
        // Assign Dialog
        assignDialogOpen={assignDialogOpen}
        selectedBooking={selectedBooking}
        eligibleProviders={eligibleProviders}
        providersLoading={providersLoading}
        assigning={assigning}
        assignError={assignError}
        onCloseAssignDialog={closeAssignDialog}
        onProviderAssign={handleProviderAssign}
        // Cancel Dialog
        cancelDialogOpen={cancelDialogOpen}
        bookingToCancel={bookingToCancel}
        cancelReason={cancelReason}
        cancelingBooking={cancelingBooking}
        onCancelDialogClose={handleCancelDialogClose}
        onCancelReasonChange={handleCancelReasonChange}
        onConfirmCancel={handleConfirmCancel}
        // Algorithm Dialog
        showAlgorithmConfirm={showAlgorithmConfirm}
        algorithmBooking={algorithmBooking}
        triggeringAlgorithm={triggeringAlgorithm}
        onCloseAlgorithmConfirm={closeAlgorithmConfirm}
        onTriggerAlgorithm={triggerAlgorithm}
      />

      {/* Assignment History Dialog */}
      <Dialog
        open={isAssignmentHistoryOpen}
        onOpenChange={setIsAssignmentHistoryOpen}
      >
        {selectedBookingForHistory && (
          <AssignmentHistory bookingId={selectedBookingForHistory.booking_id} />
        )}
      </Dialog>
    </div>
  );
};

export default AdminManuallyAssignment;
