"use client";
import { adminBookingService } from "@/api/adminBookingService";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/bookingUtils";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [payoutLogs, setPayoutLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchPayoutLogsByDate(selectedDate);
  }, [selectedDate, statusFilter]);

  const fetchPayoutLogsByDate = async (date) => {
    try {
      const logs = await adminBookingService.getDailyPayoutLogs(date);
      let filteredLogs = logs.paymentLogs || [];

      if (statusFilter !== "all") {
        filteredLogs = filteredLogs.filter(
          (log) => log.payout_status === statusFilter
        );
      }

      filteredLogs.sort((a, b) => b.log_id - a.log_id);

      setPayoutLogs(filteredLogs);
      setIsReportGenerated(filteredLogs.length > 0);
      setSelectedLogs([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching payout logs:", error);
      setPayoutLogs([]);
      setIsReportGenerated(false);
    }
  };

  const handleGenerateDailyReport = async () => {
    try {
      await adminBookingService.genarateDailyPayoutLogs(selectedDate);
      fetchPayoutLogsByDate(selectedDate);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleSettleAmount = async () => {
    if (!selectedLog) return;

    try {
      await adminBookingService.settleDailyPayoutLogs(selectedLog.log_id, {
        amount: selectedLog.payout_amount,
        providerId: selectedLog.provider_id,
      });

      setIsModalOpen(false);
      fetchPayoutLogsByDate(selectedDate);
    } catch (error) {
      console.error("Error settling amount:", error);
    }
  };

  const handleBulkSettle = async () => {
    if (selectedLogs.length === 0) return;

    try {
      // Get unique provider IDs from selected logs
      const providerIds = [
        ...new Set(selectedLogs.map((log) => log.provider_id)),
      ].filter(Boolean);

      const requestBody = {
        date: selectedDate,
        provider_ids: providerIds,
      };

      console.log("Bulk settle request:", requestBody);

      // Assuming there's a bulk settle endpoint - you may need to create this API method
      await adminBookingService.bulkSettleDailyPayouts(requestBody);

      setIsBulkModalOpen(false);
      setSelectedLogs([]);
      setSelectAll(false);
      fetchPayoutLogsByDate(selectedDate);
    } catch (error) {
      console.error("Error bulk settling amounts:", error);
    }
  };

  const handleSelectLog = (logId, isChecked) => {
    if (isChecked) {
      setSelectedLogs((prev) => [
        ...prev,
        payoutLogs.find((log) => log.log_id === logId),
      ]);
    } else {
      setSelectedLogs((prev) => prev.filter((log) => log.log_id !== logId));
    }
  };

  const handleSelectAll = (isChecked) => {
    setSelectAll(isChecked);
    if (isChecked) {
      // Select only pending logs
      const pendingLogs = payoutLogs.filter(
        (log) => log.payout_status !== "completed"
      );
      setSelectedLogs(pendingLogs);
    } else {
      setSelectedLogs([]);
    }
  };

  const getPendingLogs = () => {
    return payoutLogs.filter((log) => log.payout_status !== "completed");
  };

  const getTotalBulkAmount = () => {
    return selectedLogs.reduce(
      (total, log) => total + (log.payout_amount || 0),
      0
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Daily Payout Logs
      </h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded shadow-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <div className="flex gap-2">
          {selectedLogs.length > 0 && (
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Bulk Pay ({selectedLogs.length})
            </Button>
          )}

          <Button
            onClick={handleGenerateDailyReport}
            disabled={isReportGenerated}
            className={isReportGenerated ? "opacity-50 cursor-not-allowed" : ""}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="border p-3 w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4"
                />
              </th>
              <th className="border p-3">Log ID</th>
              <th className="border p-3">Provider ID</th>
              <th className="border p-3">Provider Name</th>
              <th className="border p-3">Amount</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Date</th>
              <th className="border p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {payoutLogs.length > 0 ? (
              payoutLogs.map((log) => (
                <tr key={log.log_id} className="border hover:bg-gray-100">
                  <td className="border p-3">
                    {log.payout_status !== "completed" && (
                      <input
                        type="checkbox"
                        checked={selectedLogs.some(
                          (selected) => selected.log_id === log.log_id
                        )}
                        onChange={(e) =>
                          handleSelectLog(log.log_id, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                    )}
                  </td>
                  <td className="border p-3">{log.log_id}</td>
                  <td className="border p-3">{log.provider_id || "N/A"}</td>
                  <td className="border p-3">
                    {log?.provider?.User?.name || "N/A"}
                  </td>
                  <td className="border p-3 text-green-600 font-semibold">
                    {formatCurrency(log.payout_amount)}
                  </td>
                  <td
                    className={`border p-3 font-medium ${
                      log.payout_status === "completed"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {log.payout_status}
                  </td>
                  <td className="border p-3">{log.date}</td>
                  <td className="border p-3 text-center">
                    {log.payout_status !== "completed" && (
                      <Button
                        className="text-white px-3 py-1 rounded"
                        onClick={() => {
                          setSelectedLog(log);
                          setIsModalOpen(true);
                        }}
                      >
                        Settle
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Settlement</h2>
            <p className="text-gray-700">
              Are you sure you want to settle this payout of{" "}
              <span className="font-bold text-green-600">
                ${selectedLog.payout_amount}
              </span>{" "}
              for provider{" "}
              <span className="font-bold">{selectedLog.provider_id}</span>?
            </p>
            <div className="flex justify-end mt-4">
              <Button
                className="bg-gray-500 text-white px-4 py-2 mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white px-4 py-2"
                onClick={handleSettleAmount}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Settlement Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Confirm Bulk Settlement
            </h2>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                You are about to settle{" "}
                <span className="font-bold">{selectedLogs.length}</span>{" "}
                payout(s) for a total amount of:
              </p>
              <p className="text-2xl font-bold text-green-600 text-center">
                {formatCurrency(getTotalBulkAmount())}
              </p>
              <div className="mt-3 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Selected Providers:
                </p>
                {[...new Set(selectedLogs.map((log) => log.provider_id))].map(
                  (providerId) => (
                    <p key={providerId} className="text-xs text-gray-600">
                      Provider ID: {providerId}
                    </p>
                  )
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                className="bg-gray-500 text-white px-4 py-2"
                onClick={() => setIsBulkModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 text-white px-4 py-2"
                onClick={handleBulkSettle}
              >
                Confirm Bulk Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
