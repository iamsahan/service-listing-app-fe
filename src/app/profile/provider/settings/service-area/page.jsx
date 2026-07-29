"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { providerAPI } from "@/api/provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SetLocationWithMap from "@/components/SetLocationWithMap";

export default function ServiceAreaPage() {
  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    location: null,
  });

  const [radius, setRadius] = useState("");
  const [loading, setLoading] = useState(false);

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await providerAPI.getProfileData();
        const data = res.data;

        setForm((prev) => ({
          ...prev,
          line1: data?.street || "",
          line2: data?.line2 || "",
          city: data?.city || "",
          state: data?.state || "",
          postal_code: data?.postal_code || "",
          location: data?.primary_location || null,
        }));

        setRadius(data?.service_radius?.toString() || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load service area info.",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (locationData) => {
    setForm((prev) => ({
      ...prev,
      line1: locationData.details.street || prev.line1,
      city: locationData.details.city || prev.city,
      state: locationData.details.state || prev.state,
      postal_code: locationData.details.postalCode || prev.postal_code,
      location: {
        type: "Point",
        coordinates: locationData.coordinates, // [lng, lat]
      },
    }));
  };

  const handleRadiusChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 1000) {
      toast({
        title: "Invalid Radius",
        description: "Radius cannot be more than 1000 km.",
        variant: "destructive",
      });
      return;
    }
    setRadius(e.target.value);
  };

  const handleSave = async () => {
    const numericRadius = parseInt(radius, 10);
    if (isNaN(numericRadius) || numericRadius > 1000) {
      toast({
        title: "Invalid Radius",
        description: "Radius must be a number not greater than 1000.",
        variant: "destructive",
      });
      return;
    }

    if (!form.location) {
      toast({
        title: "Invalid Location",
        description: "Please select a valid location in India.",
        variant: "destructive",
      });
      return;
    }

    // Build formatted address
    const formattedAddress = [
      form.line2 && `${form.line2},`,
      form.line1,
      `${form.city},`,
      form.state,
      form.postal_code,
    ]
      .filter(Boolean)
      .join(" ");

    setLoading(true);
    try {
      await providerAPI.updateProfile({
        exact_address: formattedAddress,
        service_radius: numericRadius,
        street: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        primary_location: form.location,
      });
      toast({ title: "Success", description: "Service area updated." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Update failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Map */}
      <div>
        <label className="block mb-1 font-medium">Select Location</label>
        <div className="rounded-xl overflow-hidden border border-gray-300 h-[300px] shadow-md">
          <SetLocationWithMap
            initialLocation={form.location}
            onLocationSelect={handleLocationSelect}
            countryRestriction="in"
          />
        </div>
      </div>

      {/* Address fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl shadow-inner">
        {/* Line 1 */}
        <div>
          <label className="block text-sm font-medium">Street *</label>
          <Input
            value={form.line1}
            onChange={(e) => handleInputChange("line1", e.target.value)}
            placeholder="Street address"
            required
            className="bg-gray-100 cursor-not-allowed"
            readOnly
          />
        </div>

        {/* Line 2 */}
        <div>
          <label className="block text-sm font-medium">House/Flat No.</label>
          <Input
            value={form.line2}
            onChange={(e) => handleInputChange("line2", e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium">City *</label>
          <Input
            value={form.city}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium">State *</label>
          <Input
            value={form.state}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium">Postal Code *</label>
          <Input
            value={form.postal_code}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Radius */}
      <div>
        <label className="block mb-1 font-medium">Service Radius (km)</label>
        <Input
          type="number"
          value={radius}
          onChange={handleRadiusChange}
          placeholder="Max 1000"
        />
      </div>

      {/* Save */}
      <div className="text-right">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
