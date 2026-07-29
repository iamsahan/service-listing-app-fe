"use client";

import React, { useEffect, useState } from "react";
import { providerAPI } from "@/api/provider";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const Page = () => {
  const [providerId, setProviderId] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBookings, setExpandedBookings] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!user?.uId) {
          setError("Please log in to view earnings");
          setLoading(false);
          return;
        }

        const res = await providerAPI.getProviderByUserId(user.uId);
        if (res.data?.provider_id) {
          setProviderId(res.data.provider_id);
        } else {
          setError("Provider information not found");
        }
      } catch (error) {
        console.error("Provider fetch error", error);
        setError("Failed to load provider information");
        setLoading(false);
      }
    };

    fetchProviderId();
  }, []);

  const fetchEarningsData = async (page = 1) => {
    if (!providerId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await providerAPI.getEarningsStats(providerId, {
        page,
        limit: 10,
      });

      setEarningsData(response.data);
      setCurrentPage(page);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error("Error fetching earnings data:", err);
      setError(err.response?.data?.message || "Failed to fetch earnings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchEarningsData();
    }
  }, [providerId]);

  const refreshData = () => {
    fetchEarningsData(currentPage);
  };

  const toggleBookingExpansion = (bookingId) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  const formatCurrency = (amount) => {
    return amount !== null && amount !== undefined
      ? `₹${Number(amount).toFixed(2)}`
      : "—";
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "—";
  };

  if (loading && !earningsData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading earnings data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!earningsData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">No earnings data available</div>
      </div>
    );
  }

  const { summary, booking_details, pagination } = earningsData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Earnings & Settlements
          </h1>
          <p className="text-gray-600">
            Track your booking earnings and settlement details
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">
              Total Earnings
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(summary.total_earnings)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">
              Total Bookings
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {summary.total_bookings}
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Earnings Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earning Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform Charges (Commission + TAX)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {booking_details.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No booking earnings found
                  </td>
                </tr>
              ) : (
                booking_details.map((booking) => (
                  <React.Fragment key={booking.booking_id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {booking.booking_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.booking_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.earning_type === "booking"
                              ? "bg-green-100 text-green-800"
                              : booking.earning_type === "penalty"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.earning_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium text-orange-400`}>
                          {formatCurrency(
                            parseFloat(booking.income_from_booking) +
                              parseFloat(booking.qproz_income_from_booking)
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            booking.income_from_booking >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(booking.income_from_booking)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium text-red-600`}>
                          {formatCurrency(booking.qproz_income_from_booking)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.service_items &&
                          booking.service_items.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleBookingExpansion(booking.booking_id)
                              }
                              className="flex items-center gap-1"
                            >
                              {expandedBookings.has(booking.booking_id) ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Show Details
                                </>
                              )}
                            </Button>
                          )}
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedBookings.has(booking.booking_id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Service Items */}
                            {booking.service_items &&
                              booking.service_items.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    Service Items
                                  </h4>
                                  <div className="bg-white rounded border overflow-hidden">
                                    <table className="min-w-full text-sm">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                            Item ID
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                            Price
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                            Qty
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                            Total
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                            Commission
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                            Earnings
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {booking.service_items.map(
                                          (item, index) => (
                                            <tr
                                              key={item.booking_item_id}
                                              className={
                                                index % 2 === 0
                                                  ? "bg-white"
                                                  : "bg-gray-50"
                                              }
                                            >
                                              <td className="px-4 py-2">
                                                {item.custom_item_name ||
                                                  `Item #${item.booking_item_id}`}
                                              </td>
                                              <td className="px-4 py-2">
                                                {formatCurrency(
                                                  item.unit_price
                                                )}
                                              </td>
                                              <td className="px-4 py-2">
                                                {item.quantity}
                                              </td>
                                              <td className="px-4 py-2">
                                                {formatCurrency(
                                                  item.total_price
                                                )}
                                              </td>
                                              <td className="px-4 py-2">
                                                <span className="text-red-600">
                                                  {formatCurrency(
                                                    item.commission_amount
                                                  )}
                                                </span>
                                              </td>
                                              <td className="px-4 py-2 text-green-600 font-medium">
                                                {formatCurrency(
                                                  item.provider_earnings
                                                )}
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.current_page} of {pagination.total_pages}
              <span className="ml-2 text-gray-500">
                ({pagination.total_records} total records)
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEarningsData(currentPage - 1)}
                disabled={!pagination.has_previous_page || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEarningsData(currentPage + 1)}
                disabled={!pagination.has_next_page || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
