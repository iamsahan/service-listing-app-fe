import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CancelBookingModal = ({
  showCancelModal,
  setShowCancelModal,
  bookingToCancel,
  cancellationReason,
  setCancellationReason,
  handleConfirmCancel,
}) => {
  return (
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <DialogContent className="w-full rounded-lg max-w-[95vw] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Cancel Accepted Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Are you sure you want to cancel this accepted booking?</p>
          {bookingToCancel && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">
                Booking #{bookingToCancel.booking_id}
              </p>
              <p className="text-sm text-gray-600">
                Customer: {bookingToCancel.customer?.name}
              </p>
              <p className="text-sm text-gray-600">
                Date: {bookingToCancel.booking_date}
              </p>
              <p className="text-sm text-gray-600">
                Status: {bookingToCancel.status}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
            <textarea
              id="cancellation-reason"
              className={`w-full p-2 border rounded-md resize-none ${
                cancellationReason.trim() &&
                cancellationReason.trim().length < 5
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              rows={3}
              placeholder="Please provide a reason (minimum 5 characters)..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
            {cancellationReason.trim() &&
              cancellationReason.trim().length < 5 && (
                <p className="text-sm text-red-600">
                  Cancellation reason must be at least 5 characters long.
                </p>
              )}
            {cancellationReason.trim().length > 0 && (
              <p className="text-sm text-gray-500">
                {cancellationReason.trim().length}/5 characters minimum
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setCancellationReason("");
              }}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={
                !cancellationReason.trim() ||
                cancellationReason.trim().length < 5
              }
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(CancelBookingModal);
