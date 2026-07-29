"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { mergeGuestCartToUserCart } from "../app/utils/cartcache";
import { useRouter } from "next/navigation";
import { LoginAPI } from "@/api/login";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const bootstrap = async () => {
    setLoading(true);
    try {
      // First, try to restore from localStorage
      const savedUser = localStorage.getItem("user");
      const savedPermissions = localStorage.getItem("permissions");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Also restore permissions if available
        if (savedPermissions) {
          const parsedPermissions = JSON.parse(savedPermissions);
          setPermissions(parsedPermissions);
        }
      }
    } catch (err) {
      console.error("Auth bootstrap failed:", err);
      setUser(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = async () => {
    try {
      console.log("Refreshing admin permissions...");
      const res = await LoginAPI.adminPermissions();
      const data = res.data;
      setUser(data?.data?.user || null);
      setPermissions(data?.data?.permissions || null);

      // Also store in localStorage for persistence
      if (data?.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      if (data?.data?.permissions) {
        localStorage.setItem(
          "permissions",
          JSON.stringify(data.data.permissions)
        );
      }
    } catch (err) {
      console.error("Refresh permissions failed:", err);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = (userData, permissionData = null, returnUrl = null) => {
    setUser(userData || null);
    setPermissions(permissionData || null);

    // Store user data in localStorage for persistence
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    // Store permissions in localStorage for admin users
    if (permissionData) {
      localStorage.setItem("permissions", JSON.stringify(permissionData));
    }

    // Merge guest cart for customers
    if (userData?.role === "customer") {
      mergeGuestCartToUserCart(userData?.uId);
    }

    if (returnUrl) {
      router.push(returnUrl);
    }
  };

  const logout = (returnUrl = "/") => {
    setUser(null);
    setPermissions(null);
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    LoginAPI.logout().catch(() => {});
    router.push(returnUrl);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        login,
        logout,
        refreshPermissions,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
