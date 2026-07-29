import { api } from "../utils/api";

export const AdminUserService = {
  // Get all admin users
  getAdminUsers: () => api.get("/admin/auth/admins"),

  // Create new admin user
  createAdminUser: (userData) => api.post("/admin/auth/admins", userData),

  // Update admin role
  updateAdminRole: (userId, role) =>
    api.put(`/admin/auth/admins/${userId}/role`, { role }),
  
  // Deactivate admin user
  deactivateAdminUser: (userId) =>
    api.delete(`/admin/auth/admins/${userId}/deactivate`),
  
  // Reset admin password with current password verification
  resetPassword: (passwordData) => 
    api.post("/admin/auth/reset-password", passwordData),
};
