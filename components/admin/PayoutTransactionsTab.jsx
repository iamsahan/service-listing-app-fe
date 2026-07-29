"use client";
import React, { useEffect, useState, useMemo } from "react";
import { providerAPI } from "@/api/provider";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, Filter, Calendar } from "lucide-react";
import {
  PAGE_LIMIT,
  fmt,
  formatDate,
  Th,
  Td,
  SummaryCard,
} from "./payoutUtils";

// Payout Transactions Tab Component
const PayoutTransactionsTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    purpose: "all",
    startDate: "",
    endDate: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_LIMIT,
        ...filters,
      };

      // Clean up empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === "all") {
          delete params[key];
        }
      });

      console.log("Fetching transactions with params:", params);
      const res = await providerAPI.getAllPayoutTransactions(params);
      const payload = res.data?.data || {};

      setTransactions(payload.transactions || []);
      setSummary(payload.summary || null);
      setTotalPages(payload.pagination?.total_pages || 1);
      setLastUpdated(new Date().toLocaleString());
    } catch (e) {
      console.error("Error fetching transactions:", e);
      setError(e.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchTransactions();
  };

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      purpose: "all",
      startDate: "",
      endDate: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      processed: "bg-green-100 text-green-800",
      initiated: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-700";
  };

  const getPurposeBadge = (purpose) => {
    const purposeClasses = {
      account_settlement: "bg-purple-100 text-purple-800",
      commission_payout: "bg-orange-100 text-orange-800",
      penalty_settlement: "bg-red-100 text-red-800",
      manual_adjustment: "bg-gray-100 text-gray-800",
    };
    return purposeClasses[purpose] || "bg-blue-100 text-blue-800";
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const filteredTransactions = useMemo(() => {
    return transactions;
  }, [transactions]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Payout Transaction History
          </h2>
          <div className="flex flex-col items-end gap-1">
            <Button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
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
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Transactions"
              value={summary.totalTransactions}
              loading={loading}
            />
            <SummaryCard
              title="Total Amount"
              value={fmt(summary.totalAmount)}
              loading={loading}
            />
            <SummaryCard
              title="Processed"
              value={`${summary.processedCount} (${fmt(
                summary.processedAmount
              )})`}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="ml-auto text-xs"
          >
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">
              Purpose
            </label>
            <select
              value={filters.purpose}
              onChange={(e) => handleFilterChange("purpose", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="account_settlement">QP To Provider</option>
              <option value="account_balance_topup">Provider To QP</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("_");
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="created_at_desc">Date (Newest)</option>
              <option value="created_at_asc">Date (Oldest)</option>
              <option value="amount_desc">Amount (High to Low)</option>
              <option value="amount_asc">Amount (Low to High)</option>
              <option value="status_asc">Status (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
              <tr>
                <Th>Transaction ID</Th>
                <Th>Provider</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Purpose</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No payout transactions found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <Td>#{transaction.id}</Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {transaction.provider?.business_name ||
                            transaction.provider?.User?.name ||
                            `Provider ${transaction.provider_id}`}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ID: {transaction.provider_id}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-medium text-gray-900">
                        {fmt(transaction.amount)}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPurposeBadge(
                          transaction.purpose
                        )}`}
                      >
                        {transaction.display_purpose
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </Td>

                    <Td>{formatDate(transaction.createdAt)}</Td>
                    <Td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewTransactionDetails(transaction)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
          <div className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Transaction Details
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Transaction Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">
                        #{selectedTransaction.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-lg">
                        {fmt(selectedTransaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          selectedTransaction.status
                        )}`}
                      >
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purpose:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPurposeBadge(
                          selectedTransaction.purpose
                        )}`}
                      >
                        {selectedTransaction.display_purpose
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium">
                        {selectedTransaction.reference_number || "—"}
                      </span>
                    </div>

                    {selectedTransaction.processed_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed:</span>
                        <span className="font-medium">
                          {formatDate(selectedTransaction.processed_at)}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.failure_reason && (
                      <div className="flex flex-col">
                        <span className="text-gray-600 mb-1">
                          Failure Reason:
                        </span>
                        <span className="text-red-600 text-sm bg-red-50 p-2 rounded">
                          {selectedTransaction.failure_reason}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.utr_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">UTR Number:</span>
                        <span className="font-medium">
                          {selectedTransaction.utr_number}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.narration && (
                      <div className="flex flex-col">
                        <span className="text-gray-600 mb-1">Narration:</span>
                        <span className="text-sm bg-gray-50 p-2 rounded">
                          {selectedTransaction.narration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Provider Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Provider Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider ID:</span>
                      <span className="font-medium">
                        #{selectedTransaction.provider_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Name:</span>
                      <span className="font-medium">
                        {selectedTransaction.provider?.business_name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Person:</span>
                      <span className="font-medium">
                        {selectedTransaction.provider?.User?.name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">
                        {selectedTransaction.provider?.User?.email || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">
                        {selectedTransaction.provider?.User?.mobile || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Type:</span>
                      <span className="font-medium">
                        {selectedTransaction.provider?.business_type || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              {selectedTransaction.account_details &&
                Object.keys(selectedTransaction.account_details).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                      Account Details
                    </h3>
                    <div className="bg-gray-50 p-3 rounded space-y-2">
                      {Object.entries(selectedTransaction.account_details).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between border-b border-gray-200 pb-1"
                          >
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-gray-600">
                              {key.includes("date")
                                ? formatDate(value)
                                : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Payment Information */}
              {(selectedTransaction.fees !== "0.00" ||
                selectedTransaction.tax !== "0.00" ||
                selectedTransaction.razorpay_payout_id ||
                selectedTransaction.fund_account_id) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    {selectedTransaction.razorpay_payout_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Razorpay Payout ID:
                        </span>
                        <span className="font-medium">
                          {selectedTransaction.razorpay_payout_id}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.fund_account_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fund Account ID:</span>
                        <span className="font-medium">
                          {selectedTransaction.fund_account_id}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fees:</span>
                      <span className="font-medium">
                        {fmt(selectedTransaction.fees)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">
                        {fmt(selectedTransaction.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Currency:</span>
                      <span className="font-medium">
                        {selectedTransaction.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                    Notes
                  </h3>
                  <div className="text-gray-600 bg-gray-50 p-3 rounded">
                    {typeof selectedTransaction.notes === "string" ? (
                      <p>{selectedTransaction.notes}</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(selectedTransaction.notes)
                          .filter(
                            ([key]) =>
                              key !== "current_balance" &&
                              key !== "expected_new_balance"
                          )
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between border-b border-gray-200 pb-1"
                            >
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="text-gray-600">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Creator Information */}
              {selectedTransaction.creator && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                    Created By
                  </h3>
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {selectedTransaction.creator.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">
                        {selectedTransaction.creator.email}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutTransactionsTab;
