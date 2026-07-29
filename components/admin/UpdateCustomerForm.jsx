"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { profileAPI } from "@/api/profile";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, X } from "lucide-react";

const UpdateCustomerForm = ({ customer, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        mobile: customer.mobile || "",
        dob: customer.dob ? customer.dob.split("T")[0] : "",
      });
      setErrors({});
    }
  }, [customer, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate mobile number format if provided
    if (
      formData.mobile &&
      !/^\d{10,15}$/.test(formData.mobile.replace(/\D/g, ""))
    ) {
      newErrors.mobile = "Mobile number must be 10-15 digits";
    }

    // Validate name (required)
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Only send fields that have values (non-empty)
      const updateData = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] && formData[key].toString().trim() !== "") {
          updateData[key] = formData[key];
        }
      });

      const response = await profileAPI.updateCustomerDataByAdmin(
        customer.u_id,
        updateData
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Customer data updated successfully",
          variant: "default",
        });

        onSuccess?.(response.data.data.customer);
        onClose();
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating customer:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update customer data";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        dob: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Save className="h-6 w-6 text-blue-600" />
            Update Customer Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Customer ID (Read-only) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Customer ID
            </Label>
            <Input
              value={customer.u_id}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter customer name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500">
              Changing email will reset email verification status
            </p>
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Mobile</Label>
            <Input
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="Enter mobile number"
              className={errors.mobile ? "border-red-500" : ""}
            />
            {errors.mobile && (
              <p className="text-sm text-red-500">{errors.mobile}</p>
            )}
            <p className="text-xs text-gray-500">
              Changing mobile will reset mobile verification status
            </p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Date of Birth
            </Label>
            <Input
              type="date"
              value={formData.dob}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? "Updating..." : "Update Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCustomerForm;
