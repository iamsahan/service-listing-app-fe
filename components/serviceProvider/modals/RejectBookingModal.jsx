import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const RejectBookingModal = ({
  open,
  onClose,
  booking,
  rejectionReason,
  setRejectionReason,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Are you sure you want to reject this booking?</p>

          {booking && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">Booking #{booking.booking_id}</p>
              <p className="text-sm text-gray-600">
                Customer: {booking.customer?.name}
              </p>
              <p className="text-sm text-gray-600">
                Date: {booking.booking_date}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <textarea
              id="rejection-reason"
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={3}
              placeholder="Please provide a reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={!rejectionReason.trim()}
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(RejectBookingModal);
