import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { CreditCard, DollarSign, TrendingUp, Percent } from "lucide-react";

const tabs = [
  { value: "ongoing", label: "Ongoing Payments" },
  { value: "pending", label: "Pending Payments" },
  { value: "history", label: "Payment History" },
];

const EarningsTable = ({
  ongoingPayments = [],
  historyPayments = [],
  pendingPayments = [],
  onConfirmCollect,
  onEnableOnlinePay,
  totalOngoingPayable = 0,
  isProcessing = false,
}) => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("ongoing");

  useEffect(() => {
    switch (activeTab) {
      case "ongoing":
        setData(ongoingPayments);
        break;
      case "pending":
        setData(pendingPayments);
        break;
      case "history":
        setData(historyPayments);
        break;
      default:
        setData(ongoingPayments);
    }
  }, [activeTab, ongoingPayments, pendingPayments, historyPayments]);

  // Enhanced payment details component for comprehensive payment data
  const PaymentDetailsCard = ({ paymentData }) => {
    if (!paymentData?.payment_summary) return null;

    const { booking, payment_summary, payment_logs, payment_analytics } =
      paymentData;

    const renderPaymentStatusBadge = (status) => {
      const statusStyles = {
        completed: "bg-green-100 text-green-800 border-green-200",
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        failed: "bg-red-100 text-red-800 border-red-200",
        cancelled: "bg-gray-100 text-gray-800 border-gray-200",
      };

      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${
            statusStyles[status] || statusStyles.pending
          }`}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
        </span>
      );
    };

    return (
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
        {/* Payment Summary Overview */}
        <Card className="shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              Payment Summary - {booking?.booking_id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-700 mb-1">
                      Total Amount
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      ₹
                      {parseFloat(payment_summary.total_amount || 0).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-700 mb-1">
                      Amount Paid
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      ₹{parseFloat(payment_summary.amount_paid || 0).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-amber-700 mb-1">
                      Amount Pending
                    </div>
                    <div className="text-2xl font-bold text-amber-900">
                      ₹
                      {parseFloat(payment_summary.amount_pending || 0).toFixed(
                        2
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-700 mb-1">
                      Completion
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {parseFloat(
                        payment_summary.payment_completion_percentage || 0
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      Subtotal
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      ₹
                      {parseFloat(payment_summary.total_subtotal || 0).toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      Tax
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      ₹{parseFloat(payment_summary.total_tax || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      Service Commission
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      ₹
                      {parseFloat(
                        payment_summary.total_service_commission || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      Advance Payment
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      ₹
                      {parseFloat(
                        payment_summary.total_advance_payment || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      Payment Logs
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {payment_summary.payment_logs_count || 0} entries
                    </span>
                  </div>
                  {payment_analytics?.effective_rates && (
                    <div className="text-xs text-slate-500">
                      Avg Tax:{" "}
                      {parseFloat(
                        payment_analytics.effective_rates.average_tax_rate || 0
                      ).toFixed(1)}
                      % | Avg Commission:{" "}
                      {parseFloat(
                        payment_analytics.effective_rates
                          .average_commission_rate || 0
                      ).toFixed(1)}
                      %
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Logs */}
        {payment_logs && payment_logs.length > 0 && (
          <Card className="shadow-md border-0">
            <CardHeader className="pb-4 bg-slate-50">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                Payment Transaction History
                <span className="ml-auto bg-primary text-white text-sm px-3 py-1 rounded-full">
                  {payment_logs.length} Transactions
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {payment_logs.map((payment, index) => (
                  <Card
                    key={payment.payment_id}
                    className="border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-bold rounded-full text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              Payment #{index + 1}
                            </h4>
                            <p className="text-xs text-slate-500">
                              ID: {payment.payment_id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900 mb-1">
                            ₹{parseFloat(payment.total_amount).toFixed(2)}
                          </div>
                          {renderPaymentStatusBadge(payment.payment_status)}
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-xs font-medium text-slate-600 mb-1">
                              Subtotal
                            </div>
                            <div className="text-lg font-bold text-blue-700">
                              ₹{parseFloat(payment.subtotal).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-medium text-slate-600 mb-1">
                              Tax ({payment.tax_percentage?.toFixed(1)}%)
                            </div>
                            <div className="text-lg font-bold text-amber-700">
                              ₹{parseFloat(payment.tax_amount).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-medium text-slate-600 mb-1">
                              Commission (
                              {payment.commission_percentage?.toFixed(1)}%)
                            </div>
                            <div className="text-lg font-bold text-green-700">
                              ₹
                              {parseFloat(payment.service_commission).toFixed(
                                2
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-medium text-slate-600 mb-1">
                              Method
                            </div>
                            <div className="text-sm font-semibold text-slate-800 capitalize bg-white px-2 py-1 rounded">
                              {payment.payment_method}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {payment.advance_payment > 0 && (
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                            <span className="text-blue-700 font-medium">
                              Advance:
                            </span>
                            <span className="font-semibold text-blue-900">
                              ₹{parseFloat(payment.advance_payment).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {payment.tip_amount > 0 && (
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                            <span className="text-purple-700 font-medium">
                              Tip:
                            </span>
                            <span className="font-semibold text-purple-900">
                              ₹{parseFloat(payment.tip_amount).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {payment.discount_amount > 0 && (
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                            <span className="text-green-700 font-medium">
                              Discount:
                            </span>
                            <span className="font-semibold text-green-900">
                              -₹{parseFloat(payment.discount_amount).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {payment.transaction_id && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="text-xs text-slate-500">
                            <span className="font-medium">Transaction ID:</span>{" "}
                            {payment.transaction_id}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Check if we have enhanced payment data structure
  const hasEnhancedPaymentData = data.some(
    (item) => item.payment_summary || item.payment_logs
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
        <h2 className="text-2xl font-bold mb-4">Earnings</h2>

        {/* Tab Switcher */}
        <div className="flex gap-2 flex-wrap mb-4 lg:mb-0 relative z-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                activeTab === tab.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Payment Display or Traditional Table */}
      {hasEnhancedPaymentData ? (
        <div className="space-y-6">
          {data.map((paymentData, index) => (
            <PaymentDetailsCard key={index} paymentData={paymentData} />
          ))}
        </div>
      ) : (
        /* Traditional Table */
        <div className="overflow-x-auto shadow rounded-md max-w-[21.5rem] md:max-w-full min-h-[400px] relative z-0">
          <table className="min-w-full">
            <thead className="bg-gray-100/75">
              <tr>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                  Booking ID
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                  Service Fee
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                  Net Earning
                </th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-gray-500 text-sm"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map((p) => {
                  const netEarning =
                    parseFloat(p.total_amount || 0) -
                    parseFloat(p.tip_amount || 0) -
                    parseFloat(p.tax_amount || 0) +
                    parseFloat(p.discount_amount || 0);

                  return (
                    <tr
                      key={`payment-${p.booking_id}`}
                      className="border-b last:border-none text-sm"
                    >
                      <td className="py-4 px-4">{p.booking_id}</td>
                      <td className="py-4 px-4">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        ₹{parseFloat(p.total_amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">₹{netEarning.toFixed(2)}</td>
                      <td className="py-4 px-4 capitalize">
                        {p.payment_status?.replace(/_/g, " ")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Collection Buttons */}
      {activeTab === "ongoing" && totalOngoingPayable > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row justify-end mt-6">
          <Button
            onClick={onConfirmCollect}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? "Processing..." : "Confirm Collected"}
          </Button>
          <Button
            onClick={onEnableOnlinePay}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Enable Online Pay
          </Button>
        </div>
      )}
    </div>
  );
};

export default EarningsTable;
