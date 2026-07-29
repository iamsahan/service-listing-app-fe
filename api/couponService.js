import api from "@/utils/api";

export const couponAPI = {
  getUserCoupons: () => api.get("/coupons/me"),
  getCoupons: (params) => api.get("/coupons", { params }),
  getCouponData: (code) => api.get(`/coupons/${code}`),
  addCoupon: (data) => api.post("/coupons", data),
  updateCoupon: (code, data) => api.put(`/coupons/${code}`, data),
  deleteCoupon: (code) => api.delete(`/coupons/${code}`),

  // Coupon Usages
  getCouponUsages: (params = {}) =>
    api.get("/coupons/admin/usages", { params }),

  getCouponUsagesByCouponId: (couponId, page = 1, limit = 20) =>
    api.get("/coupons/admin/usages", {
      params: { couponId, page, limit },
    }),

  getCouponUsagesByUserId: (userId, page = 1, limit = 20) =>
    api.get("/coupons/admin/usages", {
      params: { userId, page, limit },
    }),
};
