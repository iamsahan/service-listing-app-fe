"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Bell,
  Send,
  Users,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserCircle2,
  Wrench,
} from "lucide-react";
import { serviceAPI } from "@/api/services";
import { notificationAPI } from "@/api/notificationService";
import UserSelectionDialog from "@/components/admin/UserSelectionDialog";
import Image from "next/image";

export default function PromotionalNotificationsPage() {
  const [formData, setFormData] = useState({
    audience: "all",
    cityId: "all",
    title: "",
    body: "",
    imageUrl: "",
    data: "",
  });

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showUserSelectionDialog, setShowUserSelectionDialog] = useState(false);

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await serviceAPI.getCities();
      setCities(response.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cities",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Reset selected users when audience changes away from selected
    if (field === "audience" && value !== "selected") {
      setSelectedUserIds([]);
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    if (errors.imageUrl) {
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Message body is required";
    } else if (formData.body.length > 500) {
      newErrors.body = "Message must be 500 characters or less";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = "Please enter a valid URL";
    }

    if (formData.data) {
      try {
        JSON.parse(formData.data);
      } catch (e) {
        newErrors.data = "Invalid JSON format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    // Additional validation for selected users
    if (formData.audience === "selected" && selectedUserIds.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to send the notification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      let response;

      if (formData.audience === "selected") {
        // Send to selected users
        const payload = {
          userIds: selectedUserIds,
          title: formData.title.trim(),
          body: formData.body.trim(),
          imageUrl: formData.imageUrl.trim() || undefined,
          data: formData.data ? JSON.parse(formData.data) : undefined,
        };

        response =
          await notificationAPI.sendPromotionalNotificationToSelectedUsers(
            payload
          );
      } else {
        // Send to all/customers/providers
        const payload = {
          audience: formData.audience,
          cityId: formData.cityId === "all" ? undefined : formData.cityId,
          title: formData.title.trim(),
          body: formData.body.trim(),
          imageUrl: formData.imageUrl.trim() || undefined,
          data: formData.data ? JSON.parse(formData.data) : undefined,
        };

        response = await notificationAPI.sendPromotionalNotification(payload);
      }

      if (response.data.success) {
        setLastResult(response.data);
        toast({
          title: "Success!",
          description: response.data.message,
        });

        // Reset form
        setFormData({
          audience: "all",
          cityId: "all",
          title: "",
          body: "",
          imageUrl: "",
          data: "",
        });
        setImagePreview("");
      } else {
        throw new Error(response.data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case "customers":
        return <UserCircle2 className="h-4 w-4" />;
      case "providers":
        return <Wrench className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getAudienceLabel = (audience) => {
    switch (audience) {
      case "customers":
        return "Customers";
      case "providers":
        return "Service Providers";
      case "selected":
        return "Selected Users";
      default:
        return "All Users";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Promotional Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Send targeted push notifications to users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Notification</CardTitle>
                <CardDescription>
                  Fill in the details to send a promotional notification to your
                  users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Targeting Section */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Targeting
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="audience">Audience *</Label>
                        <Select
                          value={formData.audience}
                          onValueChange={(value) =>
                            handleInputChange("audience", value)
                          }
                        >
                          <SelectTrigger id="audience">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>All Users</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="customers">
                              <div className="flex items-center gap-2">
                                <UserCircle2 className="h-4 w-4" />
                                <span>Customers</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="providers">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                <span>Service Providers</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="selected">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Selected Users</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.audience !== "selected" ? (
                        <div className="space-y-2">
                          <Label htmlFor="cityId">City</Label>
                          <Select
                            value={formData.cityId}
                            onValueChange={(value) =>
                              handleInputChange("cityId", value)
                            }
                          >
                            <SelectTrigger id="cityId">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>All Cities</span>
                                </div>
                              </SelectItem>
                              {cities.map((city) => (
                                <SelectItem
                                  key={city.city_id}
                                  value={city.city_id}
                                >
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>User Selection</Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowUserSelectionDialog(true)}
                            className="w-full justify-start"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            {selectedUserIds.length === 0
                              ? "Click to Select Users"
                              : `${selectedUserIds.length} user(s) selected`}
                          </Button>
                          {selectedUserIds.length > 0 && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Ready to send to {selectedUserIds.length} user(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Message Content
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter notification title"
                        maxLength={100}
                        className={errors.title ? "border-red-500" : ""}
                      />
                      <div className="flex justify-between text-xs">
                        {errors.title ? (
                          <span className="text-red-500">{errors.title}</span>
                        ) : (
                          <span className="text-gray-500">
                            Catchy title for your notification
                          </span>
                        )}
                        <span className="text-gray-400">
                          {formData.title.length}/100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body">Message *</Label>
                      <Textarea
                        id="body"
                        value={formData.body}
                        onChange={(e) =>
                          handleInputChange("body", e.target.value)
                        }
                        placeholder="Enter your message here..."
                        rows={4}
                        maxLength={500}
                        className={errors.body ? "border-red-500" : ""}
                      />
                      <div className="flex justify-between text-xs">
                        {errors.body ? (
                          <span className="text-red-500">{errors.body}</span>
                        ) : (
                          <span className="text-gray-500">
                            Clear and concise message
                          </span>
                        )}
                        <span className="text-gray-400">
                          {formData.body.length}/500
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Optional Settings
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className={errors.imageUrl ? "border-red-500" : ""}
                      />
                      {errors.imageUrl ? (
                        <p className="text-xs text-red-500">
                          {errors.imageUrl}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Optional: Add an image to your notification
                        </p>
                      )}

                      {imagePreview && (
                        <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border">
                          <Image
                            src={imagePreview}
                            alt="Notification preview"
                            fill
                            className="object-cover"
                            onError={() => {
                              setImagePreview("");
                              setErrors((prev) => ({
                                ...prev,
                                imageUrl: "Failed to load image",
                              }));
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data">Custom Data (JSON)</Label>
                      <Textarea
                        id="data"
                        value={formData.data}
                        onChange={(e) =>
                          handleInputChange("data", e.target.value)
                        }
                        placeholder='{"key": "value", "action": "open_screen"}'
                        rows={3}
                        className={
                          errors.data
                            ? "border-red-500 font-mono text-sm"
                            : "font-mono text-sm"
                        }
                      />
                      {errors.data ? (
                        <p className="text-xs text-red-500">{errors.data}</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Optional: Additional data for deep linking or custom
                          actions
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Notification
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          audience: "all",
                          cityId: "all",
                          title: "",
                          body: "",
                          imageUrl: "",
                          data: "",
                        });
                        setImagePreview("");
                        setErrors({});
                        setLastResult(null);
                        setSelectedUserIds([]);
                      }}
                      disabled={loading}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview and Info Section */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>
                  How your notification will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg shadow-lg p-4 space-y-3">
                  {/* App Icon and Title */}
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {formData.title || "Notification Title"}
                      </p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>

                  {/* Image */}
                  {imagePreview && (
                    <div className="relative w-full h-32 rounded overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Body */}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {formData.body || "Your message will appear here..."}
                  </p>

                  {/* Target Info */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      {getAudienceIcon(formData.audience)}
                      {getAudienceLabel(formData.audience)}
                    </Badge>
                    {formData.cityId !== "all" && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {cities.find((c) => c.city_id === formData.cityId)
                          ?.name || "City"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Send Result */}
            {lastResult && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                    <CheckCircle2 className="h-5 w-5" />
                    Sent Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Audience:</span>
                      <span className="font-medium text-green-900">
                        {getAudienceLabel(lastResult.targeting?.audience)}
                      </span>
                    </div>
                    {lastResult.targeting?.city && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">City:</span>
                        <span className="font-medium text-green-900">
                          {lastResult.targeting.city}
                        </span>
                      </div>
                    )}
                    {lastResult.stats && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Target Users:</span>
                          <span className="font-medium text-green-900">
                            {lastResult.stats.targetUsersCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Tokens Found:</span>
                          <span className="font-medium text-green-900">
                            {lastResult.stats.tokensFound || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Sent:</span>
                          <span className="font-medium text-green-900">
                            {lastResult.stats.successCount || 0}
                          </span>
                        </div>
                        {lastResult.stats.failureCount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Failed:</span>
                            <span className="font-medium text-green-900">
                              {lastResult.stats.failureCount}
                            </span>
                          </div>
                        )}
                        {lastResult.stats.invalidTokensCleaned > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">
                              Invalid Tokens Cleaned:
                            </span>
                            <span className="font-medium text-green-900">
                              {lastResult.stats.invalidTokensCleaned}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* User Selection Dialog */}
      <UserSelectionDialog
        isOpen={showUserSelectionDialog}
        onClose={() => setShowUserSelectionDialog(false)}
        onConfirm={(userIds) => {
          setSelectedUserIds(userIds);
          toast({
            title: "Users Selected",
            description: `${userIds.length} user(s) selected for notification`,
          });
        }}
        selectedUserIds={selectedUserIds}
      />
    </div>
  );
}
