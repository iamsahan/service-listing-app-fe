import { api } from "../utils/api";

export const cityMappingService = {
  // Get all city mappings
  getAllCityMappings: (params = {}) => api.get("/city-mappings", { params }),

  // Get city mapping by ID
  getCityMappingById: (id) => api.get(`/city-mappings/${id}`),

  // Get main city for a sub-city
  getMainCityForSubCity: (subCityName) =>
    api.get(`/city-mappings/check/${encodeURIComponent(subCityName)}`),

  // Create new city mapping
  createCityMapping: (data) => api.post("/city-mappings", data),

  // Update city mapping
  updateCityMapping: (id, data) => api.put(`/city-mappings/${id}`, data),

  // Delete city mapping
  deleteCityMapping: (id) => api.delete(`/city-mappings/${id}`),

  // Bulk create city mappings
  bulkCreateCityMappings: (mappings) =>
    api.post("/city-mappings/bulk", { mappings }),
};
