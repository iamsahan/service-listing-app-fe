"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { providerAPI } from "@/api/provider";
import { toast } from "@/hooks/use-toast";

const DisableProviderDialog = ({
  provider,
  open,
  onOpenChange,
  onToggleComplete,
}) => {
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await providerAPI.disableProvider(provider.provider_id, {
        is_disabled: !provider.is_disabled,
        disabled_until: provider.is_disabled ? null : endDate || null,
      });

      toast({
        title: "Success",
        description: provider.is_disabled
          ? "Provider sanctions have been removed."
          : "Provider has been sanctioned successfully.",
      });

      onToggleComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating provider disable status:", error);
      toast({
        title: "Error",
        description: "Failed to update provider status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {provider?.is_disabled ? "Remove Sanctions" : "Sanction Provider"}
          </DialogTitle>

          <DialogDescription>
            {provider?.is_disabled
              ? "Are you sure you want to remove sanctions for this provider? They will be re-enabled to receive bookings."
              : "Are you sure you want to sanction this provider? They will not receive new bookings until re-enabled."}
          </DialogDescription>
        </DialogHeader>

        {!provider?.is_disabled && (
          <div className="space-y-3">
            <Label htmlFor="endDate">Sanction End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leave empty to sanction indefinitely.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={provider?.is_disabled ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : provider?.is_disabled
              ? "Remove Sanctions"
              : "Confirm Sanction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisableProviderDialog;
