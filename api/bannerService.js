import api from "@/utils/api";

export const bannerAPI = {
  getBanners: () => api.get("/banners"),
  getBanner: (id) => api.get(`/banners/${id}`),
  createBanner: (data) =>
    api.post("/banners", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateBanner: (id, data) =>
    api.put(`/banners/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
  getByPosition: (params) =>
    api.get(`/banners/position`, {
      params,
    }),
};
