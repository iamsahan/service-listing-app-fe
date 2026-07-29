"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { profileAPI } from "@/api/profile";
import { formatCurrency } from "@/utils/bookingUtils";


const RazorpayPayoutHandler = ({
  userData,
  amount,
  description = "Commission Payment",
  onSuccess,
  onError,
  onClose,
  buttonText = "Proceed to Payment",
  buttonClass = "bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg",
  disabled = false,
  showDebugInfo = false,
  razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  companyName = "ProHive",
  companyLogo = "/assets/images/prohive_logo.png",
  theme = "#10b981",
}) => {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment gateway. Please refresh the page.",
      });
      if (onError) {
        onError(new Error("Failed to load Razorpay script"));
      }
    };
    document.head.appendChild(script);
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment gateway is still loading. Please try again.",
      });
      return;
    }

    if (!userData?.provider_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Provider information is missing. Please refresh and try again.",
      });
      return;
    }

    setIsPaymentLoading(true);

    try {
      console.log("Creating commission payment order...");
      const response = await profileAPI.createCommissionPaymentOrder(
        userData?.provider_id
      );
      console.log("Order creation response:", response);

      if (response.data && (response.data.id || response.data.order_id)) {
        const orderId = response.data.id || response.data.order_id;
        const orderAmount = response.data.amount || amount * 100; // Convert to paise

        console.log("Initiating Razorpay payment:", { orderId, orderAmount });

        // Razorpay options following the documentation pattern
        const options = {
          key: razorpayKeyId,
          amount: orderAmount.toString(),
          currency: "INR",
          name: companyName,
          description: description,
          image: companyLogo,
          order_id: orderId,
          handler: function (response) {
            console.log("Payment successful:", response);
            handlePaymentSuccess(response);
          },
          prefill: {
            name:
              userData?.User?.name ||
              userData?.User?.email?.split("@")[0] ||
              "",
            email: userData?.User?.email || "",
            contact: userData?.User?.mobile || "",
          },
          notes: {
            provider_id: userData?.provider_id,
            payment_type: "commission",
            amount: amount,
          },
          theme: {
            color: theme,
          },
        };

        const rzp = new window.Razorpay(options);

        // Handle payment failure
        rzp.on("payment.failed", function (response) {
          console.error("Payment failed:", response.error);
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description:
              response.error.description ||
              "Payment could not be processed. Please try again.",
          });
          setIsPaymentLoading(false);
          if (onError) {
            onError(response.error);
          }
        });

        // Open payment gateway
        rzp.open();
      } else {
        throw new Error("Invalid order response");
      }
    } catch (error) {
      console.error("Error creating commission order:", error);
      setIsPaymentLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create commission payment order";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      if (onError) {
        onError(error);
      }
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      console.log("Verifying payment:", paymentResponse);

      const verificationData = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      };

      const response = await profileAPI.verifyCommissionPayment(
        userData?.provider_id,
        verificationData
      );

      console.log("Payment verification response:", response);

      if (response.data && response.data.success) {
        toast({
          title: "Payment Successful",
          description: "Commission payment has been processed successfully!",
        });

        if (onSuccess) {
          onSuccess(paymentResponse, response.data);
        }
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description:
          "Payment was processed but verification failed. Please contact support.",
      });
      if (onError) {
        onError(error);
      }
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showDebugInfo && process.env.NODE_ENV === "development" && (
        <div className="p-3 bg-gray-100 rounded text-xs">
          <p className="font-medium mb-2">Debug Information:</p>
          <p>Provider ID: {userData?.provider_id}</p>
          <p>Amount: {formatCurrency(amount)}</p>
          <p>Razorpay Key ID: {razorpayKeyId}</p>
          <p>Razorpay Loaded: {razorpayLoaded ? "Yes" : "No"}</p>
          <p>Payment Loading: {isPaymentLoading ? "Yes" : "No"}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPaymentLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          className={buttonClass}
          onClick={handlePayment}
          disabled={disabled || isPaymentLoading || !razorpayLoaded}
        >
          {isPaymentLoading ? "Processing..." : buttonText}
        </Button>
      </div>
    </div>
  );
};

export default RazorpayPayoutHandler;
