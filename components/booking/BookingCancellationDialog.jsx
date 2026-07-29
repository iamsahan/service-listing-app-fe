import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

export default function BookingCancellationDialog({
  open,
  onOpenChange,
  onConfirm,
  penaltyDetails,
}) {
  const hasPenalty = penaltyDetails.penalty !== "No penalty applied";
  const [needBankRefund, setNeedBankRefund] = useState(false);

  const handleConfirm = () => {
    onConfirm({ needBankRefund });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md p-4 sm:p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            {hasPenalty ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <Info className="h-5 w-5 text-blue-500" />
            )}
            Confirm Booking Cancellation
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Please review the cancellation details below before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Penalty Status Alert */}
          <div
            className={`rounded-lg p-3 sm:p-4 ${
              hasPenalty
                ? "bg-amber-50 border border-amber-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {hasPenalty ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-medium text-sm ${
                    hasPenalty ? "text-amber-800" : "text-green-800"
                  }`}
                >
                  {hasPenalty
                    ? "Cancellation Penalty Applies"
                    : "Free Cancellation Available"}
                </p>
                <p
                  className={`text-xs sm:text-sm mt-1 ${
                    hasPenalty ? "text-amber-700" : "text-green-700"
                  }`}
                >
                  {hasPenalty
                    ? "Grace period has been exceeded. A penalty will be applied to this cancellation."
                    : "You are within the grace period. No penalty will be applied to this cancellation."}
                </p>
              </div>
            </div>
          </div>

          {/* Penalty Details */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Cancellation Fee:
              </span>
              <span
                className={`text-sm font-semibold ${
                  hasPenalty ? "text-red-600" : "text-green-600"
                }`}
              >
                {penaltyDetails.penalty}
              </span>
            </div>

            {/* Refund Information */}
            {penaltyDetails.refundInfo && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  {penaltyDetails.refundInfo}
                </p>

                {/* Conditional refund message */}
                {penaltyDetails.totalRefund &&
                  penaltyDetails.totalRefund !== "₹0.00" &&
                  !penaltyDetails.totalRefund.includes("-") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                      <p className="text-sm text-blue-800 font-medium">
                        {penaltyDetails.totalRefund} will be credited to your
                        account balance
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Refund Option Checkbox */}
          {penaltyDetails.totalRefund &&
            penaltyDetails.totalRefund !== "₹0.00" &&
            !penaltyDetails.totalRefund.includes("-") && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="bankRefund"
                    checked={needBankRefund}
                    onChange={(e) => setNeedBankRefund(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="bankRefund"
                      className="text-sm font-medium text-blue-800 cursor-pointer"
                    >
                      Need refund for bank account
                    </label>
                    <p className="text-xs text-blue-600 mt-1">
                      Check this if you want the refund amount (
                      {penaltyDetails.totalRefund}) to be processed to your bank
                      account instead of account balance
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Confirmation Message */}
          <p className="text-xs sm:text-sm text-gray-600 text-center">
            This action cannot be undone. Are you sure you want to proceed with
            the cancellation?
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full sm:w-1/2"
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="w-full sm:w-1/2"
          >
            {hasPenalty ? "Cancel & Apply Fee" : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
