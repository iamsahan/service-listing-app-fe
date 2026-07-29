import api from "@/utils/api";

export const locationAPI = {
  // Map user coordinates to city
  mapUserToCity: async (latitude, longitude) => {
    try {
      const response = await api.post("/city-mappings/map-city", {
        latitude,
        longitude,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Failed to map coordinates to city"
      );
    }
  },
};
