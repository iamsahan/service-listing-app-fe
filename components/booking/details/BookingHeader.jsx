import { BookingProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { Calendar, RotateCw, X } from "lucide-react";

export default function BookingHeader({
  status,
  handleCancel,
  handleReschedule,
}) {
  return (
    <div className="bg-white border border-gray-200/75 rounded-xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#5f60b9]/10">
            <Calendar className="size-4 text-[#5f60b9]" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-gray-900 capitalize">
              {status === "assigned" ? "Pending" : status?.replace("_", " ")}
            </h2>
            <p className="text-xs text-gray-500">Booking Status</p>
          </div>
        </div>

        {["assigned", "confirmed", "accepted"].includes(status) && (
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors text-xs md:text-sm"
            onClick={handleCancel}
          >
            <X />
            Cancel
          </Button>
        )}

        {status === "reschedule" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReschedule}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-xs md:text-sm"
          >
            <RotateCw className="w-4 h-4" />
            Reschedule
          </Button>
        )}
      </div>

      <BookingProgressBar currentStatus={status} />
    </div>
  );
}
