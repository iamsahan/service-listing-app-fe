"use client";
import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { couponAPI } from "@/api/couponService";
import { profileAPI } from "@/api/profile";
import SelectR from "react-select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  PlusIcon,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { serviceAPI } from "@/api/services";
import withAdminAuth from "@components/withAdminAuth";

const CouponsPage = () => {
  const [viewMode, setViewMode] = useState("coupons"); // "coupons" or "usages"
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("code");
  const [serviceCategories, setServiceCategories] = useState([]);

  // Usages state
  const [usages, setUsages] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [usageFilters, setUsageFilters] = useState({
    couponId: "",
    userId: "",
  });
  const [usagePagination, setUsagePagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [isOneTimeOnly, setIsOneTimeOnly] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [addDialog, setAddDialog] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteCoupon, setDeleteCoupon] = useState(null);
  const [viewUsersModal, setViewUsersModal] = useState(false);
  const [selectedCouponUsers, setSelectedCouponUsers] = useState(null);

  // Customers state for USER_SPECIFIC coupons
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    amount: "",
    validFrom: "",
    validTo: "",
    validDuration: "",
    isOneTime: true,
    mobiles: [],
    type: "CUSTOM",
    min_threshold: 0,
    categories: [],
  });

  // Fetch coupons with query params
  const fetchCoupons = async (query = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await couponAPI.getCoupons(query);
      setFiltered(res.data);
    } catch (err) {
      setError("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = {};
    if (isOneTimeOnly) query.isOneTime = true;

    fetchCoupons(query);
  }, [isOneTimeOnly]);

  const fetchCouponUsages = async (page = 1) => {
    try {
      const response = await couponAPI.getCouponUsages({
        couponId: usageFilters.couponId || undefined,
        userId: usageFilters.userId || undefined,
        page,
        limit: usagePagination.limit,
      });

      const data = response.data;
      setUsages(data.data || []);
      setUsagePagination(data.pagination);
      setStatistics(data.statistics);
    } catch (error) {
      console.error("Failed to fetch coupon usages:", error);
      toast({
        title: "Error",
        description: "Failed to load coupon usages",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (viewMode === "usages") {
      fetchCouponUsages(1);
    }
  }, [usageFilters, viewMode]);

  const handleSearchClick = () => {
    const trimmed = search.trim();
    const query = {};

    if (trimmed) {
      if (searchBy === "userMobile") {
        query.userMobile = trimmed;
      } else {
        query.search = trimmed;
      }
    }

    if (isOneTimeOnly) query.isOneTime = true;
    fetchCoupons(query);
  };

  const fetchServiceCategories = async () => {
    try {
      const res = await serviceAPI.getAllCategories();
      setServiceCategories(res.data);
    } catch (e) {
      console.error("Failed to fetch service categories:", e);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const res = await profileAPI.getAllCustomers({ getAll: true });
      // Handle different response structures
      let customersData = [];
      if (res.data?.customers && Array.isArray(res.data.customers)) {
        customersData = res.data.customers;
      } else if (Array.isArray(res.data)) {
        customersData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        customersData = res.data.data;
      } else if (Array.isArray(res)) {
        customersData = res;
      }
      setCustomers(customersData);
    } catch (e) {
      console.error("Failed to fetch customers:", e);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setCustomersLoading(false);
    }
  };

  const openForm = (coupon = null) => {
    fetchServiceCategories();
    fetchCustomers();
    setEditCoupon(coupon);

    // Set selected customers if editing a coupon with valid users
    if (coupon && coupon.validUsers && coupon.validUsers.length > 0) {
      const selected = coupon.validUsers.map((user) => ({
        value: user.mobile,
        label: `${user.name || "N/A"} - ${user.mobile}`,
        mobile: user.mobile,
      }));
      setSelectedCustomers(selected);
    } else {
      setSelectedCustomers([]);
    }

    setFormData(
      coupon
        ? {
            code: coupon.code,
            amount: coupon.amount.toString(),
            validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : "",
            validTo: coupon.validTo ? coupon.validTo.slice(0, 10) : "",
            validDuration: coupon.validDuration?.toString() || "",
            isOneTime: coupon.isOneTime,
            mobiles: coupon.validUsers?.map((u) => u.mobile) ?? [],
            type: coupon.type,
            min_threshold: coupon.min_threshold,
            categories:
              coupon.serviceCategories?.map((cat) => cat.category_id) ?? [],
          }
        : {
            code: "",
            amount: "",
            validFrom: "",
            validTo: "",
            validDuration: "",
            isOneTime: true,
            mobiles: [],
            type: "CUSTOM",
            min_threshold: 0,
            categories: [],
          },
    );

    setAddDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        code: formData.code,
        amount: parseFloat(formData.amount),
        validFrom: formData.validFrom || null,
        validTo: formData.validTo || null,
        validDuration: formData.validDuration
          ? parseInt(formData.validDuration)
          : null,
        isOneTime: formData.isOneTime,
        mobiles: formData.mobiles.filter((m) => m.trim()),
        type: formData.type,
        min_threshold: formData.min_threshold,
        categories: formData.categories,
      };

      if (editCoupon) {
        await couponAPI.updateCoupon(editCoupon.id, payload);
        toast({ title: "Updated!", description: "Coupon updated." });
      } else {
        await couponAPI.addCoupon(payload);
        toast({ title: "Added!", description: "Coupon created." });
      }

      setAddDialog(false);
      fetchCoupons({});
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteCoupon) return;
    try {
      await couponAPI.deleteCoupon(deleteCoupon.id);
      toast({ title: "Deleted", description: "Coupon removed." });
      fetchCoupons({});
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    } finally {
      setDeleteCoupon(null);
    }
  };

  const handleUsageFilterChange = (field, value) => {
    setUsageFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleUsagePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= usagePagination.totalPages) {
      fetchCouponUsages(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-4">
      {/* View Mode Tabs */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "coupons" ? "default" : "outline"}
          onClick={() => setViewMode("coupons")}
        >
          Manage Coupons
        </Button>
        <Button
          variant={viewMode === "usages" ? "default" : "outline"}
          onClick={() => setViewMode("usages")}
        >
          Coupon Usages
        </Button>
      </div>

      {/* Coupons Management View */}
      {viewMode === "coupons" && (
        <Card>
          <CardHeader className="flex-row justify-between items-center pb-0">
            <CardTitle>Coupons</CardTitle>
            <Button onClick={() => openForm()}>
              <PlusIcon />
              Add Coupon
            </Button>
          </CardHeader>

          <CardHeader className="flex-row flex-wrap gap-4 items-center pt-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Search by ${
                  searchBy === "code" ? "Coupon Code" : "User Mobile"
                }`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
                maxLength={searchBy === "userMobile" ? 10 : undefined}
              />

              <Select value={searchBy} onValueChange={setSearchBy}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Search By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code">Coupon Code</SelectItem>
                  <SelectItem value="userMobile">User Mobile</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="secondary" onClick={handleSearchClick}>
                <SearchIcon />
                Search
              </Button>

              {search && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    const query = {};
                    if (isOneTimeOnly) query.isOneTime = true;
                    fetchCoupons(query);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="one-time-toggle"
                checked={isOneTimeOnly}
                onCheckedChange={setIsOneTimeOnly}
              />
              <Label htmlFor="one-time-toggle" className="whitespace-nowrap">
                One-Time Only
              </Label>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid To</TableHead>
                    <TableHead>Min Order Amount</TableHead>
                    <TableHead>Valid Users</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length ? (
                    filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.code}</TableCell>
                        <TableCell>₹ {c.amount}</TableCell>
                        <TableCell>
                          {c.isOneTime ? "One-Time" : "Multi-Use"}
                        </TableCell>
                        <TableCell>
                          {c.validFrom ? c.validFrom.slice(0, 10) : "—"}
                        </TableCell>
                        <TableCell>
                          {c.validTo ? c.validTo.slice(0, 10) : "—"}
                        </TableCell>
                        <TableCell>₹ {c.min_threshold}</TableCell>
                        <TableCell>
                          {c.validUsers?.length ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCouponUsers(c.validUsers);
                                setViewUsersModal(true);
                              }}
                            >
                              View Users ({c.validUsers.length})
                            </Button>
                          ) : c.type === "USER_SPECIFIC" ? (
                            <span className="text-red-500 text-sm font-medium">
                              No users
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              All Users
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{c.used ? "Yes" : "No"}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openForm(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteCoupon(c)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No coupons found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Coupon Usages View */}
      {viewMode === "usages" && (
        <div className="space-y-4">
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Usages"
                value={statistics.totalUsages}
                icon={BarChart3}
                color="text-blue-500"
              />
              <StatCard
                title="Unique Customers"
                value={statistics.uniqueCustomers}
                icon={Users}
                color="text-green-500"
              />
              <StatCard
                title="Total Discount"
                value={`₹${statistics.totalDiscountedAmount}`}
                icon={DollarSign}
                color="text-purple-500"
              />
              <StatCard
                title="Avg Discount/Use"
                value={`₹${statistics.averageDiscountPerUse}`}
                icon={TrendingUp}
                color="text-orange-500"
              />
            </div>
          )}

          {/* Coupon Info */}
          {statistics && statistics.coupon && (
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Coupon Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Code</p>
                    <p className="font-bold">{statistics.coupon.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Discount Amount</p>
                    <p className="font-bold">₹{statistics.coupon.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usage Type</p>
                    <p className="font-bold">
                      <Badge
                        variant={
                          statistics.coupon.isOneTime ? "default" : "secondary"
                        }
                      >
                        {statistics.coupon.isOneTime
                          ? "One Time"
                          : "Multiple Use"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Validity</p>
                    <p className="font-bold text-sm">
                      {formatDate(statistics.coupon.validFrom)} to{" "}
                      {formatDate(statistics.coupon.validTo)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Coupon ID
                  </label>
                  <Input
                    placeholder="Filter by coupon ID"
                    value={usageFilters.couponId}
                    onChange={(e) =>
                      handleUsageFilterChange("couponId", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    User ID
                  </label>
                  <Input
                    placeholder="Filter by user ID"
                    value={usageFilters.userId}
                    onChange={(e) =>
                      handleUsageFilterChange("userId", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Items Per Page
                  </label>
                  <Select
                    value={usagePagination.limit.toString()}
                    onValueChange={(value) => {
                      setUsagePagination((prev) => ({
                        ...prev,
                        limit: parseInt(value),
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Usage History ({usagePagination.total} total records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : usages.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coupon Code</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Discount Amount</TableHead>
                        <TableHead>Used Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usages.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="font-medium">
                            {usage.coupon?.code || "N/A"}
                          </TableCell>
                          <TableCell>{usage.user?.name || "N/A"}</TableCell>
                          <TableCell>{usage.user?.email || "N/A"}</TableCell>
                          <TableCell>{usage.user?.mobile || "N/A"}</TableCell>
                          <TableCell>
                            ₹{usage.coupon?.amount || "N/A"}
                          </TableCell>
                          <TableCell>₹{usage.usedAmount}</TableCell>
                          <TableCell>{formatDate(usage.usedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No usage records found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {usagePagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {usagePagination.page} of {usagePagination.totalPages} (
                {usagePagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleUsagePageChange(usagePagination.page - 1)
                  }
                  disabled={usagePagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from(
                  { length: usagePagination.totalPages },
                  (_, i) => i + 1,
                )
                  .slice(
                    Math.max(0, usagePagination.page - 2),
                    Math.min(
                      usagePagination.totalPages,
                      usagePagination.page + 1,
                    ),
                  )
                  .map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === usagePagination.page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleUsagePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleUsagePageChange(usagePagination.page + 1)
                  }
                  disabled={usagePagination.page === usagePagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>
              {editCoupon ? "Edit Coupon" : "Add Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <Label>Code</Label>
            <Input
              value={formData.code}
              placeholder="Coupon Code"
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
            <Label>Amount (flat)</Label>
            <Input
              type="number"
              value={formData.amount}
              placeholder="0"
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
            <Label>Valid From</Label>
            <Input
              type="date"
              value={formData.validFrom}
              onChange={(e) =>
                setFormData({ ...formData, validFrom: e.target.value })
              }
            />
            <Label>Valid To</Label>
            <Input
              type="date"
              value={formData.validTo}
              onChange={(e) =>
                setFormData({ ...formData, validTo: e.target.value })
              }
            />

            <Label>Valid Duration (in days / Optional)</Label>
            <Input
              type="number"
              value={formData.validDuration}
              placeholder="e.g. 30"
              onChange={(e) =>
                setFormData({ ...formData, validDuration: e.target.value })
              }
            />

            <Label>Min Order Amount</Label>
            <Input
              type="number"
              value={formData.min_threshold}
              placeholder="0"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_threshold: parseFloat(e.target.value),
                })
              }
            />

            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                const newFormData = { ...formData, type: value };
                if (value === "WELCOME") {
                  newFormData.isOneTime = true;
                }
                setFormData(newFormData);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                  <SelectItem value="WELCOME">Welcome Offer</SelectItem>
                  <SelectItem value="USER_SPECIFIC">User Specific</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                id="form-isOneTime"
                checked={formData.isOneTime}
                onCheckedChange={(val) =>
                  setFormData({ ...formData, isOneTime: val })
                }
                disabled={formData.type === "WELCOME"}
              />
              <Label
                htmlFor="form-isOneTime"
                className={formData.type === "WELCOME" ? "text-gray-400" : ""}
              >
                One-Time Coupon
                {formData.type === "WELCOME" && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Always for Welcome Offers)
                  </span>
                )}
              </Label>
            </div>

            <Label>User Mobiles (Optional)</Label>
            {formData.type === "USER_SPECIFIC" ? (
              <SelectR
                isMulti
                isLoading={customersLoading}
                options={customers.map((customer) => ({
                  value: customer.mobile,
                  label: `${customer.name || "N/A"} - ${customer.mobile}`,
                  mobile: customer.mobile,
                }))}
                value={selectedCustomers}
                onChange={(selectedOptions) => {
                  const selected = selectedOptions || [];
                  setSelectedCustomers(selected);
                  setFormData({
                    ...formData,
                    mobiles: selected.map((opt) => opt.mobile),
                  });
                }}
                placeholder="Search and select customers..."
                className="text-gray-900"
                classNamePrefix="react-select"
                isSearchable
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded border border-gray-300 text-sm text-gray-600">
                This field is only available for User Specific coupons
              </div>
            )}

            <Label>Service Categories (Optional)</Label>
            <SelectR
              isMulti
              options={serviceCategories.map((cat) => ({
                value: cat.category_id,
                label: cat.name,
              }))}
              value={formData.categories.map((catId) => {
                const cat = serviceCategories.find(
                  (c) => c.category_id === catId,
                );
                return { value: catId, label: cat?.name || catId };
              })}
              onChange={(selectedOptions) =>
                setFormData({
                  ...formData,
                  categories: selectedOptions
                    ? selectedOptions.map((opt) => opt.value)
                    : [],
                })
              }
              placeholder="Select service categories..."
              className="text-gray-900"
              classNamePrefix="react-select"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editCoupon ? "Save" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteCoupon}
        onOpenChange={() => setDeleteCoupon(null)}
        onConfirm={handleDelete}
        title={`Delete coupon ${deleteCoupon?.code}?`}
      />

      {/* View Users Modal */}
      <Dialog open={viewUsersModal} onOpenChange={setViewUsersModal}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Valid Users</DialogTitle>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            {selectedCouponUsers && selectedCouponUsers.length > 0 ? (
              <div className="space-y-2">
                {selectedCouponUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">
                        {user.name || "N/A"}
                      </span>
                      <span className="text-xs text-gray-600">
                        {user.mobile}
                      </span>
                      {user.email && (
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setViewUsersModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAdminAuth(CouponsPage, {
  module: "coupons",
  action: "view",
});
