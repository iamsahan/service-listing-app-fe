import React from "react";
import { CheckCircle2, Sparkles, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CouponSuccessDialog = ({ open, onOpenChange, coupon, discount }) => {
  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] rounded-lg sm:max-w-sm p-0 gap-0 overflow-hidden border-none">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />

              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-center">
              Coupon Applied Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              You're saving big on this booking
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Coupon Code Display */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-dashed border-[#5f60b9]/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#5f60b9]" />
              <span className="text-sm text-gray-600 font-medium">
                Coupon Code
              </span>
            </div>
            <p className="text-xl font-bold text-[#5f60b9] tracking-wider notranslate">
              {coupon?.code || "N/A"}
            </p>
          </div>

          {/* Savings Amount */}
          <div className="rounded-xl p-5 border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Savings</p>
                <p className="text-3xl font-bold notranslate">
                  ₹{formatPrice(discount)}
                </p>
              </div>
              <Badge className="py-1">Discount Applied</Badge>
            </div>
          </div>

          {/* Coupon Details */}
          {coupon?.description && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed">
                {coupon.description}
              </p>
            </div>
          )}

          {/* Validity */}
          {coupon?.validTo && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Valid until:</span>
              <span className="text-xs font-semibold text-gray-700">
                {new Date(coupon.validTo).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Action */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-12 bg-[#5f60b9] hover:bg-[#5f60b9]/90"
          >
            Continue Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponSuccessDialog;
