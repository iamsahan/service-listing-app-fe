"use client";
import React, { useState, useEffect } from "react";
import { providerAPI } from "@/api/provider";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  User,
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

const ProviderPayoutsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPayConfirmModal, setShowPayConfirmModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("balance");
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [displayLimit] = useState(10);

  // Get providerId from local storage or context (you may need to adjust this)
  const [providerId, setProviderId] = useState(null);

  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        setUser(user);

        if (!user?.uId) {
          setError("Please log in to view payouts");
          setLoading(false);
          return;
        }

        const response = await providerAPI.getProviderByUserId(user.uId);
        if (response.data && response.data.provider_id) {
          setProviderId(response.data.provider_id);
        } else {
          setError("Provider information not found");
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
        setError("Failed to load provider information");
        setLoading(false);
      }
    };

    fetchProviderId();
  }, []);

  const fetchAccountBalance = async (page = 1) => {
    console.log("=== FETCH ACCOUNT BALANCE CALLED ===");
    console.log("Provider ID:", providerId);
    console.log("Page:", page);

    if (!providerId) {
      console.log("❌ No provider ID available, skipping API call");
      setLoading(false);
      return;
    }

    console.log("✅ Starting account balance fetch...");
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 10,
      };
      console.log("=== API CALL DETAILS ===");
      console.log("Provider ID:", providerId);
      console.log("API call params:", params);
      console.log("About to call providerAPI.getProviderAccountBalance...");

      const response = await providerAPI.getProviderAccountBalance(
        providerId,
        params
      );

      console.log("=== API RESPONSE ===");
      console.log("Full response:", response);
      console.log("Response type:", typeof response);
      console.log("Response data:", response?.data);
      console.log("Response status:", response?.status);

      if (response?.data?.data) {
        console.log("✅ Setting account balance data:", response.data.data);
        setData(response.data.data);
        setTransactionPage(page);
        setLastUpdated(new Date().toLocaleString());
      } else {
        console.log("⚠️ Unexpected response structure:", response);
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error("❌ Error fetching account balance:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.message);
      setError(
        err.response?.data?.message || "Failed to fetch account balance"
      );
    } finally {
      console.log("=== FETCH COMPLETE ===");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchAccountBalance();
    }
  }, [providerId]);

  const refreshData = () => {
    fetchAccountBalance(transactionPage);
  };

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const formatCurrency = (amount) => {
    return amount !== null && amount !== undefined
      ? `₹${Number(amount).toFixed(2)}`
      : "—";
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : "—";
  };

  const handlePaymentOrder = async () => {
    if (!providerId) {
      setError("Provider ID not found");
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await providerAPI.createPaymentOrder(providerId);
      console.log("Payment order created:", response);

      if (response.data && response.data.success) {
        // Check for checkout URL and redirect to payment gateway
        if (response.data.checkout_url) {
          console.log(
            "Redirecting to payment gateway:",
            response.data.checkout_url
          );

          // Close the modal before redirecting
          setShowPayConfirmModal(false);

          // Redirect to payment gateway
          window.location.href = response.data.checkout_url;
        } else {
          console.warn("No checkout URL provided in response");
          alert("Payment order created but no checkout URL provided");
          setShowPayConfirmModal(false);
          fetchAccountBalance();
        }
      } else {
        setError("Failed to create payment order");
      }
    } catch (err) {
      console.error("Error creating payment order:", err);
      setError(err.response?.data?.message || "Failed to create payment order");
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-700";
  };

  if (loading && !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading account balance...
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

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const {
    provider,
    balance_details,
    payout_transactions,
    completed_calculations,
  } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Account Balance & Payouts
          </h1>
          <p className="text-gray-600">
            Track your earnings and payout history
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("balance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "balance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Account Balance
              </div>
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "transactions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payout Transactions
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "balance" && (
            <div className="space-y-6">
              {/* Balance Overview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Current Balance
                    </h3>
                  </div>
                  {balance_details.current_balance < 0 && (
                    <Button
                      onClick={() => setShowPayConfirmModal(true)}
                      disabled={paymentLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {paymentLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div
                  className={`text-3xl font-bold ${
                    balance_details.current_balance < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(balance_details.current_balance)}
                </div>
                {balance_details.current_balance < 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    You have a negative balance. Please pay the outstanding
                    amount.
                  </p>
                )}
              </div>

              {/* Transaction Logs Table */}
              {data.balance_update_logs && data.balance_update_logs.logs && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Transaction Logs
                    </h3>
                  </div>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Receive from Qproz
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pay to Qproz
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Settled by Qproz
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Settled by SP
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Direction
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Running Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          // Sort logs by date (most recent first)
                          const sortedLogs = [
                            ...data.balance_update_logs.logs,
                          ].sort((a, b) => {
                            const dateA = new Date(a.date ?? 0); // fallback
                            const dateB = new Date(b.date ?? 0);
                            return dateB - dateA;
                          });

                          // Limit logs based on showAllLogs state
                          const displayedLogs = showAllLogs
                            ? sortedLogs
                            : sortedLogs.slice(0, displayLimit);

                          return displayedLogs.map((log, index) => {
                            const logDate = new Date(log.date || new Date());
                            const formattedDateTime = log.date
                              ? `${
                                  logDate.getMonth() + 1
                                }/${logDate.getDate()}/${logDate.getFullYear()}, ${logDate.toLocaleTimeString(
                                  "en-US",
                                  { hour12: false }
                                )}`
                              : "-";

                            return (
                              <tr
                                key={`log-${index}-${
                                  log.booking_id || "no-booking"
                                }`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {log.booking_id || "-"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {formattedDateTime}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      log.type === "Booking"
                                        ? "bg-blue-100 text-blue-800"
                                        : log.type === "Settled by Qproz"
                                        ? "bg-green-100 text-green-800"
                                        : log.type === "Settled by SP"
                                        ? "bg-purple-100 text-purple-800"
                                        : log.type === "Withdrawal Processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : log.type === "penalty"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {log.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {log.receive_from_qproz ? (
                                    <span className="text-green-600 font-medium">
                                      {formatCurrency(log.receive_from_qproz)}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {log.pay_to_qproz ? (
                                    <span className="text-red-600 font-medium">
                                      {formatCurrency(log.pay_to_qproz)}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {log.settled_by_qproz ? (
                                    <span className="text-green-600 font-medium">
                                      {formatCurrency(log.settled_by_qproz)}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {log.settled_by_sp ? (
                                    <span className="text-purple-600 font-medium">
                                      {formatCurrency(log.settled_by_sp)}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      log.direction === "Receive"
                                        ? "bg-green-100 text-green-800"
                                        : log.direction === "Pay"
                                        ? "bg-red-100 text-red-800"
                                        : log.direction === "Settled"
                                        ? "bg-gray-100 text-gray-800"
                                        : log.direction === "Processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {log.direction}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {log.running_balance !== null &&
                                  log.running_balance !== undefined
                                    ? formatCurrency(log.running_balance)
                                    : "-"}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Show All Button for Transaction Logs */}
                  {data.balance_update_logs.logs.length > displayLimit &&
                    !showAllLogs && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllLogs(true)}
                          className="flex items-center gap-2 mx-auto"
                        >
                          <FileText className="h-4 w-4" />
                          Show All Logs ({data.balance_update_logs.logs.length})
                        </Button>
                      </div>
                    )}

                  {/* Show Less Button for Transaction Logs */}
                  {showAllLogs &&
                    data.balance_update_logs.logs.length > displayLimit && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllLogs(false)}
                          className="flex items-center gap-2 mx-auto"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Show Less (Show only {displayLimit})
                        </Button>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payout Transactions
                </h3>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Direction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payout_transactions.transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          No payout transactions found
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        // Sort transactions by created_at (most recent first)
                        const sortedTransactions = [
                          ...payout_transactions.transactions,
                        ].sort(
                          (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        );

                        // Limit transactions based on showAllTransactions state
                        const displayedTransactions = showAllTransactions
                          ? sortedTransactions
                          : sortedTransactions.slice(0, displayLimit);

                        return displayedTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{transaction.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.created_by === null
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {transaction.created_by === null
                                  ? "SP to Qproz"
                                  : "Qproz to SP"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                  transaction.status
                                )}`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  viewTransactionDetails(transaction)
                                }
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ));
                      })()
                    )}
                  </tbody>
                </table>
              </div>

              {/* Show All Button */}
              {payout_transactions.transactions.length > displayLimit &&
                !showAllTransactions && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllTransactions(true)}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <FileText className="h-4 w-4" />
                      Show All Transactions (
                      {payout_transactions.transactions.length})
                    </Button>
                  </div>
                )}

              {/* Show Less Button */}
              {showAllTransactions &&
                payout_transactions.transactions.length > displayLimit && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllTransactions(false)}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Show Less (Show only {displayLimit})
                    </Button>
                  </div>
                )}

              {/* Pagination */}
              {payout_transactions.pagination &&
                payout_transactions.pagination.total_pages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {payout_transactions.pagination.current_page} of{" "}
                      {payout_transactions.pagination.total_pages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAccountBalance(transactionPage - 1)}
                        disabled={
                          !payout_transactions.pagination.has_previous_page ||
                          loading
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAccountBalance(transactionPage + 1)}
                        disabled={
                          !payout_transactions.pagination.has_next_page ||
                          loading
                        }
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPayConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Confirm Payment
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPayConfirmModal(false)}
                disabled={paymentLoading}
              >
                ✕
              </Button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">
                    Outstanding Balance
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {data &&
                    formatCurrency(
                      Math.abs(data.balance_details.current_balance)
                    )}
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                You are about to create a payment order for your outstanding
                balance. This will redirect you to the payment gateway to
                complete the payment.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPayConfirmModal(false)}
                disabled={paymentLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentOrder}
                disabled={paymentLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {paymentLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Payment Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Transaction Details
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransactionModal(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">#{selectedTransaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {formatCurrency(selectedTransaction.amount)}
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
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {formatDate(selectedTransaction.created_at)}
                </span>
              </div>
              {selectedTransaction.reference_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">
                    {selectedTransaction.reference_number}
                  </span>
                </div>
              )}
              {selectedTransaction.notes && (
                <div>
                  <span className="text-gray-600 block mb-2">
                    Payment Details:
                  </span>
                  <div className="text-sm bg-gray-50 p-3 rounded space-y-2">
                    {typeof selectedTransaction.notes === "object" ? (
                      <>
                        {selectedTransaction.notes.payment_type && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Type:</span>
                            <span className="font-medium">
                              {selectedTransaction.notes.payment_type}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes
                          .phonepe_merchant_order_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium text-xs">
                              {
                                selectedTransaction.notes
                                  .phonepe_merchant_order_id
                              }
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes.phonepe_payment_status && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Payment Status:
                            </span>
                            <span className="font-medium">
                              {selectedTransaction.notes.phonepe_payment_status}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes.payment_status && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium">
                              {selectedTransaction.notes.payment_status}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes.previous_balance !==
                          undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Previous Balance:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(
                                selectedTransaction.notes.previous_balance
                              )}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes.current_balance !==
                          undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Current Balance:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(
                                selectedTransaction.notes.current_balance
                              )}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes.new_balance !==
                          undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">New Balance:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                selectedTransaction.notes.new_balance
                              )}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes.expected_new_balance !==
                          undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Expected Balance:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(
                                selectedTransaction.notes.expected_new_balance
                              )}
                            </span>
                          </div>
                        )}
                        {selectedTransaction.notes
                          .verification_completed_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Verified At:</span>
                            <span className="font-medium text-xs">
                              {formatDate(
                                selectedTransaction.notes
                                  .verification_completed_at
                              )}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <span>{selectedTransaction.notes}</span>
                    )}
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

export default ProviderPayoutsPage;
