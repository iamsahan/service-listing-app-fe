"use client";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCwIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  EyeIcon,
  UserCheckIcon,
} from "lucide-react";
import { adminBookingService } from "@api/adminBookingService";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const CancelledBookingsProviderTab = forwardRef(
  (
    { onViewDetails, onAssignProvider, formatDateTime, formatCurrency },
    ref
  ) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState({});

    const [filters, setFilters] = useState({
      page: 1,
      limit: 10,
      dateRange: "all",
      startDate: "",
      endDate: "",
      search_query: "",
      reassignment_successful: false,
    });

    // Debounce search
    useEffect(() => {
      const timer = setTimeout(() => {
        fetchBookings(true);
      }, 500);

      return () => clearTimeout(timer);
    }, [filters.search_query]);

    useEffect(() => {
      fetchBookings();
    }, [
      filters.page,
      filters.limit,
      filters.dateRange,
      filters.startDate,
      filters.endDate,
    ]);

    const fetchBookings = async (isSearch = false) => {
      try {
        if (isSearch) {
          setIsSearching(true);
        } else {
          setLoading(true);
        }

        let apiParams = {
          page: filters.page,
          limit: filters.limit,
          reassignment_successful: false,
        };

        if (filters.search_query && filters.search_query.trim() !== "") {
          apiParams.search_query = filters.search_query;
        } else {
          // When not searching, include all filters
          apiParams = { ...filters };
        }

        const response =
          await adminBookingService.getCancelledBookingsByProvider(apiParams);

        let bookingsData = [];
        if (response.cancellations && Array.isArray(response.cancellations)) {
          bookingsData = response.cancellations;
        } else if (Array.isArray(response)) {
          bookingsData = response;
        } else if (response.success && response.data?.cancelledBookings) {
          bookingsData = response.data.cancelledBookings;
        } else if (response.cancelledBookings) {
          bookingsData = response.cancelledBookings;
        } else {
          bookingsData = response.data || response || [];
        }

        setBookings(bookingsData);

        setPagination({
          totalPages: response.totalPages || 0,
          currentPage: response.currentPage || 1,
          totalCancellations: response.totalCancellations || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        });
      } catch (error) {
        console.error("Error fetching cancelled bookings:", error);
        toast.error("Failed to fetch cancelled bookings");
        setBookings([]);
        setPagination({});
      } finally {
        if (isSearch) {
          setIsSearching(false);
        } else {
          setLoading(false);
        }
      }
    };

    // Expose refetch function to parent
    useImperativeHandle(ref, () => ({
      refetch: () => fetchBookings(),
    }));

    const handleFilterChange = (key, value) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1,
      }));
    };

    const handlePageChange = (newPage) => {
      setFilters((prev) => ({
        ...prev,
        page: newPage,
      }));
    };

    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search booking ID, customer..."
                  value={filters.search_query}
                  onChange={(e) =>
                    handleFilterChange(
                      "search_query",
                      e.target.value.toLowerCase()
                    )
                  }
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCwIcon className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancellation Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penalty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <RefreshCwIcon className="h-5 w-5 animate-spin mr-2" />
                          Loading bookings...
                        </div>
                      ) : (
                        <div>
                          <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            No cancelled bookings found
                          </h3>
                          <p className="text-gray-500">
                            No cancelled bookings match your criteria
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr key={item.booking_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{item.booking_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(
                              item.booking?.booking_date,
                              item.booking?.start_time
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.customer?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.customer?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.cancelledProvider?.business_name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.cancelledProvider?.user?.name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            {item.cancellation_time
                              ? format(
                                  new Date(item.cancellation_time),
                                  "MMM dd, yyyy hh:mm a"
                                )
                              : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {item.cancellation_reason || "No reason provided"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {item.penalty_applied ? (
                            <>
                              <Badge className="bg-red-100 text-red-800">
                                Applied
                              </Badge>
                              <div className="text-sm font-medium text-gray-900 mt-1">
                                {formatCurrency(item.penalty_amount)}
                              </div>
                            </>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Not Applied
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewDetails(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </button>
                          {!item.newlyAssignedProvider && (
                            <button
                              onClick={() => onAssignProvider(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            >
                              <UserCheckIcon className="h-4 w-4" />
                              Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  {Math.min(
                    (pagination.currentPage - 1) * filters.limit + 1,
                    pagination.totalCancellations
                  )}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * filters.limit,
                    pagination.totalCancellations
                  )}{" "}
                  of {pagination.totalCancellations} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="flex items-center px-3 py-2 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CancelledBookingsProviderTab.displayName = "CancelledBookingsProviderTab";

export default CancelledBookingsProviderTab;
