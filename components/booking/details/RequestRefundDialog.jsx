import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RequestBookingRefundDialog({
  open,
  onOpenChange,
  data,
  isLoading,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Refund Requested
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Your refund details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5f60b9]"></div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  Processing request...
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Calculating your refund amount
                </p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {data.message || "Refund request submitted successfully"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Status:{" "}
                    <span className="capitalize font-medium">
                      {data.data?.refundStatus}
                    </span>
                  </p>
                </div>
              </div>

              {/* Refund Calculation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-blue-900 text-sm">
                    Refund Details
                  </h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Original Amount:</span>
                    <span className="font-medium">
                      ₹{parseFloat(data.data?.originalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {parseFloat(data.data?.penaltyAmount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Penalty Amount:</span>
                      <span className="font-medium text-red-600">
                        -₹{parseFloat(data.data?.penaltyAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-blue-200 pt-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-900">
                        Refund Amount:
                      </span>
                      <span className="text-lg font-bold text-blue-900">
                        ₹
                        {parseFloat(data.data?.actualRefundAmount || 0).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Booking ID:</span>{" "}
                  {data.data?.bookingId}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Processed at:</span>{" "}
                  {new Date(data.data?.processedAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Your refund will be processed within 5-7 business days to your
                  original payment method.
                </p>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full bg-[#5f60b9] hover:bg-[#4a4a9f] text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
