"use client";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Wallet,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Banknote,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cartService } from "@/api/cartService";
import Image from "next/image";
import TermsAndConditionsDialog from "@/components/docs/TermsAndConditionsDialog";
import PrivacyPolicyDialog from "@/components/docs/PrivacyPolicyDialog";
import CancellationPolicyDialog from "@/components/docs/CancellationPolicyDialog";

const formatCurrency = (value) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

// Card Brand Icons
const VisaIcon = ({ className = "h-6 w-8" }) => (
  <Image
    src="/assets/images/visa.svg"
    alt="Visa"
    width={40}
    height={24}
    className={className}
  />
);

const MasterCardIcon = ({ className = "h-6 w-8" }) => (
  <Image
    src="/assets/images/mastercard.svg"
    alt="MasterCard"
    width={40}
    height={24}
    className={className}
  />
);

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [paymentType, setPaymentType] = useState("full"); // "advance" or "full"
  const [bookingData, setBookingData] = useState();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const response = await cartService.getBooking(params.bookingId);
        if (response.status !== "payment_pending") {
          throw new Error("This payment has already been completed.");
        }
        setBookingData(response);

        // Clear cash selection if advance payment is required
        if (
          response?.BookingPayment?.advance_payment > 0 &&
          selectedMethod === "cash"
        ) {
          setSelectedMethod("");
        }

        // Auto-select account balance if advance amount <= previous balance
        const advanceAmount = parseFloat(
          response?.BookingPayment?.advance_payment || 0
        );
        const accountBalance = parseFloat(response?.customer?.acc_balance || 0);

        if (advanceAmount > 0 && advanceAmount <= accountBalance) {
          // If there's advance payment and balance can cover it, auto-select account balance
          // and set payment type to advance if balance only covers advance (not full amount)
          const totalAmount = parseFloat(
            response?.BookingPayment?.total_amount || 0
          );
          if (accountBalance < totalAmount) {
            setPaymentType("advance");
          }
          setSelectedMethod("user_account_balance");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.bookingId) {
      fetchBookingData();
    }
  }, [params.bookingId]);

  // Auto-select account balance when switching to advance payment type
  useEffect(() => {
    if (bookingData && paymentType === "advance") {
      const advanceAmount = parseFloat(
        bookingData?.BookingPayment?.advance_payment || 0
      );
      const accountBalance = parseFloat(
        bookingData?.customer?.acc_balance || 0
      );

      if (advanceAmount > 0 && advanceAmount <= accountBalance) {
        setSelectedMethod("user_account_balance");
      }
    }
  }, [paymentType, bookingData]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError("Please select a payment method.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const paymentDetails = {
        bookingId: bookingData?.booking_id,
        paymentType,
        paymentMethod: selectedMethod,
      };

      const response = await cartService.proceedPayment(paymentDetails);
      if (response.success && selectedMethod === "cash") {
        const merchantOrderId = "cash";
        router.push(
          `/payment/${bookingData?.booking_id}/transaction/${merchantOrderId}`
        );
      }

      if (response.success && selectedMethod === "user_account_balance") {
        const merchantOrderId = "user_account_balance";
        router.push(
          `/payment/${bookingData?.booking_id}/transaction/${merchantOrderId}`
        );
      }

      if (response.success && response.checkoutPageUrl) {
        window.location.href = response.checkoutPageUrl;
      }
    } catch (error) {
      setError(error.message || "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getImageUrl = (path) => {
    return path && path.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`
      : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#5f60b9] mx-auto" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert
          variant="destructive"
          className="max-w-md border-none bg-destructive/5"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-5 sm:p-6 lg:pt-16 lg:space-y-6 min-h-screen">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="w-fit -mt-6 font-medium text-lg hover:bg-transparent self-start p-0"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Back</span>
      </Button>

      <div className="lg:flex lg:gap-10">
        {/* Booking Items */}
        <div className="lg:w-1/2 space-y-4">
          <Card className="border-none lg:bg-white/75">
            <CardHeader className="lg:px-1 pt-2 lg:pt-0">
              <CardTitle className="text-lg font-semibold text-center lg:text-left">
                Booking Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] p-0 overflow-y-auto">
              {bookingData?.BookingItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={getImageUrl(
                        item?.serviceItem?.icon_url ||
                          item?.packageItem?.PackageSection?.Package?.icon_url
                      )}
                      alt={item?.serviceItem?.name}
                      width={70}
                      height={70}
                      className="rounded-lg object-cover size-16"
                    />

                    <div>
                      <div className="font-medium">
                        {item?.serviceItem?.name || item?.packageItem?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    ₹{formatCurrency(item.total_price)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:w-1/2 space-y-4 mt-3 lg:mt-0">
          <Card className="border-none shadow-none lg:bg-muted/75 pb-8 sm:pb-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-center">
                Payment Details
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Choose your preferred payment method to complete the booking.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-0 lg:px-6 lg:pb-6">
              {/* Billing Summary */}
              {bookingData?.BookingPayment && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Billing Summary</label>
                  <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ₹{formatCurrency(bookingData.BookingPayment.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax & Other Charges</span>
                      <span className="font-medium">
                        + ₹
                        {formatCurrency(bookingData.BookingPayment.tax_amount)}
                      </span>
                    </div>
                    {bookingData.customer.acc_balance != 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {bookingData.customer.acc_balance < 0
                            ? "Previous Penalties"
                            : "Previous Balance"}
                        </span>
                        <span
                          className={`font-medium ${
                            bookingData.customer.acc_balance < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {bookingData.customer.acc_balance < 0 && "+"}
                          {bookingData.customer.acc_balance > 0 && "-"} ₹
                          {formatCurrency(
                            Math.abs(bookingData.customer.acc_balance)
                          )}
                        </span>
                      </div>
                    )}
                    {bookingData.BookingPayment.tip_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tip</span>
                        <span className="font-medium">
                          + ₹
                          {formatCurrency(
                            bookingData.BookingPayment.tip_amount
                          )}
                        </span>
                      </div>
                    )}
                    {bookingData.BookingPayment.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-green-600">
                          - ₹
                          {formatCurrency(
                            bookingData.BookingPayment.discount_amount
                          )}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Amount</span>
                        {(() => {
                          const totalAmount = parseFloat(
                            bookingData.BookingPayment.total_amount || 0
                          );
                          const accBalance = parseFloat(
                            bookingData.customer.acc_balance || 0
                          );
                          const payableAmount = Math.max(
                            totalAmount - accBalance,
                            0
                          );
                          const remainingBalance = accBalance - totalAmount;

                          return (
                            <div className="text-right">
                              <span className="text-[#5f60b9]">
                                ₹ {formatCurrency(payableAmount)}
                              </span>
                              {payableAmount === 0 && (
                                <div className="text-green-600 text-xs font-normal mt-1">
                                  Remaining balance: ₹
                                  {formatCurrency(remainingBalance)}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    {bookingData.BookingPayment.advance_payment > 0 && (
                      <div className="flex justify-between font-medium text-orange-600 bg-orange-50 p-3 rounded-lg">
                        <span>Advance Amount</span>
                        <span>
                          ₹
                          {formatCurrency(
                            bookingData.BookingPayment.advance_payment
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Type Selection */}
              {bookingData?.BookingPayment?.advance_payment > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Payment Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentType("advance")}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        paymentType === "advance"
                          ? "bg-[#5f60b9] text-white border-[#5f60b9] shadow-md"
                          : "bg-white border-gray-200 hover:border-[#5f60b9]/50 hover:bg-[#5f60b9]/5"
                      }`}
                    >
                      <div className="font-medium">Pay Advance</div>
                      <div
                        className={`text-xs mt-1 ${
                          paymentType === "advance"
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {bookingData.customer.acc_balance > 0
                          ? "+ Previous Balance"
                          : "Partial payment"}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType("full")}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        paymentType === "full"
                          ? "bg-[#5f60b9] text-white border-[#5f60b9] shadow-md"
                          : "bg-white border-gray-200 hover:border-[#5f60b9]/50 hover:bg-[#5f60b9]/5"
                      }`}
                    >
                      <div className="font-medium">Pay Full Amount</div>
                      <div
                        className={`text-xs mt-1 ${
                          paymentType === "full"
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        Complete payment
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Advance Payment Warning */}
              {paymentType === "advance" && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    You'll need to pay the remaining{" "}
                    <span className="font-medium">
                      ₹
                      {formatCurrency(
                        Number(bookingData?.BookingPayment.total_amount) -
                          Number(bookingData?.BookingPayment.advance_payment)
                      )}
                    </span>{" "}
                    after the service is completed.
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Payment Method</label>
                {(() => {
                  const totalAmount = parseFloat(
                    bookingData?.BookingPayment?.total_amount || 0
                  );
                  const advanceAmount = parseFloat(
                    bookingData?.BookingPayment?.advance_payment || 0
                  );
                  const accBalance = parseFloat(
                    bookingData?.customer?.acc_balance || 0
                  );
                  const isAccountBalanceSufficient = accBalance >= totalAmount;
                  const isAccountBalanceSufficientForAdvance =
                    accBalance >= advanceAmount;

                  // Show account balance option if:
                  // 1. Balance covers full amount, OR
                  // 2. Payment type is advance and balance covers advance amount
                  const showAccountBalanceOption =
                    isAccountBalanceSufficient ||
                    (paymentType === "advance" &&
                      isAccountBalanceSufficientForAdvance);

                  return (
                    <div className="space-y-3">
                      {showAccountBalanceOption ? (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMethod("user_account_balance")
                            }
                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                              selectedMethod === "user_account_balance"
                                ? "bg-[#5f60b9] text-white border-[#5f60b9] shadow-md"
                                : "bg-white border-gray-200 hover:border-[#5f60b9]/50 hover:bg-[#5f60b9]/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-10 rounded-xl ${
                                  selectedMethod === "user_account_balance"
                                    ? "bg-white/20"
                                    : "bg-gradient-to-br from-green-100 to-green-200/80"
                                } border flex items-center justify-center`}
                              >
                                <Wallet
                                  className={`size-4 ${
                                    selectedMethod === "user_account_balance"
                                      ? "text-white"
                                      : "text-green-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  Account Balance
                                </div>
                                <div
                                  className={`text-xs mt-1 ${
                                    selectedMethod === "user_account_balance"
                                      ? "text-white/80"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {isAccountBalanceSufficient
                                    ? "Use available balance"
                                    : `Pay advance (₹${formatCurrency(
                                        advanceAmount
                                      )})`}
                                </div>
                              </div>
                              {selectedMethod === "user_account_balance" && (
                                <CheckCircle className="h-5 w-5 text-white" />
                              )}
                            </div>
                          </button>

                          {/* Note when account balance only covers advance */}
                          {!isAccountBalanceSufficient &&
                            paymentType === "advance" &&
                            isAccountBalanceSufficientForAdvance && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-green-800">
                                    <div className="font-medium">
                                      Perfect Match!
                                    </div>
                                    <div className="text-xs mt-1 text-green-700">
                                      Your account balance (₹
                                      {formatCurrency(accBalance)}) will cover
                                      the advance payment of ₹
                                      {formatCurrency(advanceAmount)}.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedMethod("card")}
                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                              selectedMethod === "card"
                                ? "bg-[#5f60b9] text-white border-[#5f60b9] shadow-md"
                                : "bg-white border-gray-200 hover:border-[#5f60b9]/50 hover:bg-[#5f60b9]/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-10 rounded-xl ${
                                  selectedMethod === "card"
                                    ? "bg-white/20"
                                    : "bg-gradient-to-br from-blue-100 to-blue-200/80"
                                } border flex items-center justify-center`}
                              >
                                <CreditCard
                                  className={`size-4 ${
                                    selectedMethod === "card"
                                      ? "text-white"
                                      : "text-blue-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Pay Online</div>
                                <div
                                  className={`text-xs mt-1 ${
                                    selectedMethod === "card"
                                      ? "text-white/80"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Credit/Debit Card & UPI
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <VisaIcon className="size-7" />
                                <MasterCardIcon className="size-7" />
                                {selectedMethod === "card" && (
                                  <CheckCircle className="h-5 w-5 text-white ml-2" />
                                )}
                              </div>
                            </div>
                          </button>

                          {bookingData?.BookingPayment?.advance_payment == 0 ? (
                            <button
                              type="button"
                              onClick={() => setSelectedMethod("cash")}
                              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                                selectedMethod === "cash"
                                  ? "bg-[#5f60b9] text-white border-[#5f60b9] shadow-md"
                                  : "bg-white border-gray-200 hover:border-[#5f60b9]/50 hover:bg-[#5f60b9]/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`size-10 rounded-xl ${
                                    selectedMethod === "cash"
                                      ? "bg-white/20"
                                      : "bg-gradient-to-br from-orange-100 to-orange-200/80"
                                  } border flex items-center justify-center`}
                                >
                                  <Banknote
                                    className={`size-4 ${
                                      selectedMethod === "cash"
                                        ? "text-white"
                                        : "text-orange-600"
                                    }`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    Pay After Service
                                  </div>
                                  <div
                                    className={`text-xs mt-1 ${
                                      selectedMethod === "cash"
                                        ? "text-white/80"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Payment on completion
                                  </div>
                                </div>
                                {selectedMethod === "cash" && (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                )}
                              </div>
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Note when Pay After Service is disabled */}
              {bookingData?.BookingPayment?.advance_payment > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium">Payment Required Now</div>
                      <div className="text-xs mt-1 text-blue-700">
                        "Pay After Service" is not available because this
                        booking requires an advance payment of ₹
                        {formatCurrency(
                          bookingData.BookingPayment.advance_payment
                        )}
                        .
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert
                  variant="destructive"
                  className="border-none bg-destructive/5"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Security Notice */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">
                  Your payment information is secure and encrypted
                </span>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                size="lg"
                className="w-full h-12 text-base font-medium bg-[#5f60b9] hover:bg-[#5f60b9]/90"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Proceed to Booking"
                )}
              </Button>

              {/* Cancellation Policy Note */}
              <div className="text-center mt-3">
                <div className="text-xs text-gray-500">
                  By proceeding, you agree to our{" "}
                  <TermsAndConditionsDialog
                    trigger={
                      <span className="underline cursor-pointer underline-offset-2 transition-colors font-medium">
                        T&C
                      </span>
                    }
                  />
                  ,
                  <PrivacyPolicyDialog
                    trigger={
                      <span className="underline cursor-pointer underline-offset-2 transition-colors ml-1 font-medium">
                        Privacy
                      </span>
                    }
                  />
                  <span className="mx-1">and</span>
                  <CancellationPolicyDialog
                    trigger={
                      <span className="underline cursor-pointer underline-offset-2 transition-colors font-medium">
                        Cancellation Policy
                      </span>
                    }
                  />
                  .
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
