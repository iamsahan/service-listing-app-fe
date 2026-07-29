"use client";

import { removeUserCartEntry } from "@/src/app/utils/cartcache";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { cartService } from "@/api/cartService";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, XCircle } from "lucide-react";
import Link from "next/link";

const TransactionPage = () => {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = params.bookingId;
  const transactionId = params.transactionId;
  const type = searchParams.get("type");

  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (type === "remaining") {
      verifyRemainingPayment();
    } else {
      verifyPayment();
    }
  }, [bookingId, transactionId, user, type]);

  const verifyPayment = async () => {
    if (!bookingId || !transactionId || !user) return;

    try {
      let success = false;
      let city = null;
      let subCat = null;

      if (
        transactionId !== "cash" &&
        transactionId !== "user_account_balance"
      ) {
        const reqBody = {
          bookingId,
          merchantOrderId: transactionId,
        };
        const response = await cartService.verifyPhonepePayment(reqBody);
        success = response.data.success;

        city = response.data.cityName;
        subCat = response.data.subCatSlug;
      } else {
        const response = await cartService.verifyCashPayment(bookingId);

        city = response.data.cityName;
        subCat = response.data.subCatSlug;
        success = response.data.success;
      }

      if (success && city && subCat) {
        removeUserCartEntry(user.uId, city, subCat);
      }

      setStatus(success);

      if (success) {
        setTimeout(() => {
          router.push(`/profile/customer/bookings/${bookingId}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Payment verification failed", error);
      setStatus(false);
    }
  };

  const verifyRemainingPayment = async () => {
    if (!bookingId || !transactionId || !user) return;
    try {
      const response = await cartService.verifyRemainingBookingPayment(
        transactionId
      );
      const success = response.success;

      setStatus(success);

      if (success) {
        setTimeout(() => {
          router.push(`/profile/customer/bookings/${bookingId}?bps=true`);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setStatus(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {status === false ? (
        <div className="max-w-md w-full p-8 -mt-20">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We couldn't process your payment. Please try again or contact
              support if the issue persists.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={`/profile/customer/bookings/${bookingId}`}
              className="block"
            >
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium">
                View Booking Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>

            <Link href="/services" className="block">
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-medium"
              >
                Back to Services
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Need help?{" "}
              <Link
                href="/support"
                className="text-[var(--color-primary)] font-medium hover:underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 p-12">
          <div className="flex space-x-1">
            <div
              className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-indigo-900 font-semibold text-xl">
              {transactionId === "cash"
                ? "Finalizing your booking"
                : "Verifying Payment"}
            </p>
            <p className="text-gray-500 text-sm">
              Please wait while we confirm your{" "}
              {transactionId === "cash" ? "booking" : "transaction"}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
