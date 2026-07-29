// adminBookingService.js
import { api } from "../utils/api";

export const adminBookingService = {
  getAllBookings: async (filters = {}, page) => {
    try {
      const response = await api.get(`/admin/bookings?page=${page}`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings",
      );
    }
  },

  getAllBookingsForCustomer: async (customerId) => {
    try {
      const response = await api.get(`/bookings/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch bookings for customer",
      );
    }
  },

  getAllBookingsForServiceProvider: async (serviceProviderId) => {
    try {
      const response = await api.get(`/bookings/provider/${serviceProviderId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch bookings for service provider",
      );
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking details",
      );
    }
  },

  assignServiceProvider: async (bookingId, providerId) => {
    try {
      const response = await api.put(`/admin/bookings/${bookingId}/assign`, {
        providerId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to assign service provider",
      );
    }
  },

  updateBookingStatus: async (bookingId, status, notes = "") => {
    try {
      const response = await api.put(`/admin/bookings/${bookingId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update booking status",
      );
    }
  },

  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.put(`/admin/bookings/${bookingId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel booking",
      );
    }
  },

  getServiceProviders: async (cityId, categoryId, options = {}) => {
    try {
      const params = {
        cityId,
        categoryId,
        ...options,
      };

      const response = await api.get(`/admin/service-providers`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch service providers",
      );
    }
  },

  getBookingAnalytics: async (timeRange = "week") => {
    try {
      const response = await api.get("/admin/bookings/analytics", {
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking analytics",
      );
    }
  },

  getBookingTransactions: async (page, queryParams = "") => {
    try {
      let url = `/admin/transactions?page=${page}`;
      if (queryParams) {
        url += `&${queryParams}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch transactions",
      );
    }
  },

  getCancelledBookingsByCustomer: async (queryString = "") => {
    try {
      const response = await api.get(
        `/admin/bookings/cancel/cus${queryString}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings",
      );
    }
  },

  getCancelledBookingsByProvider: async (filters = {}) => {
    try {
      const response = await api.get("/admin/bookings/cancel/provider", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch provider cancelled bookings",
      );
    }
  },

  handleCancelledBookingPanalty: async (data) => {
    try {
      const response = await api.post("/admin/bookings/cancel/handle", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings",
      );
    }
  },

  getDailyPayoutLogs: async (date) => {
    try {
      const response = await api.get(`payout/logs/${date}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch payout logs",
      );
    }
  },

  genarateDailyPayoutLogs: async (date) => {
    try {
      const response = await api.get(`payout/logs/genarate/${date}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch payout logs",
      );
    }
  },

  settleDailyPayoutLogs: async (logId, data) => {
    try {
      const response = await api.put(`payout/logs/settle/${logId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch payout logs",
      );
    }
  },

  bulkSettleDailyPayouts: async (data) => {
    try {
      const response = await api.post(`/provider-payout/bulk-payout`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to bulk settle payouts",
      );
    }
  },

  settleCustomerAccBalance: async (cusId, data) => {
    try {
      const response = await api.put(
        `/payout/customer/account/settle/${cusId}`,
        data,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch payout logs",
      );
    }
  },

  getUnassignedBookings: async (p = {}) => {
    try {
      const response = await api.get(`/admin/unassigned-queue`, {
        params: p,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch unassigned bookings",
      );
    }
  },

  getEligibleProvidersForManualAssignment: async (bookingId) => {
    try {
      const response = await api.get(
        `/admin/bookings/${bookingId}/eligible-providers`,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch eligible providers",
      );
    }
  },

  assignProviderToBooking: async (bookingId, providerId) => {
    try {
      const response = await api.post(
        `/admin/bookings/${bookingId}/assign-provider/${providerId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to assign provider to booking",
      );
    }
  },

  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.put(`/admin/bookings/${bookingId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel booking",
      );
    }
  },

  rescheduleBooking: async (bookingId, reason) => {
    try {
      const response = await api.put(`/admin/bookings/${bookingId}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to reschedule booking",
      );
    }
  },

  getAssignmentHistory: async (bookingId) => {
    try {
      const response = await api.get(
        `/admin/bookings/${bookingId}/assignment-history`,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch payout logs",
      );
    }
  },

  getRefundRequests: async (filters = {}, page = 1) => {
    try {
      const response = await api.get(
        `/admin/bookings/refund-requests?page=${page}`,
        {
          params: filters,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch refund requests",
      );
    }
  },

  getCompletedRefundRequests: async (filters = {}, page = 1) => {
    try {
      const response = await api.get(
        `/admin/bookings/refund-requests/completed?page=${page}`,
        {
          params: filters,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch completed refund requests",
      );
    }
  },

  triggerAlgorithm: async (bookingId) => {
    try {
      const response = await api.get(`/booking/${bookingId}/trigger-algo`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to trigger algorithm",
      );
    }
  },

  // Update refund request status
  updateRefundStatus: async (requestId, status) => {
    try {
      const response = await api.put(
        `/admin/refund-requests/${requestId}/status`,
        {
          status: status,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update refund status",
      );
    }
  },

  // Process booking refund
  processBookingRefund: async (bookingId, payload) => {
    try {
      const response = await api.post(
        `/admin/bookings/${bookingId}/refund`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to process refund",
      );
    }
  },

  // Get payment pending bookings
  getPaymentPendingBookings: async (filters = {}) => {
    try {
      const response = await api.get("/admin/bookings/payment-pending", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch payment pending bookings",
      );
    }
  },

  // Generate booking report
  generateBookingReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/bookings", {
        params: filters,
        responseType: "blob", // Important for PDF download
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to generate booking report",
      );
    }
  },

  // Generate transaction logs report
  generateTransactionLogsReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/transactions", {
        params: filters,
        responseType: "blob", // Important for PDF download
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to generate transaction logs report",
      );
    }
  },

  // Delete booking
  deleteBooking: async (bookingId, isRestrictedMode = true) => {
    try {
      const response = await api.delete(`/admin/bookings/${bookingId}`, {
        params: { isRestrictedMode },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete booking",
      );
    }
  },
};
//dummy comment