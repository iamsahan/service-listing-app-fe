// cartService.js
import { api } from "../utils/api";
import { format } from "date-fns";

export const cartService = {
  addToCart: async (cartData) => {
    try {
      const formattedDate = format(
        new Date(cartData.bookingDate),
        "yyyy-MM-dd"
      );
      const defaultLocation = {
        type: "Point",
        coordinates: [0, 0],
      };

      const formattedData = {
        cityId: cartData.cityId,
        subcategoryId: cartData.subcategory_id,
        items: cartData.items.map((item) => ({
          itemId: item.id,
          duration_hours: item.duration_hours,
          duration_minutes: item.duration_minutes,
          itemType:
            item.type === "package_item" ? "package_item" : "service_item",
          quantity: item.quantity || 1,
        })),
        bookingDate: formattedDate,
        startTime: cartData.startTime,
        serviceAddress: cartData.serviceAddress || "",
        serviceLocation: cartData.serviceLocation || defaultLocation,
        customerNotes: cartData.customerNotes || "",
        coupon_code: cartData.coupon_code || undefined,
        subCategorySlug: cartData.subCategorySlug || undefined,
      };

      const response = await api.post("/cart/add", formattedData);
      return response.data;
    } catch (error) {
      console.error("Cart Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to add to cart");
    }
  },

  getCart: async () => {
    try {
      const response = await api.get("/cart");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch cart");
    }
  },

  updateCartItem: async (itemData) => {
    try {
      const response = await api.put("/cart/item", {
        itemId: itemData.itemId,
        quantity: itemData.quantity,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  },

  updateTip: async (tipData) => {
    try {
      const response = await api.put("/cart/tip", {
        tipAmount: tipData.tipAmount,
        subTotal: tipData.subTotal,
        taxAmount: tipData.taxAmount,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update tip");
    }
  },

  proceedToCheckout: async () => {
    try {
      const response = await api.post("/cart/checkout");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to proceed to checkout"
      );
    }
  },

  proceedPayment: async (paymentData) => {
    try {
      const response = await api.post("/book/payment", {
        bookingId: paymentData.bookingId,
        paymentType: paymentData.paymentType,
        paymentMethod: paymentData.paymentMethod,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Payment processing failed"
      );
    }
  },

  verifyPhonepePayment: async (data) => {
    try {
      const response = await api.post(
        `/booking/payment/phone-pe/verify`,
        data,
        { skipToast: true }
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to verify PhonePe payment"
      );
    }
  },

  verifyCashPayment: async (bookingId) => {
    try {
      const response = await api.get(
        `/booking/${bookingId}/payment/cash/verify`
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to verify cash payment"
      );
    }
  },

  getBooking: async (bookingId) => {
    try {
      const response = await api.get(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  },

  getBookingDataById: async (bookingId) => {
    try {
      const response = await api.get(`/booking/${bookingId}/details`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking data"
      );
    }
  },

  completeCashPayment: async (bookingId) => {
    try {
      const response = await api.post(
        `/booking/${bookingId}/complete-cash-payment`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to complete cash payment"
      );
    }
  },

  getCustomerBookings: async () => {
    try {
      const response = await api.get("/customer/booking");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch customer bookings"
      );
    }
  },

  cancellBookingByCustomer: async (bookingId) => {
    try {
      const response = await api.get(`/booking/cancel/${bookingId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  },

  confirmCancellBookingByCustomer: async (bookingId, data) => {
    try {
      const response = await api.put(
        `/booking/cancel/confirm/${bookingId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  },

  getAvailableTimeSlotes: async (data) => {
    try {
      const response = await api.post(`/booking/availability`, data);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  },

  getMinimumCartValue: async (cityId, categoryId) => {
    try {
      const response = await api.get(
        `/booking/cart-value/category/${categoryId}/city/${cityId}`
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch MinimumCartValue"
      );
    }
  },

  proceedRemainingBookingPayment: async (bookingId) => {
    try {
      const response = await api.post(
        `/booking/${bookingId}/remaining-payment`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Payment processing failed"
      );
    }
  },

  verifyRemainingBookingPayment: async (merchantOrderId) => {
    try {
      const response = await api.get(
        `/booking/remaining-payment/verify/${merchantOrderId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Payment processing failed"
      );
    }
  },

  rescheduleBooking: async (bookingId, rescheduleData) => {
    try {
      const response = await api.put(
        `/booking/reschedule/${bookingId}`,
        rescheduleData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to reschedule booking"
      );
    }
  },

  customerCancellRescheduleBooking: async (bookingId) => {
    try {
      const response = await api.put(`/reshedule/booking/${bookingId}/cancell`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to reschedule booking"
      );
    }
  },

  customerRequestRefund: async (bookingId) => {
    try {
      const response = await api.put(`/booking/${bookingId}/request-refund`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  },
};
