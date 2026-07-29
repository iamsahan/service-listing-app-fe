"use client";

import { SocketNotificationProvider } from "@/src/context/SocketNotificationContext";
import { useSocket } from "@/src/context/SocketContext";
import { useAuth } from "@src/context/AuthContext";
import Header from "@components/admin/Header";
import Sidebar from "@components/admin/Sidebar";
import withAuth from "@components/isAuth";
import React, { useState, useEffect } from "react";

const layout = ({ children }) => {
  const { user, refreshPermissions } = useAuth();
  const {
    socket,
    isConnected,
    connectionState,
    lastHeartbeat,
    forceReconnect,
  } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Refresh permissions only once on mount and when user ID changes
  useEffect(() => {
    const allowedRoles = [
      "admin",
      "super_admin",
      "moderator",
      "customer_manager",
    ];
    if (user && allowedRoles.includes(user.role)) {
      refreshPermissions();
    }
  }, [user?.id]); // Only depend on user ID to avoid infinite loops

  return (
    <SocketNotificationProvider
      socket={socket}
      user={user}
      isConnected={isConnected}
      connectionState={connectionState}
      lastHeartbeat={lastHeartbeat}
      forceReconnect={forceReconnect}
    >
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Main Content */}
        <div
          className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-80"
          }`}
        >
          <Header
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </SocketNotificationProvider>
  );
};

export default withAuth(layout, [
  "admin",
  "super_admin",
  "moderator",
  "customer_manager",
]);
