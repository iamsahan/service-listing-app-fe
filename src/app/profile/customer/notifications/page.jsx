"use client";
import { profileAPI } from "@/api/profile";
import React, { useEffect, useState, useCallback } from "react";
import { useProfileRefresh } from "@src/context/ProfileRefreshContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  Calendar,
  Info,
  Key,
  CheckCircle,
  Trash2,
  RotateCcw,
  Filter,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const Page = ({ currentOtp }) => {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { refreshKey, triggerRefresh } = useProfileRefresh();

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "booking":
        return <Calendar className="w-5 h-5" />;
      case "otp":
        return <Key className="w-5 h-5" />;
      case "payment":
        return <Info className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Helper function to get notification color based on type
  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case "booking":
        return "bg-blue-500";
      case "otp":
        return "bg-purple-500";
      case "payment":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Helper function to get badge variant based on type
  const getBadgeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case "booking":
        return "default";
      case "otp":
        return "destructive";
      case "payment":
        return "secondary";
      default:
        return "outline";
    }
  };

  useEffect(() => {
    console.log("Received currentOtp in Page:", currentOtp);
  }, [currentOtp]);

  const getUserNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch all notifications first
      const response = await profileAPI.getUserNotifications();
      const allNotifs = response.data.data || [];

      console.log("Notifications API response:", allNotifs);
      setAllNotifications(allNotifs);

      // Filter locally if needed
      if (typeFilter) {
        const filtered = allNotifs.filter((n) => n.type === typeFilter);
        setNotifications(filtered);
      } else {
        setNotifications(allNotifs);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setError("Failed to load notifications. Please try again.");
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

      // Update both notifications and allNotifications
      const updateNotification = (prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, isRead: true } : n
        );

      setNotifications(updateNotification);
      setAllNotifications(updateNotification);
    } catch (error) {
      console.error("Error marking as read:", error.message);
      setError("Failed to mark notification as read.");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await profileAPI.deleteNotification(notificationId);

      // Update both notifications and allNotifications
      const filterNotification = (prev) =>
        prev.filter((n) => n.notification_id !== notificationId);

      setNotifications(filterNotification);
      setAllNotifications(filterNotification);
    } catch (error) {
      console.error("Error deleting notification:", error.message);
      setError("Failed to delete notification.");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await profileAPI.deleteAllNotifications();
      setNotifications([]);
      setAllNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error.message);
      setError("Failed to delete all notifications.");
    }
  };

  return (
    <div className="w-full md:max-w-4xl md:mx-auto space-y-6">
      <span className="text-2xl font-semibold block mb-5 sm:hidden">
        Notifications
      </span>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {allNotifications.filter((n) => !n.isRead).length} unread
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {allNotifications.length} total
          </Badge>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-300"
              >
                <option value="">All Types ({allNotifications.length})</option>
                <option value="booking">
                  Booking (
                  {allNotifications.filter((n) => n.type === "booking").length})
                </option>
                <option value="otp">
                  OTP ({allNotifications.filter((n) => n.type === "otp").length}
                  )
                </option>
                <option value="payment">
                  Payment (
                  {allNotifications.filter((n) => n.type === "payment").length})
                </option>
              </select>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  getUserNotifications();
                  triggerRefresh();
                }}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
                disabled={loading}
              >
                <RotateCcw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Refresh"}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={deleteAllNotifications}
                className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                disabled={notifications.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  Loading notifications...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we fetch your latest updates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {!loading && notifications.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-200">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 p-6">
                {/* Avatar matching notification cards exactly */}
                <Avatar className="bg-gray-400 flex-shrink-0">
                  <AvatarFallback className="text-white">
                    <Bell className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>

                {/* Content matching notification structure exactly */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-medium uppercase tracking-wide"
                      >
                        {typeFilter || "EMPTY"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>No activity</span>
                    </div>
                  </div>

                  {/* Message with same structure as notification messages */}
                  <div className="notification-message leading-relaxed mb-3 text-gray-700 font-medium">
                    {typeFilter
                      ? `No ${typeFilter} notifications`
                      : "No notifications yet"}
                    <br />
                    <span className="text-sm text-gray-600 font-normal">
                      {typeFilter
                        ? `You don’t have any ${typeFilter} notifications at the moment. It looks like everything is clear for now, so there’s nothing new that requires your attention. Keep checking back later.
`
                        : "You’re all caught up! There are no new notifications at the moment. As soon as something important happens, whether it’s a new update, message, or alert, it will appear right here so you won’t miss it."}
                    </span>
                  </div>

                  {/* Actions matching notification actions exactly */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {typeFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTypeFilter("")}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-3 text-xs font-medium transition-all duration-200 rounded-full"
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        View All Notifications
                      </Button>
                    )}

                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full ml-auto">
                      <CheckCircle className="w-3 h-3" />
                      All caught up!
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification, index) => (
            <Card
              key={notification.notification_id}
              className={`notification-card ${
                notification.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-blue-200 shadow-sm"
              } ${index === 0 ? "animate-fade-in" : ""}`}
            >
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-6">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {/* Avatar with Icon */}
                        <Avatar
                          className={`${getNotificationColor(
                            notification.type
                          )} flex-shrink-0`}
                        >
                          <AvatarFallback className="text-white">
                            {getNotificationIcon(notification.type)}
                          </AvatarFallback>
                        </Avatar>

                        {notification.type && (
                          <Badge
                            variant={getBadgeVariant(notification.type)}
                            className="text-xs font-medium uppercase tracking-wide"
                          >
                            {notification.type}
                          </Badge>
                        )}
                        {!notification.isRead && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-600">
                              New
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span
                          title={format(
                            new Date(notification.created_at),
                            "PPpp"
                          )}
                        >
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Message with HTML support */}
                    <div
                      className={`notification-message leading-relaxed mb-3 ${
                        notification.isRead
                          ? "text-gray-600"
                          : "text-gray-900 font-medium"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: notification.message || "No message content",
                      }}
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            markAsRead(notification.notification_id)
                          }
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-3 text-xs font-medium transition-all duration-200 rounded-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as Read
                        </Button>
                      )}

                      {notification.isRead && (
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Read
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deleteNotification(notification.notification_id)
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 text-xs font-medium transition-all duration-200 rounded-full ml-auto"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
