import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/PageLoader";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getCouponDisabledReasons } from "@/utils/couponValidator";

export default function UserCouponsDialog({
  open,
  onOpenChange,
  couponLoading,
  userCoupons,
  appliedCoupon,
  onSelectCoupon,
  cartTotal = 0,
  categorySlug = null,
}) {
  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const getCouponStatus = (coupon) => {
    const reasons = getCouponDisabledReasons(coupon, cartTotal, categorySlug);
    return {
      isEnabled: reasons.length === 0,
      reasons,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Select a Coupon</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 max-h-[400px] overflow-y-auto">
          {couponLoading ? (
            <div className="flex items-center justify-center gap-1 py-5">
              <Spinner className="size-6" />
              <p className="text-sm ml-2">Please wait</p>
            </div>
          ) : userCoupons.length && !couponLoading ? (
            userCoupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              const isApplied = appliedCoupon?.id === coupon.id;

              return (
                <div
                  key={coupon.id}
                  className={`border rounded p-4 transition space-y-2 ${
                    status.isEnabled
                      ? "cursor-pointer hover:bg-gray-50"
                      : "opacity-60 cursor-not-allowed bg-gray-50"
                  } ${
                    isApplied
                      ? "bg-green-100 border-green-400 border-2"
                      : status.isEnabled
                        ? "border-gray-200 hover:border-gray-300"
                        : "border-gray-200"
                  }`}
                  onClick={() => status.isEnabled && onSelectCoupon(coupon)}
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-lg font-bold notranslate break-all">
                        {coupon.code}
                      </span>
                      {isApplied && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-green-600 font-medium notranslate flex-shrink-0">
                      ₹{formatPrice(coupon.amount)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    Valid until{" "}
                    {(coupon.validTo || coupon.valid_until)?.slice(0, 10) ||
                      "N/A"}
                  </p>

                  {status.reasons.length > 0 && (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                      <div className="flex items-start gap-2 text-amber-800">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                            Not available
                          </p>
                          {status.reasons.map((reason, idx) => (
                            <p key={idx} className="text-xs leading-5">
                              {reason}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No coupons available
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
