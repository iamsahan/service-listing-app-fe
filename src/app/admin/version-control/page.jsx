"use client";

import React, { useState, useEffect } from "react";
import { versionService } from "@/api/versionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Smartphone,
  Apple,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function VersionControlPage() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [formData, setFormData] = useState({
    platform: "android",
    app_type: "customer",
    version: "",
    build_no: "",
    minimum_version: "",
    force_update: false,
    message: "",
    android_customer_redirect_url:
      "https://play.google.com/store/apps/details?id=com.qproz.customer",
    android_provider_redirect_url:
      "https://play.google.com/store/apps/details?id=com.qproz.provider",
    ios_customer_redirect_url:
      "https://apps.apple.com/lk/app/qproz/id6752533984",
    ios_provider_redirect_url:
      "https://apps.apple.com/lk/app/qprozprovider/id6752595302",
    is_active: true,
  });

  // Filter states
  const [filters, setFilters] = useState({
    platform: "all",
    app_type: "all",
    is_active: "all",
  });

  useEffect(() => {
    fetchVersions();
  }, [filters]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.platform && filters.platform !== "all")
        params.platform = filters.platform;
      if (filters.app_type && filters.app_type !== "all")
        params.app_type = filters.app_type;
      if (filters.is_active && filters.is_active !== "all")
        params.is_active = filters.is_active;

      const response = await versionService.getAllVersions(params);
      setVersions(response.data.data);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch versions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (version = null) => {
    if (version) {
      setSelectedVersion(version);
      setFormData({
        platform: version.platform,
        app_type: version.app_type,
        version: version.version,
        build_no: version.build_no.toString(),
        minimum_version: version.minimum_version || "",
        force_update: version.force_update,
        message: version.message || "",
        android_customer_redirect_url:
          version.android_customer_redirect_url || "",
        android_provider_redirect_url:
          version.android_provider_redirect_url || "",
        ios_customer_redirect_url: version.ios_customer_redirect_url || "",
        ios_provider_redirect_url: version.ios_provider_redirect_url || "",
        is_active: version.is_active,
      });
    } else {
      setSelectedVersion(null);
      setFormData({
        platform: "android",
        app_type: "customer",
        version: "",
        build_no: "",
        minimum_version: "",
        force_update: false,
        message: "",
        android_customer_redirect_url:
          "https://play.google.com/store/apps/details?id=com.qproz.customer",
        android_provider_redirect_url:
          "https://play.google.com/store/apps/details?id=com.qproz.provider",
        ios_customer_redirect_url:
          "https://apps.apple.com/lk/app/qproz/id6752533984",
        ios_provider_redirect_url:
          "https://apps.apple.com/lk/app/qprozprovider/id6752595302",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVersion(null);
    setFormData({
      platform: "android",
      app_type: "customer",
      version: "",
      build_no: "",
      minimum_version: "",
      force_update: false,
      message: "",
      android_customer_redirect_url:
        "https://play.google.com/store/apps/details?id=com.qproz.customer",
      android_provider_redirect_url:
        "https://play.google.com/store/apps/details?id=com.qproz.provider",
      ios_customer_redirect_url:
        "https://apps.apple.com/lk/app/qproz/id6752533984",
      ios_provider_redirect_url:
        "https://apps.apple.com/lk/app/qprozprovider/id6752595302",
      is_active: true,
    });
  };

  const openDeleteDialog = (version) => {
    setSelectedVersion(version);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedVersion(null);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.version || !formData.build_no) {
        toast({
          title: "Error",
          description: "Version and Build Number are required",
          variant: "destructive",
        });
        return;
      }

      // Validate version format
      if (!/^\d+\.\d+\.\d+$/.test(formData.version)) {
        toast({
          title: "Error",
          description: "Version must be in format X.Y.Z (e.g., 1.0.0)",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const payload = {
        ...formData,
        build_no: parseInt(formData.build_no),
      };

      if (selectedVersion) {
        await versionService.updateVersion(selectedVersion.version_id, payload);
        toast({
          title: "Success",
          description: "Version updated successfully",
        });
      } else {
        await versionService.createVersion(payload);
        toast({
          title: "Success",
          description: "Version created successfully",
        });
      }

      closeDialog();
      fetchVersions();
    } catch (error) {
      console.error("Error saving version:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save version",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await versionService.deleteVersion(selectedVersion.version_id);
      toast({
        title: "Success",
        description: "Version deleted successfully",
      });
      closeDeleteDialog();
      fetchVersions();
    } catch (error) {
      console.error("Error deleting version:", error);
      toast({
        title: "Error",
        description: "Failed to delete version",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (version) => {
    try {
      setLoading(true);
      await versionService.toggleVersionStatus(version.version_id);
      toast({
        title: "Success",
        description: `Version ${
          version.is_active ? "deactivated" : "activated"
        } successfully`,
      });
      fetchVersions();
    } catch (error) {
      console.error("Error toggling version status:", error);
      toast({
        title: "Error",
        description: "Failed to toggle version status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get statistics
  const stats = {
    total: versions.length,
    active: versions.filter((v) => v.is_active).length,
    android: versions.filter((v) => v.platform === "android").length,
    ios: versions.filter((v) => v.platform === "ios").length,
    customer: versions.filter((v) => v.app_type === "customer").length,
    provider: versions.filter((v) => v.app_type === "provider").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="h-8 w-8" />
            App Version Control
          </h1>
          <p className="text-gray-600 mt-2">
            Manage mobile app versions and force updates
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Version
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Versions</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Versions</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg flex items-center gap-2">
              <Smartphone className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Android</p>
                <p className="text-2xl font-bold">{stats.android}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-2">
              <Apple className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">iOS</p>
                <p className="text-2xl font-bold">{stats.ios}</p>
              </div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Customer App</p>
              <p className="text-2xl font-bold">{stats.customer}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Provider App</p>
              <p className="text-2xl font-bold">{stats.provider}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Platform</Label>
              <Select
                value={filters.platform}
                onValueChange={(value) =>
                  setFilters({ ...filters, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>App Type</Label>
              <Select
                value={filters.app_type}
                onValueChange={(value) =>
                  setFilters({ ...filters, app_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All App Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All App Types</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.is_active}
                onValueChange={(value) =>
                  setFilters({ ...filters, is_active: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    platform: "all",
                    app_type: "all",
                    is_active: "all",
                  })
                }
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Versions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>App Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Build No</TableHead>
                  <TableHead>Min Version</TableHead>
                  <TableHead>Force Update</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && versions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : versions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No versions found
                    </TableCell>
                  </TableRow>
                ) : (
                  versions.map((version) => (
                    <TableRow key={version.version_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {version.platform === "android" ? (
                            <Smartphone className="h-4 w-4 text-green-600" />
                          ) : (
                            <Apple className="h-4 w-4 text-gray-600" />
                          )}
                          <span className="capitalize">{version.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            version.app_type === "customer"
                              ? "default"
                              : "outline"
                          }
                        >
                          {version.app_type === "customer"
                            ? "Customer"
                            : "Provider"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {version.version}
                      </TableCell>
                      <TableCell>{version.build_no}</TableCell>
                      <TableCell>{version.minimum_version || "-"}</TableCell>
                      <TableCell>
                        {version.force_update ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 w-fit"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={version.is_active ? "default" : "secondary"}
                        >
                          {version.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {version.message || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(version)}
                            title={
                              version.is_active ? "Deactivate" : "Activate"
                            }
                          >
                            {version.is_active ? (
                              <PowerOff className="h-4 w-4 text-red-600" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(version)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(version)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVersion ? "Edit Version" : "Add New Version"}
            </DialogTitle>
            <DialogDescription>
              {selectedVersion
                ? "Update the app version details"
                : "Create a new app version configuration"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData({ ...formData, platform: value })
                  }
                  disabled={!!selectedVersion}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="app_type">App Type *</Label>
                <Select
                  value={formData.app_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, app_type: value })
                  }
                  disabled={!!selectedVersion}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="1.0.0"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: X.Y.Z (e.g., 1.0.0)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="build_no">Build Number *</Label>
                <Input
                  id="build_no"
                  type="number"
                  placeholder="1"
                  value={formData.build_no}
                  onChange={(e) =>
                    setFormData({ ...formData, build_no: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="minimum_version">Minimum Version</Label>
                <Input
                  id="minimum_version"
                  placeholder="1.0.0"
                  value={formData.minimum_version}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimum_version: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Update Message</Label>
              <Textarea
                id="message"
                placeholder="What's new in this version..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="android_customer_redirect_url">
                  Android Customer App URL
                </Label>
                <Input
                  id="android_customer_redirect_url"
                  placeholder="https://play.google.com/store/apps/..."
                  value={formData.android_customer_redirect_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      android_customer_redirect_url: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="android_provider_redirect_url">
                  Android Provider App URL
                </Label>
                <Input
                  id="android_provider_redirect_url"
                  placeholder="https://play.google.com/store/apps/..."
                  value={formData.android_provider_redirect_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      android_provider_redirect_url: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="ios_customer_redirect_url">
                  iOS Customer App URL
                </Label>
                <Input
                  id="ios_customer_redirect_url"
                  placeholder="https://apps.apple.com/app/..."
                  value={formData.ios_customer_redirect_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ios_customer_redirect_url: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="ios_provider_redirect_url">
                  iOS Provider App URL
                </Label>
                <Input
                  id="ios_provider_redirect_url"
                  placeholder="https://apps.apple.com/app/..."
                  value={formData.ios_provider_redirect_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ios_provider_redirect_url: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="force_update" className="text-base">
                  Force Update
                </Label>
                <p className="text-sm text-gray-500">
                  Require users to update before using the app
                </p>
              </div>
              <Switch
                id="force_update"
                checked={formData.force_update}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, force_update: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="is_active" className="text-base">
                  Active Status
                </Label>
                <p className="text-sm text-gray-500">
                  Make this version available to users
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : selectedVersion ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete version{" "}
              <strong>{selectedVersion?.version}</strong> for{" "}
              <strong className="capitalize">
                {selectedVersion?.platform}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
