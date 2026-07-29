import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DeleteBookingDialog({
  isOpen,
  setOpen,
  handleDeleteBooking,
}) {
  const [deleteMode, setDeleteMode] = useState("restricted");

  const onDelete = () => {
    handleDeleteBooking(deleteMode === "restricted");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Delete Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Choose how you want to delete this booking.
          </p>

          {/* Restricted Mode */}
          <div className="border rounded-md p-3 space-y-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="deleteMode"
                value="restricted"
                checked={deleteMode === "restricted"}
                onChange={() => setDeleteMode("restricted")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Restricted mode (Recommended)</p>
                <p className="text-xs text-muted-foreground">
                  Prevents deleting bookings that already have completed
                  payments. This keeps financial records safe.
                </p>
              </div>
            </label>
          </div>

          {/* Cascade Mode */}
          <div className="border rounded-md p-3 space-y-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="deleteMode"
                value="cascade"
                checked={deleteMode === "cascade"}
                onChange={() => setDeleteMode("cascade")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-destructive">
                  Cascade mode (Permanent delete)
                </p>
                <p className="text-xs text-muted-foreground">
                  Deletes the booking even if payment is completed and removes
                  all related data. This action cannot be undone.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
