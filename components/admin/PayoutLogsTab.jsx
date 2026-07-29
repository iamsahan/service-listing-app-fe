"use client";
import React, { useEffect, useState, useMemo } from "react";
import { providerAPI } from "@/api/provider";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { 
  PAGE_LIMIT, 
  fmt, 
  formatDate, 
  directionBadge, 
  getDirectionText,
  Th,
  Td,
  DetailRow,
  SummaryCard
} from "./payoutUtils";

// Payout Logs Tab Component
const PayoutLogsTab = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [calculationStatus, setCalculationStatus] = useState("");
  const [settlementDirection, setSettlementDirection] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // default today
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_LIMIT,
        search_query: search || undefined,
        calculation_status: calculationStatus || undefined,
        settlement_direction: settlementDirection || undefined,
        date: date || undefined,
      };
      const res = await providerAPI.getProviderPayoutCalculations(params);
      const payload = res.data?.data || {};
      setData(payload.calculations || []);
      setSummary(payload.summary || null);
      setTotalPages(payload.pagination?.totalPages || 1);
      setLastUpdated(new Date().toLocaleString());
    } catch (e) {
      setError(e.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData(); // This will maintain the current filters and date
  };

  const viewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, calculationStatus, settlementDirection, date]);

  const resetFilters = () => {
    setSearch("");
    setCalculationStatus("");
    setSettlementDirection("");
    setDate(new Date().toISOString().slice(0, 10));
    setPage(1);
    fetchData();
  };

  const filteredData = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((c) =>
      [
        c.provider_id,
        c.provider?.business_name,
        c.provider?.User?.name,
        c.booking_id,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Booking Related Payout Logs
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Records"
            value={summary?.totalRecords}
            loading={loading}
          />
          <SummaryCard
            title="Total Settlement"
            value={fmt(summary?.totalSettlementAmount)}
            loading={loading}
          />
          <SummaryCard
            title="ProHive Owes"
            value={summary?.platformOwesCount || summary?.qprozOwesCount}
            loading={loading}
          />
          <SummaryCard
            title="Provider Owes"
            value={summary?.providerOwesCount}
            loading={loading}
          />
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
            placeholder="Provider / Booking / ID"
            className="border rounded-md px-3 py-2 text-sm w-56 bg-white"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Calculation Status
          </label>
          <select
            value={calculationStatus}
            onChange={(e) => {
              setCalculationStatus(e.target.value);
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Settlement Direction
          </label>
          <select
            value={settlementDirection}
            onChange={(e) => {
              setSettlementDirection(e.target.value);
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">All</option>
            <option value="qp_to_sp">ProHive Owes</option>
            <option value="sp_to_qp">Provider Owes</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
              <tr>
                <Th>ID</Th>
                <Th>Provider</Th>
                <Th>Booking</Th>
                <Th>Settlement Amount</Th>
                <Th>Income Adj.</Th>
                <Th>Direction</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    No payout calculations found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <Td>{row.id}</Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {row.provider?.business_name ||
                            row.provider?.User?.name ||
                            row.provider_id}
                        </span>
                        <span className="text-gray-500 text-xs">
                          #{row.provider_id}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {row.booking_id}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {row.booking?.status &&
                            `Status: ${row.booking.status}`}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      {fmt(row.to_be_settle_amount || row.settlement_amount)}
                    </Td>
                    <Td>{fmt(row.income_from_booking)}</Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${directionBadge(
                          row.settlement_direction
                        )}`}
                      >
                        {getDirectionText(row.settlement_direction)}
                      </span>
                    </Td>
                    <Td>{formatDate(row.created_at)}</Td>
                    <Td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDetails(row)}
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

      {/* Detailed View Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Payout Calculation Details
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
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <DetailRow
                      label="Calculation ID"
                      value={selectedRecord.id}
                    />
                    <DetailRow
                      label="Booking ID"
                      value={selectedRecord.booking_id}
                    />
                    <DetailRow
                      label="Provider ID"
                      value={selectedRecord.provider_id}
                    />
                    <DetailRow
                      label="Provider Name"
                      value={
                        selectedRecord.provider?.business_name ||
                        selectedRecord.provider?.User?.name
                      }
                    />
                    <DetailRow
                      label="Business Type"
                      value={selectedRecord.provider?.business_type}
                    />
                    <DetailRow
                      label="Status"
                      value={selectedRecord.calculation_status}
                    />
                    <DetailRow
                      label="Created"
                      value={formatDate(selectedRecord.created_at)}
                    />
                    <DetailRow
                      label="Updated"
                      value={formatDate(selectedRecord.updated_at)}
                    />
                  </div>
                </div>

                {/* Financial Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Financial Details
                  </h3>
                  <div className="space-y-2">
                    <DetailRow
                      label="Previous Balance"
                      value={fmt(selectedRecord.previous_balance)}
                    />
                    <DetailRow
                      label="Income from Booking"
                      value={fmt(selectedRecord.income_from_booking)}
                    />
                    <DetailRow
                      label="New Balance"
                      value={fmt(selectedRecord.new_balance)}
                    />
                    <DetailRow
                      label="Settlement Amount"
                      value={fmt(selectedRecord.to_be_settle_amount)}
                    />
                    <DetailRow
                      label="Settlement Direction"
                      value={getDirectionText(
                        selectedRecord.settlement_direction
                      )}
                    />
                    <DetailRow
                      label="Payments Processed"
                      value={selectedRecord.payments_processed}
                    />
                  </div>
                </div>

                {/* Settlement Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Settlement Breakdown
                  </h3>
                  <div className="space-y-2">
                    <DetailRow
                      label="ProHive On Hand"
                      value={fmt(selectedRecord.qproz_on_hand_amount)}
                    />
                    <DetailRow
                      label="Provider On Hand"
                      value={fmt(selectedRecord.provider_on_hand_amount)}
                    />
                    <DetailRow
                      label="ProHive Expected Income"
                      value={fmt(selectedRecord.qproz_expected_income)}
                    />
                    <DetailRow
                      label="Provider Expected Income"
                      value={fmt(selectedRecord.provider_expected_income)}
                    />
                    <DetailRow
                      label="ProHive Settlement Balance"
                      value={fmt(selectedRecord.qproz_settlement_balance)}
                    />
                    <DetailRow
                      label="Provider Settlement Balance"
                      value={fmt(selectedRecord.provider_settlement_balance)}
                    />
                  </div>
                </div>

                {/* Booking & Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Booking & Customer
                  </h3>
                  <div className="space-y-2">
                    <DetailRow
                      label="Booking Status"
                      value={selectedRecord.booking?.status}
                    />
                    <DetailRow
                      label="Booking Date"
                      value={selectedRecord.booking?.booking_date}
                    />
                    <DetailRow
                      label="Customer Name"
                      value={selectedRecord.booking?.customer?.name}
                    />
                    <DetailRow
                      label="Customer Email"
                      value={selectedRecord.booking?.customer?.email}
                    />
                    <DetailRow
                      label="Customer Mobile"
                      value={selectedRecord.booking?.customer?.mobile}
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Description */}
              {selectedRecord.settlement_description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                    Settlement Description
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedRecord.settlement_description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                    Notes
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutLogsTab;
