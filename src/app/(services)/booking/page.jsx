"use client";

import { ChevronLeft, CreditCard, Ticket } from "lucide-react";
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

  const getImageUrl = (segment) => {
    return segment ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${segment}` : "";
  };

  if (!selectedItems.length) return null;

  return (
    <div className="min-h-screen container mx-auto p-5 sm:p-8">
      <Button
        variant="ghost"
        className="p-0 hover:bg-transparent hover:text-[#5f60b9]"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <h1 className="text-3xl ml-1 font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="flex lg:flex-row gap-2 lg:gap-10 flex-col-reverse">
        <div className="lg:w-2/3 space-y-6 pb-10 lg:pb-0">
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
            className="w-full h-12 [&_svg]:size-5 lg:hidden"
          >
            <CreditCard />
            Proceed to Pay
          </Button>
        </div>

        <Card className="lg:w-1/3 h-fit border-none shadow-none">
          <CardHeader className="pt-0 px-3">
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 items-start"
                >
                  <div className="flex gap-3 items-center">
                    <Image
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="size-12 object-cover rounded-md bg-gray-200"
                      loading="lazy"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-medium">{item.name}</p>

                      <p className="text-gray-500 notranslate">
                        ₹{item.price} x{item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-sm mt-1 notranslate">
                    ₹{formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t py-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="border rounded px-3 py-2 flex-grow min-w-0"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <Button
                      onClick={handleCouponApply}
                      disabled={loading || couponLoading || !couponCode}
                      className="flex-shrink-0 bg-[#5f60b9]/10 hover:bg-[#5f60b9] text-[#5f60b9] hover:text-white"
                    >
                      Apply
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCouponRemove}
                      className="flex-shrink-0 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={openCouponDialog}
                  className="w-full"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  View My Coupons
                </Button>

                {appliedCoupon && (
                  <>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Subtotal</span>
                      <span className="notranslate">
                        ₹{formatPrice(totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Coupon Discount</span>
                      <span className="notranslate">
                        - ₹{formatPrice(couponDiscount)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-[#5f60b9]">Total</span>
                  <span className="notranslate">
                    ₹{formatPrice(discountedTotal)}
                  </span>
                </div>

                <Button
                  disabled={loading}
                  onClick={handleSubmitClick}
                  className="w-full h-12 [&_svg]:size-5 hidden lg:flex"
                >
                  <CreditCard /> Proceed to Pay
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
