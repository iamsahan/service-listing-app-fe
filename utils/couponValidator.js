export const validateCoupon = (coupon, cartTotal, categorySlug) => {
  const reasons = [];

  if (!coupon) {
    reasons.push("Invalid coupon");
    return { isValid: false, reasons };
  }

  const expireDate = coupon.validTo || coupon.valid_until;
  if (expireDate) {
    const validTo = new Date(expireDate);
    if (validTo < new Date()) {
      reasons.push("This coupon has expired");
    }
  }

  if (coupon.isOneTime && coupon.used) {
    reasons.push("This coupon has already been used");
  }

  const minThreshold = parseFloat(coupon.min_threshold) || 0;
  if (minThreshold > 0 && cartTotal < minThreshold) {
    reasons.push(
      `Minimum order amount ₹${parseFloat(minThreshold).toFixed(2)} required (Current: ₹${cartTotal.toFixed(2)})`,
    );
  }

  // Check category restrictions
  if (coupon.serviceCategories && coupon.serviceCategories.length > 0) {
    const applicableCategories = coupon.serviceCategories.map(
      (cat) => cat.slug,
    );
    if (!applicableCategories.includes(categorySlug)) {
      const categoryNames = coupon.serviceCategories
        .map((cat) => cat.name)
        .join(", ");
      reasons.push(`This coupon is only applicable for: ${categoryNames}`);
    }
  }

  // Check that remaining amount after coupon is at least ₹20
  const couponAmount = parseFloat(coupon.amount) || 0;
  const remainingAmount = cartTotal - couponAmount;
  if (remainingAmount < 20) {
    reasons.push(
      `Coupon discount cannot leave less than ₹20 remaining (Discount: ₹${couponAmount.toFixed(2)}, Cart Total: ₹${cartTotal.toFixed(2)})`,
    );
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
};

export const filterCouponsByValidity = (
  coupons,
  cartTotal,
  categorySlug = null,
) => {
  const applicableCoupons = [];
  const unavailableCoupons = [];

  coupons.forEach((coupon) => {
    const validation = validateCoupon(coupon, cartTotal, categorySlug);

    if (validation.isValid) {
      applicableCoupons.push(coupon);
    } else {
      unavailableCoupons.push({
        ...coupon,
        disabledReasons: validation.reasons,
      });
    }
  });

  return { applicableCoupons, unavailableCoupons };
};

export const isCouponThresholdMet = (coupon, cartTotal) => {
  const minThreshold = parseFloat(coupon.min_threshold) || 0;
  return cartTotal >= minThreshold;
};

export const isCouponApplicableForCategory = (coupon, categorySlug) => {
  if (!coupon.serviceCategories || coupon.serviceCategories.length === 0) {
    return true; // No restrictions, applicable to all categories
  }

  const applicableCategories = coupon.serviceCategories.map((cat) => cat.slug);
  return applicableCategories.includes(categorySlug);
};

export const getCouponDisabledReason = (coupon, cartTotal, categorySlug) => {
  const validation = validateCoupon(coupon, cartTotal, categorySlug);

  if (validation.isValid) {
    return null;
  }

  return validation.reasons[0]; // Return first reason
};

export const getCouponDisabledReasons = (coupon, cartTotal, categorySlug) => {
  const validation = validateCoupon(coupon, cartTotal, categorySlug);
  return validation.reasons;
};

export const getRemainingAmountForThreshold = (coupon, cartTotal) => {
  const minThreshold = parseFloat(coupon.min_threshold) || 0;
  const remaining = minThreshold - cartTotal;
  return Math.max(remaining, 0);
};
