"use client";

import { ChevronLeft, CreditCard, Ticket, AlertCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";

import { getUserCartEntriesByCityAndSubCategory } from "../../utils/cartcache";
import { cartService } from "@/api/cartService";
import { couponAPI } from "@/api/couponService";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  validateCoupon,
  getRemainingAmountForThreshold,
} from "@/utils/couponValidator";

import BookingForm from "@/components/booking/BookingForm";
import UserCouponsDialog from "@/components/booking/UserCouponsDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CouponSuccessDialog from "@/components/booking/CouponSuccessDialog";

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const bookingFormRef = useRef();

  const cityName = searchParams.get("cityName") || "";
  const cityId = searchParams.get("cityId");
  const subCategorySlug = searchParams.get("serviceName") || "";
  const categorySlug = searchParams.get("categoryName") || "";
  const subcategoryId = searchParams.get("subcategoryId");

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [userCoupons, setUserCoupons] = useState([]);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponSuccessDialogOpen, setCouponSuccessDialogOpen] = useState(false);

  useEffect(() => {
    if (!subCategorySlug || !cityName || !user) return;

    const entries = getUserCartEntriesByCityAndSubCategory(
      user.uId,
      cityName,
      subCategorySlug,
    );

    if (!entries || !entries.length) return;
    setSelectedItems(entries[0].items);
  }, [subCategorySlug, cityName, user]);

  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const totalAmount = React.useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }, [selectedItems]);

  const discountedTotal = React.useMemo(
    () => Math.max(totalAmount - couponDiscount, 0),
    [totalAmount, couponDiscount],
  );

  const handleCouponApply = async () => {
    const trimmedCode = couponCode.trim();
    if (!trimmedCode) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setCouponLoading(true);
    try {
      const response = await couponAPI.getCouponData(trimmedCode);
      const coupon = response?.data;

      if (!coupon) throw new Error("Coupon not found");

      // Use the validation utility
      const validation = validateCoupon(coupon, totalAmount, categorySlug);

      if (!validation.isValid) {
        const reasons = validation.reasons.join(". ");
        throw new Error(reasons);
      }

      if (parseFloat(coupon.amount || 0) <= 0)
        throw new Error("Invalid coupon discount amount");

      setAppliedCoupon(coupon);
      setCouponDiscount(parseFloat(coupon.amount));
      setCouponSuccessDialogOpen(true);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      toast({
        title: "Unable to Apply Coupon",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to apply coupon",
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  const openCouponDialog = async () => {
    setCouponDialogOpen(true);
    try {
      const response = await couponAPI.getUserCoupons();
      setUserCoupons(response.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load coupons" });
    }
  };

  const handleBookingSubmit = React.useCallback(async (bookingDetails) => {
    try {
      if (!selectedItems.length || !cityId) {
        toast({
          title: "Error",
          description: "City ID and services are required",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const cartData = {
        cityId,
        subcategory_id: subcategoryId,
        items: selectedItems.map((item) => ({
          id: item.id,
          duration_hours: item.duration_hours,
          duration_minutes: item.duration_minutes,
          type: item.type,
          quantity: item.quantity || 1,
        })),
        bookingDate: format(bookingDetails.bookingDate, "yyyy-MM-dd"),
        startTime: bookingDetails.startTime,
        serviceAddress: bookingDetails.serviceAddress,
        serviceLocation: bookingDetails.serviceLocation,
        subCategorySlug: subCategorySlug,
        customerNotes: bookingDetails.customerNotes || "",
        coupon_code: appliedCoupon?.code || undefined,
      };

      const res = await cartService.addToCart(cartData);
      const checkout = await cartService.proceedToCheckout();

      if (checkout?.booking?.booking_id) {
        router.push(`/payment/${checkout.booking.booking_id}`);
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Booking failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  const handleSubmitClick = () => {
    bookingFormRef.current?.submit();
  };

  const handleSelectCoupon = (coupon) => {
    // Validate before applying
    const validation = validateCoupon(coupon, totalAmount, categorySlug);

    if (!validation.isValid) {
      const reasons = validation.reasons.join(". ");
      toast({
        title: "Cannot Apply Coupon",
        description: reasons,
        variant: "destructive",
      });
      return;
    }

    setAppliedCoupon(coupon);
    setCouponDiscount(parseFloat(coupon.amount || 0));
    setCouponCode(coupon.code);
    setCouponDialogOpen(false);
    setCouponSuccessDialogOpen(true);
  };

  const isValidUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("/") || url.startsWith("data:")) return true;
    try {
      if (url.startsWith("undefined")) return false;
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getImageUrl = (segment) => {
    const raw = segment ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${segment}` : "";
    return isValidUrl(raw) ? raw : "/assets/images/card-1.jpg";
  };

  if (!selectedItems.length) return null;

  return (
    <div className="min-h-screen container mx-auto p-5 sm:p-8 max-w-7xl">
      {/* Back button */}
      <Button
        variant="ghost"
        className="p-0 hover:bg-transparent text-neutral-500 hover:text-neutral-900 flex items-center justify-start gap-1 text-xs font-bold uppercase tracking-wider transition-colors mb-4"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight pl-1 mb-8 text-left">
        Checkout
      </h1>

      {/* Structured 12-column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6 pb-10 lg:pb-0">
          <BookingForm
            cityId={cityId}
            city={cityName}
            ref={bookingFormRef}
            categorySlug={categorySlug}
            selectedItems={selectedItems}
            subCategorySlug={subCategorySlug}
            onBookingSubmit={handleBookingSubmit}
          />

          <Button
            disabled={loading}
            onClick={handleSubmitClick}
            className="w-full bg-black text-white hover:bg-neutral-800 rounded-xl font-bold py-3.5 uppercase tracking-wider text-xs shadow-md transition-all lg:hidden"
          >
            <CreditCard className="size-4 mr-2" />
            Proceed to Pay
          </Button>
        </div>

        {/* Right Column: Card Summary */}
        <Card className="lg:col-span-4 border border-neutral-200/60 shadow-sm rounded-[2rem] bg-white overflow-hidden text-left h-fit">
          <CardHeader className="bg-white border-b border-neutral-100 py-4 px-5">
            <CardTitle className="font-black uppercase text-xs tracking-wider text-neutral-800 flex items-center gap-2">
              Booking Summary
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-5">
            <div className="space-y-4">
              
              {/* Item lists */}
              <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 items-start bg-neutral-50 border border-neutral-200/40 rounded-2xl p-3"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="relative size-12 rounded-xl border border-neutral-100 overflow-hidden shrink-0 bg-neutral-100">
                        <Image
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-xs space-y-1 min-w-0 text-left">
                        <p className="font-extrabold text-neutral-900 leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-neutral-400 font-bold notranslate">
                          ₹{formatPrice(item.price)} x{item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-neutral-900 mt-1.5 shrink-0 notranslate">
                      ₹{formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Actions */}
              <div className="border-t border-neutral-100 pt-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="border border-neutral-200 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3 py-2 text-xs font-semibold flex-grow min-w-0"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <Button
                      onClick={handleCouponApply}
                      disabled={loading || couponLoading || !couponCode}
                      className="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                    >
                      Apply
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCouponRemove}
                      className="bg-red-550 hover:bg-red-650 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={openCouponDialog}
                  className="w-full border-neutral-200 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Ticket className="h-4 w-4 text-emerald-500" />
                  View My Coupons
                </Button>

                {appliedCoupon && (
                  <div className="space-y-2 border-t border-neutral-100 pt-3">
                    <div className="flex justify-between text-xs font-bold text-neutral-500 pl-1">
                      <span>Subtotal</span>
                      <span className="notranslate">
                        ₹{formatPrice(totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-emerald-600 pl-1">
                      <span>Coupon Discount</span>
                      <span className="notranslate">
                        - ₹{formatPrice(couponDiscount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Final total display */}
                <div className="flex justify-between items-center text-lg font-black border-t border-neutral-100 pt-3 pl-1">
                  <span className="text-neutral-400 font-extrabold uppercase text-xs tracking-wider">Total Amount</span>
                  <span className="notranslate text-neutral-900 font-black text-xl">
                    ₹{formatPrice(discountedTotal)}
                  </span>
                </div>

                <Button
                  disabled={loading}
                  onClick={handleSubmitClick}
                  className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md transition-all duration-300 hidden lg:flex items-center justify-center gap-2"
                >
                  <CreditCard className="size-4" /> Proceed to Pay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Coupon Dialog */}
      <UserCouponsDialog
        open={couponDialogOpen}
        appliedCoupon={appliedCoupon}
        onOpenChange={setCouponDialogOpen}
        couponLoading={couponLoading}
        userCoupons={userCoupons}
        onSelectCoupon={handleSelectCoupon}
        cartTotal={totalAmount}
        categorySlug={categorySlug}
      />

      {/* Coupon Success Dialog */}
      <CouponSuccessDialog
        open={couponSuccessDialogOpen}
        onOpenChange={setCouponSuccessDialogOpen}
        coupon={appliedCoupon}
        discount={couponDiscount}
      />
    </div>
  );
}
