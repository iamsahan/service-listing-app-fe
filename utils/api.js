import { toast } from "@hooks/use-toast";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Handle session expired
const handleSessionExpired = (user) => {
  localStorage.removeItem("user");

  const redirectPath =
    user?.role === "admin"
      ? "/login/admin"
      : user?.role === "service_provider"
      ? "/login/provider"
      : "/";

  setTimeout(() => {
    window.location.href = redirectPath;
  }, 2000);
};

// Handle insufficient permissions
const handleInsufficientPermissions = () => {
  localStorage.removeItem("user");

  toast({
    title: "Access Denied",
    description: "You don't have permission to perform this action.",
    variant: "destructive",
  });

  setTimeout(() => {
    window.location.href = "/";
  }, 2000);
};

// Response interceptor with refresh token handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    let user = null;
    try {
      const storedUser = localStorage.getItem("user");
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing stored user:", e);
    }

    if (error.response) {
      const { status } = error.response;

      // Handle 401 - refresh first
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          if (refreshResponse.status === 200) {
            // Retry the original request after successful refresh
            return api(originalRequest);
          }
        } catch (refreshError) {
          if (refreshError.response?.status === 401) {
            // Refresh failed, logout
            handleSessionExpired(user);
            return Promise.reject(refreshError);
          }
        }
      }

      // Handle other errors
      const skipToast = originalRequest?.skipToast;
      if (skipToast) {
        return Promise.reject(error);
      }

      switch (status) {
        case 403:
          handleInsufficientPermissions();
          break;
        case 404:
          toast({
            title: "Not Found",
            description: "The requested resource was not found.",
            variant: "destructive",
          });
          break;
        case 422:
          toast({
            title: "Validation Error",
            description:
              error.response.data?.message || "Please check your input.",
            variant: "destructive",
          });
          break;
        case 500:
          toast({
            title: "Server Error",
            description: "Something went wrong. Please try again later.",
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "Error",
            description:
              error.response.data?.message || "An unexpected error occurred.",
            variant: "destructive",
          });
      }
    } else if (error.request) {
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
