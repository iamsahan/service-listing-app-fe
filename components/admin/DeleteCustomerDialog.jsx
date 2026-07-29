import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DeleteCustomerDialog({
  isOpen,
  setOpen,
  handleDeleteCustomer,
}) {
  const [deleteMode, setDeleteMode] = useState("soft");

  const onDelete = () => {
    handleDeleteCustomer(deleteMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Delete Customer Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Choose how you want to delete this customer account.
          </p>

          {/* Soft Delete */}
          <div className="border rounded-md p-3 space-y-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="deleteMode"
                value="soft"
                checked={deleteMode === "soft"}
                onChange={() => setDeleteMode("soft")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Deactivate account (Recommended)</p>
                <p className="text-xs text-muted-foreground">
                  The customer account will be deactivated and anonymized.
                  Personal data will be removed, but records will be kept for
                  audit and reporting purposes.
                </p>
              </div>
            </label>
          </div>

          {/* Hard Delete */}
          <div className="border rounded-md p-3 space-y-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="deleteMode"
                value="hard"
                checked={deleteMode === "hard"}
                onChange={() => setDeleteMode("hard")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-destructive">
                  Permanently delete account
                </p>
                <p className="text-xs text-muted-foreground">
                  Completely deletes the customer account along with all related
                  data such as bookings, addresses, and coupons. This action
                  cannot be undone.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Customer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
