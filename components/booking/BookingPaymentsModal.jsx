import React, { useState, useEffect } from "react";
import { X, CreditCard, Banknote, Calendar, Copy } from "lucide-react";
import { providerAPI } from "../../api/provider";
import { toast } from "@hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BookingPaymentsModal = ({ isOpen, onClose, booking }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentButtonEnabled, setIsPaymentButtonEnabled] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      fetchPaymentData();
    }
  }, [isOpen, booking]);

  // Update local payment button state when booking prop changes (but only as fallback)
  useEffect(() => {
    // Only update from booking prop if we don't have payment data yet
    if (booking && !paymentData) {
      console.log(
        "Fallback update from booking prop:",
        booking?.is_payment_button_enabled || false
      );
      setIsPaymentButtonEnabled(booking?.is_payment_button_enabled || false);
    }
  }, [booking?.is_payment_button_enabled, paymentData]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      console.log("Booking object:", booking);
      console.log("Available booking fields:", Object.keys(booking));
      const bookingId = booking.id || booking.booking_id;
      console.log("Using booking ID:", bookingId);

      const response = await providerAPI.getProviderBookingPayments(bookingId);
      console.log("Payment data response:", response.data);
      setPaymentData(response.data);

      // Update payment button status from the fresh API response
      if (response.data?.booking) {
        const apiButtonEnabled =
          response.data.booking.is_payment_button_enabled || false;
        console.log(
          "Setting payment button status from API response:",
          apiButtonEnabled
        );
        setIsPaymentButtonEnabled(apiButtonEnabled);
      } else {
        // Fallback to booking prop if not in API response
        console.log(
          "Fallback to booking prop:",
          booking?.is_payment_button_enabled || false
        );
        setIsPaymentButtonEnabled(booking?.is_payment_button_enabled || false);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Transaction ID copied to clipboard",
      variant: "default",
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const confirmPaymentCollection = async () => {
    setIsProcessing(true);
    try {
      await providerAPI.collectBookingPayment(booking.booking_id, {
        providerId: booking.provider_id,
      });
      setIsConfirmOpen(false);
      toast({
        title: "Success!",
        description: "Payment collection confirmed successfully!",
      });
      // Refresh payment data
      fetchPaymentData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment collection.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const enableOnlineRemainingPayment = async () => {
    if (!booking?.booking_id) return;
    setIsProcessing(true);

    const isCurrentlyEnabled = isPaymentButtonEnabled;
    const newEnabledState = !isCurrentlyEnabled;

    try {
      const response = await providerAPI.enableBookingOnlinePaymentButton(
        booking.booking_id,
        {
          enabled: newEnabledState,
        }
      );

      // Update local state based on API response
      if (response.data && typeof response.data.new_status === "boolean") {
        setIsPaymentButtonEnabled(response.data.new_status);
      } else {
        // Fallback to the intended state if response doesn't have new_status
        setIsPaymentButtonEnabled(newEnabledState);
      }

      toast({
        title: "Success!",
        description: `Online payment for remaining amount ${
          newEnabledState ? "enabled" : "disabled"
        }.`,
      });
      // Refresh payment data
      fetchPaymentData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          `Failed to ${newEnabledState ? "enable" : "disable"} online payment.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onConfirmCollect = () => {
    setIsConfirmOpen(true);
  };

  const onEnableOnlinePay = () => {
    enableOnlineRemainingPayment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Payment Summary - {booking?.booking_id}
              </h2>
              <p className="text-sm text-gray-500">
                Booking payment details and transaction history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : paymentData ? (
            <div className="space-y-6">
              {/* Payment Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(
                      paymentData.payment_summary?.final_total || 0
                    )}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">
                    Amount Already paid by customer
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(
                      paymentData.payment_summary?.amount_paid || 0
                    )}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium">
                    Amount Customer need to pay
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(
                      paymentData.payment_summary?.amount_pending || 0
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Collection Buttons - Show only if there's pending amount */}
              {paymentData.payment_summary?.amount_pending > 0 && (
                <div className="flex flex-col gap-4 sm:flex-row justify-end mt-6">
                  <Button
                    onClick={onConfirmCollect}
                    disabled={isProcessing || isPaymentButtonEnabled}
                    className={`${
                      isPaymentButtonEnabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                    title={
                      isPaymentButtonEnabled
                        ? "Cannot confirm collection when online payment is enabled"
                        : ""
                    }
                  >
                    {isProcessing ? "Processing..." : "Confirm Collected"}
                  </Button>
                  {/* Debug log for button state */}
                  {console.log(
                    "Button render - isPaymentButtonEnabled:",
                    isPaymentButtonEnabled
                  )}
                  {console.log(
                    "Button render - booking.is_payment_button_enabled:",
                    booking?.is_payment_button_enabled
                  )}
                  <Button
                    onClick={onEnableOnlinePay}
                    disabled={isProcessing}
                    className={`${
                      isPaymentButtonEnabled
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white`}
                  >
                    {isProcessing
                      ? "Processing..."
                      : isPaymentButtonEnabled
                      ? "Disable Online Pay"
                      : "Enable Online Pay"}
                  </Button>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Payment Logs</span>
                  <span>
                    {paymentData.payment_summary?.payment_logs_count || 0}{" "}
                    entries
                  </span>
                </div>
              </div>

              {/* Payment Transaction History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gray-100 rounded">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Payment Transaction History
                    </h3>
                  </div>
                  <div className="bg-black text-white px-3 py-1 rounded-full text-sm">
                    {paymentData.payment_logs?.length || 0} Transactions
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentData.payment_logs?.map((payment, index) => (
                    <div
                      key={payment.payment_id}
                      className="border rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">
                              Payment #{index + 1}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {payment.payment_id}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatCurrency(payment.total_amount)}
                          </div>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              payment.payment_status
                            )}`}
                          >
                            {payment.payment_status?.charAt(0).toUpperCase() +
                              payment.payment_status?.slice(1)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500">Subtotal</div>
                          <div className="font-medium text-blue-600">
                            {formatCurrency(payment.subtotal)}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            Method
                            {getPaymentMethodIcon(payment.payment_method)}
                          </div>
                          <div className="font-medium capitalize">
                            {payment.payment_method}
                          </div>
                        </div>
                      </div>

                      {payment.transaction_id && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              Transaction ID:
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">
                                {payment.transaction_id}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(payment.transaction_id)
                                }
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(payment.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No payment data available</p>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle>Confirm Payment Collection</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to mark this payment as collected?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmPaymentCollection}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? "Processing..." : "Yes, Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BookingPaymentsModal;
