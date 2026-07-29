"use client";
import React, { useEffect, useState, useMemo } from "react";
import { providerAPI } from "@/api/provider";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, FileDown, Eye } from "lucide-react";
import { PAGE_LIMIT, fmt, Th, Td, ConfirmationDialog } from "./payoutUtils";

// Providers Tab Component
const ProvidersTab = () => {
  const [activeTab, setActiveTab] = useState("all"); // "all", "plus", "minus"
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [settleLoading, setSettleLoading] = useState(false);
  const [settlementInputs, setSettlementInputs] = useState({
    reference_number: "",
    notes: "",
  });
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showBalanceLogsDialog, setShowBalanceLogsDialog] = useState(false);
  const [balanceLogsData, setBalanceLogsData] = useState(null);
  const [balanceLogsLoading, setBalanceLogsLoading] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [displayLimit] = useState(10);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      let params = {};

      // Use the original API for "all" providers
      params = {
        page,
        limit: PAGE_LIMIT,
        search_query: search || undefined,
        type: activeTab, // "plus" or "minus"
        sortBy: "acc_balance",
        sortOrder: "desc",
      };
      console.log("Fetching providers with params:", params);
      const res = await providerAPI.getProvidersWithBalances(params);
      console.log("Provider API response:", res);
      console.log("Response data:", res.data);

      // Handle both possible response structures
      const payload = res.data?.data || res.data || {};
      console.log("Extracted payload:", payload);
      console.log("Providers array:", payload.providers);

      setProviders(payload.providers || []);
      setTotalPages(payload.pagination?.total_pages || 1);

      setLastUpdated(new Date().toLocaleString());
      console.log("Set providers state to:", providers);
    } catch (e) {
      console.error("Error fetching providers:", e);
      setError(e.message || "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchProviders();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    // Trigger fetch with new tab - useEffect will handle it
  };

  const handleSettleClick = (provider) => {
    setSelectedProvider(provider);
    setShowConfirmDialog(true);
  };

  const handleConfirmSettle = async () => {
    if (!selectedProvider) return;

    setSettleLoading(true);
    try {
      // Prepare settlement data with optional fields
      const settlementData = {};
      if (settlementInputs.reference_number.trim()) {
        settlementData.reference_number =
          settlementInputs.reference_number.trim();
      }
      if (settlementInputs.notes.trim()) {
        settlementData.notes = settlementInputs.notes.trim();
      }

      await providerAPI.settleProviderBalance(
        selectedProvider.provider_id,
        settlementData
      );

      // Refresh the data to show updated balances
      await fetchProviders();

      // Close dialog and reset inputs
      setShowConfirmDialog(false);
      setSelectedProvider(null);
      setSettlementInputs({ reference_number: "", notes: "" });
    } catch (error) {
      console.error("Error settling provider balance:", error);
    } finally {
      setSettleLoading(false);
    }
  };

  const handleCancelSettle = () => {
    setShowConfirmDialog(false);
    setSelectedProvider(null);
    setSettlementInputs({ reference_number: "", notes: "" });
  };

  const handleInputChange = (field, value) => {
    setSettlementInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateReportClick = () => {
    setShowReportDialog(true);
  };

  const handleConfirmGenerateReport = async () => {
    setReportLoading(true);
    try {
      const response = await providerAPI.generateSettlementReport();

      // Create blob URL and download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);

      // Extract filename from response headers or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "settlement-report.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowReportDialog(false);
    } catch (error) {
      console.error("Error generating settlement report:", error);
      alert(
        `Failed to generate report: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setReportLoading(false);
    }
  };

  const handleCancelGenerateReport = () => {
    setShowReportDialog(false);
  };

  const handleViewBalanceLogs = async (provider) => {
    setSelectedProvider(provider);
    setShowBalanceLogsDialog(true);
    setBalanceLogsLoading(true);
    setBalanceLogsData(null);

    try {
      const providerId = provider.provider_id || provider.id;
      const response = await providerAPI.getProviderAccountBalance(providerId, {
        page: 1,
        limit: 50, // Get more logs initially
      });

      if (response?.data?.data) {
        setBalanceLogsData(response.data.data);
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Error fetching balance logs:", error);
    } finally {
      setBalanceLogsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount !== null && amount !== undefined
      ? `₹${Number(amount).toFixed(2)}`
      : "—";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}, ${date.toLocaleTimeString(
      "en-US",
      { hour12: false }
    )}`;
  };

  useEffect(() => {
    console.log("ProvidersTab mounted, fetching providers...");
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    console.log("Page changed to:", page, "fetching providers...");
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const resetFilters = () => {
    setSearch("");
    setPage(1);
    fetchProviders();
  };

  const filteredProviders = useMemo(() => {
    console.log("Raw providers:", providers);
    console.log("Search term:", search);
    if (!search) {
      console.log("No search, returning all providers:", providers);
      return providers;
    }
    const q = search.toLowerCase();
    const filtered = providers.filter((p) =>
      [
        p.business_name,
        p.User?.name,
        p.User?.email,
        p.provider_id,
        p.business_type,
        p.status,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
    console.log("Filtered providers:", filtered);
    return filtered;
  }, [providers, search]);

  // Helper function to get account balance from different API responses
  const getAccountBalance = (provider) => {
    return (
      provider.User?.acc_balance ||
      provider.acc_balance ||
      provider.account_balance ||
      0
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("all")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Providers
          </button>
          <button
            onClick={() => handleTabChange("plus")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "plus"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Plus/Zero Balance
          </button>
          <button
            onClick={() => handleTabChange("minus")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "minus"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Minus Balance
          </button>
        </nav>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {activeTab === "all" && "All Provider Account Balances"}
          {activeTab === "plus" && "Providers with Plus/Zero Account Balance"}
          {activeTab === "minus" && "Providers with Minus Account Balance"}
        </h2>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <Button
              onClick={refreshData}
              disabled={loading || reportLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Search
          </label>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Provider name, email, ID..."
            className="border rounded-md px-3 py-2 text-sm w-64 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
              <tr>
                <Th>Provider ID</Th>
                <Th>Business Name</Th>
                <Th>Email</Th>
                <Th>Mobile</Th>
                <Th>Account Balance</Th>
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
              {!loading && !error && filteredProviders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No providers found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                (() => {
                  console.log(
                    "Rendering table - loading:",
                    loading,
                    "error:",
                    error,
                    "filteredProviders.length:",
                    filteredProviders.length
                  );
                  console.log("filteredProviders data:", filteredProviders);
                  return filteredProviders.map((provider) => {
                    const providerId = provider.provider_id || provider.id;
                    const accountBalance = getAccountBalance(provider);

                    return (
                      <tr key={providerId} className="hover:bg-gray-50">
                        <Td>#{providerId}</Td>
                        <Td>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {provider.business_name ||
                                provider.User?.name ||
                                provider.name ||
                                `Provider ${providerId}`}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {provider.business_type}
                            </span>
                          </div>
                        </Td>

                        <Td>{provider.User?.email || provider.email || "—"}</Td>
                        <Td>
                          {provider.User?.mobile || provider.mobile || "—"}
                        </Td>
                        <Td>
                          <span
                            className={`font-medium ${
                              parseFloat(accountBalance) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {fmt(accountBalance)}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center justify-start gap-2 min-w-[200px]">
                            {parseFloat(accountBalance) > 0 ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSettleClick(provider)}
                                className="flex items-center gap-1.5 px-3 py-2 text-green-700 border-green-600 hover:bg-green-50 hover:border-green-700 font-medium shadow-sm transition-all duration-200"
                              >
                                <DollarSign className="h-4 w-4" />
                                Settle
                              </Button>
                            ) : (
                              <div className="w-[70px]"></div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBalanceLogs(provider)}
                              className="flex items-center gap-1.5 px-3 py-2 text-blue-700 border-blue-600 hover:bg-blue-50 hover:border-blue-700 font-medium shadow-sm transition-all duration-200"
                            >
                              <Eye className="h-4 w-4" />
                              View Logs
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    );
                  });
                })()}
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelSettle}
        onConfirm={handleConfirmSettle}
        title="Confirm Settlement"
        message={`Are you sure you want to settle the balance of ${fmt(
          getAccountBalance(selectedProvider || {})
        )} for ${
          selectedProvider?.business_name ||
          selectedProvider?.User?.name ||
          selectedProvider?.name
        }?`}
        confirmText="Settle Balance"
        isLoading={settleLoading}
        showInputs={true}
        inputValues={settlementInputs}
        onInputChange={handleInputChange}
      />

      {/* Report Generation Dialog */}
      <ConfirmationDialog
        isOpen={showReportDialog}
        onClose={handleCancelGenerateReport}
        onConfirm={handleConfirmGenerateReport}
        title="Generate Settlement Report"
        message="Are you sure you want to generate the settlement report? This will include all current provider account balances and settlement information."
        confirmText="Generate Report"
        isLoading={reportLoading}
      />

      {/* Balance Logs Dialog */}
      {showBalanceLogsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Balance Logs -{" "}
                    {selectedProvider?.business_name ||
                      selectedProvider?.User?.name ||
                      selectedProvider?.name}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Provider ID: #
                    {selectedProvider?.provider_id || selectedProvider?.id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowBalanceLogsDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              {balanceLogsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Loading balance logs...
                  </div>
                </div>
              ) : balanceLogsData?.balance_update_logs?.logs ? (
                <div>
                  {/* Current Balance */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      Current Balance
                    </h3>
                    <div
                      className={`text-2xl font-bold ${
                        balanceLogsData.balance_details?.current_balance < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(
                        balanceLogsData.balance_details?.current_balance
                      )}
                    </div>
                  </div>

                  {/* Transaction Logs Table */}
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
                            ...balanceLogsData.balance_update_logs.logs,
                          ].sort(
                            (a, b) =>
                              new Date(b.date || new Date()) -
                              new Date(a.date || new Date())
                          );

                          // Limit logs based on showAllLogs state
                          const displayedLogs = showAllLogs
                            ? sortedLogs
                            : sortedLogs.slice(0, displayLimit);

                          return displayedLogs.map((log, index) => (
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
                                {formatDate(log.date)}
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
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Show All / Show Less Buttons */}
                  {balanceLogsData.balance_update_logs.logs.length >
                    displayLimit && (
                    <div className="mt-4 text-center">
                      {!showAllLogs ? (
                        <Button
                          variant="outline"
                          onClick={() => setShowAllLogs(true)}
                          className="flex items-center gap-2 mx-auto"
                        >
                          <Eye className="h-4 w-4" />
                          Show All Logs (
                          {balanceLogsData.balance_update_logs.logs.length})
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setShowAllLogs(false)}
                          className="flex items-center gap-2 mx-auto"
                        >
                          Show Less (Show only {displayLimit})
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No balance logs found for this provider.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersTab;
