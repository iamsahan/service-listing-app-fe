import { api } from "../utils/api";

export const LoginAPI = {
  // Customer OTP login
  customerLoginSendOTP: (mobile, method) =>
    api.post(
      "/auth/customer/login/send-otp",
      {
        mobile,
        method,
      },
      {
        skipToast: true,
      }
    ),

  customerLoginVerifyOTP: (mobile, otp, cityId = null) =>
    api.post(
      "/auth/customer/login/verify-otp",
      { mobile, otp, cityid: cityId },
      {
        skipToast: true,
      }
    ),

  // Admin login
  adminLogin: (email, password) =>
    api.post("/auth/admin/login", { email, password }),

  // Admin permissions (auth bootstrap)
  adminPermissions: () =>
    api.get("/admin/auth/permissions", {
      skipToast: true,
    }),

  // Service Provider login
  providerLogin: (email, password) =>
    api.post("/auth/provider/login", { email, password }),

  // Common logout
  logout: () => api.post("/auth/logout"),
};
