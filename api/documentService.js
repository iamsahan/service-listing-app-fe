import api from "@/utils/api";

export const documentAPI = {
  // Get all documents
  getDocuments: () => api.get("/documents/admin"),

  // Get a specific document by type
  getDocument: (type) => api.get(`/documents/admin/${type}`),

  // Create or update a document
  createDocument: (data) => api.post("/documents/admin", data),

  // Update a document
  updateDocument: (id, data) => api.put(`/documents/admin/${id}`, data),

  // Delete a document
  deleteDocument: (id) => api.delete(`/documents/admin/${id}`),

  // Get document for public display
  getPublicDocument: (type) => {
    console.log("DocumentAPI: Making request to /documents/public/" + type);
    console.log("DocumentAPI: Base URL:", api.defaults.baseURL);
    return api
      .get(`/documents/public/${type}`)
      .then((response) => {
        console.log("DocumentAPI: Response received:", response);
        return response;
      })
      .catch((error) => {
        console.error("DocumentAPI: Request failed:", error);
        console.error("DocumentAPI: Error response:", error.response);
        throw error;
      });
  },
};
