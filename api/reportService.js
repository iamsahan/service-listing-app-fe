import api from "@/utils/api";

export const reportAPI = {
  // Generate customer report
  generateCustomerReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/customers", {
        params: filters,
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to generate customer report"
      );
    }
  },

  // Generate booking report
  generateBookingReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/bookings", {
        params: filters,
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to generate booking report"
      );
    }
  },

  // Generate transaction logs report
  generateTransactionLogsReport: async (filters = {}) => {
    try {
      const response = await api.get("/reports/transactions", {
        params: filters,
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to generate transaction logs report"
      );
    }
  },
};
