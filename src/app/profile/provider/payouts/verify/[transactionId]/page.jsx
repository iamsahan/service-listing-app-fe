"use client";

import { profileAPI } from "@/api/profile";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { providerAPI } from "@/api/provider";

const PayoutVerificationPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = params.transactionId;
  const merchantOrderId = searchParams.get("merchantOrderId");
  const status = searchParams.get("status");

  const [verificationStatus, setVerificationStatus] = useState("loading");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const fetchUserData = () => {
      try {
        const storedUserData = localStorage.getItem("user");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData({
            provider_id: parsedUserData.providerId,
            name:
              parsedUserData.name || parsedUserData.email?.split("@")[0] || "",
            email: parsedUserData.email || "",
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (transactionId && userData?.provider_id) {
      verifyPayment();
    }
  }, [transactionId, userData]);

  const verifyPayment = async () => {
    try {
      setVerificationStatus("loading");

      const verificationData = {
        transactionId: transactionId,
        merchantOrderId: transactionId,
        status: status,
      };

      console.log("Verifying payment with data:", verificationData);

      const response = await providerAPI.verifyProviderAccountBalancePayment(
        verificationData
      );

      console.log("Verification response:", response.data);

      if (response.data && response.data.success) {
        setVerificationStatus("success");
        setPaymentDetails(response.data);

        toast({
          title: "Payment Successful",
          description: "Your payout payment has been processed successfully!",
        });
      } else {
        setVerificationStatus("failed");
        toast({
          variant: "destructive",
          title: "Payment Verification Failed",
          description:
            response.data?.message ||
            "Payment could not be verified. Please contact support.",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setVerificationStatus("failed");
      toast({
        variant: "destructive",
        title: "Payment Verification Failed",
        description: "Failed to verify payment. Please contact support.",
      });
    }
  };

  const handleReturnToPayouts = () => {
    router.push("/profile/provider/payouts");
  };

  const handleRetry = () => {
    setVerificationStatus("loading");
    verifyPayment();
  };

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Transaction ID: {transactionId}
              </p>
              {merchantOrderId && (
                <p className="text-sm text-gray-500">
                  Order ID: {merchantOrderId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your payout payment has been processed successfully.
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">
                  Payment Details
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="text-gray-900">{transactionId}</span>
                  </div>
                  {merchantOrderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="text-gray-900">{merchantOrderId}</span>
                    </div>
                  )}
                  {paymentDetails.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-900 font-medium">
                        ₹{Number(paymentDetails.amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleReturnToPayouts}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Return to Payouts
              </Button>

              <p className="text-xs text-gray-500">
                Your payout balance has been updated. You will be redirected
                automatically in 5 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. This might be due to a network
              issue or the payment was not completed.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">
                Transaction Details
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="text-gray-900">{transactionId}</span>
                </div>
                {merchantOrderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="text-gray-900">{merchantOrderId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-red-600 font-medium">Failed</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retry Verification
              </Button>

              <Button
                onClick={handleReturnToPayouts}
                variant="outline"
                className="w-full"
              >
                Return to Payouts
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  If the problem persists, please contact support with your
                  transaction ID: {transactionId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const SuccessPageWithRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/profile/provider/payouts");
    }, 15000); // Redirect after 15 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return <PayoutVerificationPage />;
};

export default SuccessPageWithRedirect;
