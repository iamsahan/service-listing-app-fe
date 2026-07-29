import { api } from "../utils/api";

export const providerAPI = {
  //service perovider inquiry
  getEnquiry: (filters, currentPage) =>
    api.get(`/enquiry?page=${currentPage}`, { params: filters }),
  getEnquiryById: (inquiryId) => api.get(`/enquiry/${inquiryId}`),
  createEnquiry: (data) => api.post("/enquiry", data),
  approveEnquiry: (inquiryId) => api.put(`/enquiry/${inquiryId}/approve`),
  rejectEnquiry: (inquiryId, data) =>
    api.put(`/enquiry/${inquiryId}/reject`, data),
  regenerateEnquiryLink: (inquiryId) =>
    api.put(`/enquiry/${inquiryId}/regenerate-link`),
  deleteEnquiry: (inquiryId) => api.delete(`/enquiry/${inquiryId}`),

  // Service Provider Registration
  registerProvider: (data, onUploadProgress) =>
    api.post("/provider/register", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes timeout for file uploads
      onUploadProgress: onUploadProgress, // Progress callback
    }),
  getProvider: (id) => api.get(`/provider/${id}`),
  getProviderByToken: (token) => api.get(`/provider/token/${token}`),
  updateProvider: (id, data) => api.put(`/provider/${id}`, data),
  updateProviderProfile: (id, data) => api.put(`/provider/update/${id}`, data),
  deleteProvider: (id) => api.delete(`/provider/${id}`),
  getProviders: (filters, currentPage) =>
    api.get(`/providers?page=${currentPage}`, { params: filters }),
  getProviderByUserId: (userId) => api.get(`/provider/user/${userId}`),
  getProviderCategories: () => api.get(`/provider/categories`),

  // Service Provider Password
  setProviderPassword: (data, id) => api.put(`/provider/password/${id}`, data),

  // Service Provider Bookings
  getProviderBookings: (id) => api.get(`/provider/bookings/${id}`),
  getProviderCancelledBookings: () =>
    api.get(`/provider/profile/cancelled-bookings`),
  getProviderBookingRequests: (providerId) =>
    api.get(`/provider/booking-requests/${providerId}`),
  acceptProviderBookings: (bookingId, data) =>
    api.put(`/provider/booking-requests/${bookingId}/accept`, data),
  RejectProviderBookings: (assignmentId, data) =>
    api.put(`/provider/booking-requests/${assignmentId}/reject`, data),
  getProviderCancellationPenalty: (bookingId, data) =>
    api.post(`/provider/booking/${bookingId}/cancel/request`, data),
  providerCancellAcceptedBookings: (bookingId, data) =>
    api.put(`/provider/booking/${bookingId}/cancel`, data),
  sendBookingStartOtp: (data) => api.post("/booking/send-otp", data),
  bookingStartVerify: (data) => api.post("/booking/verify-otp", data),
  uploadBookingProofImage: (data) =>
    api.post("/booking-service-proof/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  stopOngoingBooking: (data) => api.post(`/booking/stop/`, data),
  stopOngoingBookingVerify: (data) =>
    api.post("/booking/stop/verify-otp", data),
  sendBookingEditOtp: (data) => api.post("/booking/edit/send-otp", data),
  bookingEditVerify: (data) => api.post("/booking/edit/verify-otp", data),
  getProviderBookingPayments: (id) => api.get(`/booking/${id}/payment`),
  getProviderEmployeeBookingPayments: (id) =>
    api.get(`/booking/${id}/payment/employee`),
  collectBookingPayment: (id, data) =>
    api.put(`/booking/${id}/payment/collect`, data),
  enableBookingOnlinePaymentButton: (bookingId, data) =>
    api.put(`/booking/${bookingId}/payment-button-enabled`, data),
  getProviderBookingPaymentsHistory: (id) =>
    api.get(`/booking/${id}/payment/history`),
  getProviderEmployeeBookingPaymentsHistory: (id) =>
    api.get(`/booking/${id}/payment/history/employee`),

  // Service Provider Employee
  getProviderEmployees: (providerId) =>
    api.get(`/providers/${providerId}/employees`),
  updateProviderEmployees: (employeeId, data) =>
    api.put(`/providers/${employeeId}/employees`, data),
  deleteProviderEmployee: (employeeId) =>
    api.delete(`/providers/${employeeId}/employees`),
  addProviderEmployees: (providerId, data) =>
    api.post(`/providers/${providerId}/employees`, data),
  updateProviderAvailability: (providerId, data) =>
    api.put(`/provider/availability/${providerId}`, data),
  getEmployeeByUserId: () => api.get(`/user/employee`),
  getEmployeeBookings: (employeeId) =>
    api.get(`/employee/bookings/${employeeId}`),
  getAvailableEmployees: (
    providerId,
    booking_id,
    bookingDate,
    startTime,
    endTime
  ) =>
    api.get(`/available/${providerId}/employees`, {
      params: {
        booking_id,
        bookingDate,
        start_time: startTime,
        end_time: endTime,
      },
    }),
  uploadProviderEmployeePhoto: (employeeId, data) =>
    api.put(`/providers/${employeeId}/employees/profile/photo/change`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  //service provider categories
  updateProviderCategory: (providerId, data) =>
    api.put(`/providers/${providerId}/categories`, data),

  //service provider documents
  approveProviderDocument: (documentId) =>
    api.put(`/provider/doc/approve/${documentId}`),

  rejectProviderDocument: (documentId) =>
    api.put(`/provider/doc/reject/${documentId}`),

  uploadProviderDocument: (providerId, updateData) =>
    api.put(`/provider/${providerId}/doc/update`, updateData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  //service provider payouts
  getProviderDailyPayouts: () => api.get("/provider/payouts/daily"),

  // Admin/provider payouts calculations listing (supports filters & pagination)
  getProviderPayoutCalculations: (params = {}) =>
    api.get("/payout/balance-calculations", { params }),

  // Get providers with their account balances
  getProvidersWithBalances: (params = {}) =>
    api.get("/payout/providers/account-balances", { params }),

  // Get individual provider account balance details
  getProviderAccountBalance: (providerId, params = {}) =>
    api.get(`/provider-payout/providers/${providerId}/account-balance`, {
      params,
    }),

  // Settle provider balance
  settleProviderBalance: (providerId, data = {}) =>
    api.post(`/payout/providers/settle-balance/${providerId}`, data),

  // Generate settlement report
  generateSettlementReport: () =>
    api.get("/payout/settlement-report", {
      responseType: "blob",
      timeout: 30000, // 30 second timeout for report generation
    }),

  // Get all payout transactions history (admin only)
  getAllPayoutTransactions: (params = {}) =>
    api.get("/payout/transactions", { params }),

  processProviderDailyPayment: (data) =>
    api.post("/provider/payouts/daily/process", data),

  verifyProviderDailyPayment: (data) =>
    api.post("/provider/payouts/daily/verify", data),

  getProviderDuePayouts: () => api.get("/provider/payouts/due"),

  verifyProviderDuePayment: (data) =>
    api.post("/provider/payouts/due/verify", data),

  //profile overview
  getProfileData: () => api.get("/provider/profile/me"),
  getActivityOverview: () => api.get("/provider/profile/overview"),
  updateProfile: (data) => api.put("/provider/profile/update", data),
  verifyProfile: (data) => api.post("/provider/profile/verify", data),
  resetPassword: (data) => api.post("/provider/profile/reset-password", data),
  forgotPassword: (data) => api.post("/provider/profile/forgot-password", data),
  resetPasswordViaToken: (data) =>
    api.post("/provider/profile/reset-password-token", data),
  getBookingsStats: () => api.get("/provider/profile/bookings-stats"),
  getEarningsStats: () => api.get("/provider/profile/earnings-stats"),
  getProviderPendingBookingPayments: () =>
    api.get("/provider/profile/pending-payments"),

  updateProviderLocation: (providerId, data) =>
    api.put(`/provider/location/${providerId}`, data),

  // Create payment order for negative balance
  createPaymentOrder: (providerId) =>
    api.post(`/provider-payout/account-balance/create-order/${providerId}`),

  verifyProviderAccountBalancePayment: (data) =>
    api.post("/provider-payout/account-balance/verify", data),

  // Disable provider
  disableProvider: (providerId, data) =>
    api.put(`/providers/${providerId}/disable`, data),

  // Get provider service categories with subscriptions
  getProviderServiceCategories: (providerId) =>
    api.get(`/provider/${providerId}/service-categories`),

  // Get current provider's service categories (for provider profile)
  getMyServiceCategories: () => api.get("/provider/profile/service-categories"),
};
