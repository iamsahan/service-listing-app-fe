import { api } from "../utils/api";

export const versionService = {
  // Get all versions with optional filters
  getAllVersions: (params = {}) => api.get("/app-versions", { params }),

  // Get latest version for a platform
  getLatestVersion: (platform) => api.get(`/app-versions/latest/${platform}`),

  // Check if update is required
  checkUpdate: (params) => api.get("/app-versions/check-update", { params }),

  // Get version by ID
  getVersionById: (id) => api.get(`/app-versions/${id}`),

  // Create new version
  createVersion: (data) => api.post("/app-versions", data),

  // Update version
  updateVersion: (id, data) => api.put(`/app-versions/${id}`, data),

  // Delete version
  deleteVersion: (id) => api.delete(`/app-versions/${id}`),

  // Toggle version status (activate/deactivate)
  toggleVersionStatus: (id) => api.patch(`/app-versions/${id}/toggle-status`),
};
