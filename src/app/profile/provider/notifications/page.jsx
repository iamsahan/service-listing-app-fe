"use client";
import { profileAPI } from "@/api/profile";
import { useProfileRefresh } from "@/src/context/ProfileRefreshContext";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const NotificationSettingsModal = ({ isOpen, onClose, onSave }) => {
  const [preferredMethods, setPreferredMethods] = useState({
    sms: false,
    email: false,
    whatsapp: false,
  });

  useEffect(() => {
    if (isOpen) {
      const fetchPreferences = async () => {
        try {
          const response = await profileAPI.getUserNotificationSettings();
          console.log("Notification preferences response:", response.data);

          const preferencesArray = response.data.preferences || [];

          const preferences = {
            sms: preferencesArray.includes("sms"),
            email: preferencesArray.includes("email"),
            whatsapp: preferencesArray.includes("whatsapp"),
          };
          setPreferredMethods(preferences);
        } catch (error) {
          console.error("Error fetching preferences:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Failed to load notification preferences";
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
        }
      };
      fetchPreferences();
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      const reqBody = { preferences: preferredMethods };
      await profileAPI.updateNotificationPreferences(reqBody);
      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      });
      onSave?.(preferredMethods);
      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save notification preferences";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferredMethods.sms}
              onChange={(e) =>
                setPreferredMethods((prev) => ({
                  ...prev,
                  sms: e.target.checked,
                }))
              }
              className="h-4 w-4 accent-[#5f60b9]"
            />
            SMS Notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferredMethods.email}
              onChange={(e) =>
                setPreferredMethods((prev) => ({
                  ...prev,
                  email: e.target.checked,
                }))
              }
              className="h-4 w-4 accent-[#5f60b9]"
            />
            Email Notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferredMethods.whatsapp}
              onChange={(e) =>
                setPreferredMethods((prev) => ({
                  ...prev,
                  whatsapp: e.target.checked,
                }))
              }
              className="h-4 w-4 accent-[#5f60b9]"
            />
            WhatsApp Notifications
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#5f60b9] text-white rounded-md hover:bg-[#4f50a9]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Page = ({ currentOtp }) => {
  const [notifications, setNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { refreshKey, triggerRefresh } = useProfileRefresh();

  useEffect(() => {
    console.log("Received currentOtp in Page:", currentOtp);
  }, [currentOtp]);

  const getUserNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = typeFilter
        ? await profileAPI.filterNotifications({ type: typeFilter })
        : await profileAPI.getUserNotifications();
      console.log("Notifications API response:", response.data.data);
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load notifications";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    console.log("useEffect triggered with:", {
      typeFilter,
      refreshKey,
      currentOtp,
    });
    getUserNotifications();
  }, [typeFilter, refreshKey, currentOtp, getUserNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await profileAPI.readNotification(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, isRead: true } : n
        )
      );
      toast({ title: "Success", description: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking as read:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to mark notification as read";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await profileAPI.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notificationId)
      );
      toast({ title: "Success", description: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete notification";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await profileAPI.deleteAllNotifications();
      setNotifications([]);
      toast({ title: "Success", description: "All notifications deleted" });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete all notifications";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="lg:ml-24 p-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">
        Notifications ({notifications.length})
      </h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded-md focus:ring-[#5f60b9] focus:border-[#5f60b9]"
        >
          <option value="">All Types</option>
          <option value="booking">Booking</option>
          <option value="reminder">Reminder</option>
          <option value="general">General</option>
        </select>
        <button
          onClick={() => {
            getUserNotifications();
            triggerRefresh();
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Refresh
        </button>
        <button
          onClick={deleteAllNotifications}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Delete All
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="bg-[#5f60b9] text-white px-4 py-2 rounded-md hover:bg-[#4f50a9]"
        >
          Settings
        </button>
      </div>
      {loading && <p>Loading notifications...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`p-4 border rounded-md ${
                notification.isRead ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.notification_id)}
                      className="text-[#5f60b9] hover:underline"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() =>
                      deleteNotification(notification.notification_id)
                    }
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => triggerRefresh()}
      />
    </div>
  );
};

export default Page;
