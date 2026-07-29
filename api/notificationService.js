import api from "@/utils/api";

export const notificationAPI = {
  // Send promotional notification to customers/providers
  sendPromotionalNotification: (data) =>
    api.post("/notification/promotional", data),

  // Send promotional notification to selected users
  sendPromotionalNotificationToSelectedUsers: (data) =>
    api.post("/notification/promotional/selected-users", data),
};
