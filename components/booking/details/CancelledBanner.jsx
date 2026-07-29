import { Button } from "@/components/ui/button";
import { HandCoins, XCircle, RotateCw } from "lucide-react";

export default function CancelledBanner({
  isRefundEnabled,
  isRefundLoading,
  isRefundPending,
  reason,
  cancelledBy,
  handleRequestRefund,
  handleReschedule,
}) {
  return (
    <div className="border p-4 rounded-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-red-100/50">
            <XCircle className="size-5 text-red-500" />
          </div>

          <div>
            <p className="font-semibold text-gray-800">Booking Cancelled</p>
            <p className="text-sm text-gray-600">
              We hope to see you again soon!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {cancelledBy === "admin" && (
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500/20 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 hover:text-blue-700 transition-colors text-xs md:text-sm"
              onClick={handleReschedule}
            >
              <RotateCw className="w-4 h-4" />
              Reschedule
            </Button>
          )}

          {isRefundEnabled && (
            <Button
              variant="outline"
              size="sm"
              className="border-[#5f60b9]/10 text-[#5f60b9] bg-[#5f60b9]/5 hover:bg-[#5f60b9]/10 hover:border-[#5f60b9] hover:text-[#5f60b9] transition-colors text-xs md:text-sm"
              onClick={handleRequestRefund}
              disabled={isRefundLoading || isRefundPending}
            >
              <HandCoins />
              {isRefundPending ? "Refund Pending" : "Request a Refund"}
            </Button>
          )}
        </div>
      </div>

      {reason && (
        <div className="mt-4 ml-1 bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 capitalize">
            <span className="font-semibold text-gray-800">Reason:</span>{" "}
            {reason}
          </p>
        </div>
      )}
    </div>
  );
}
