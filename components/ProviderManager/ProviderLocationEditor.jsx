"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { providerAPI } from "@/api/provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SetLocationWithMap from "@/components/SetLocationWithMap";

const ProviderLocationEditor = ({ provider, onLocationUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);

  // Editable address fields
  const [apartment, setApartment] = useState("");
  const [radius, setRadius] = useState("");

  // Store the full location object from map
  const [locationData, setLocationData] = useState(null);

  // Extract fields on mount
  useEffect(() => {
    if (provider) {
      const exact = provider?.exact_address || "";

      // Detect apartment prefix
      let apt = "";
      let rest = exact;
      if (exact.includes(",")) {
        const firstCommaIndex = exact.indexOf(",");
        const firstPart = exact.substring(0, firstCommaIndex).trim();
        const after = exact.substring(firstCommaIndex + 1).trim();

        if (
          /apt|suite|flat|unit/i.test(firstPart) ||
          /^[0-9]+\s?[A-Za-z]?$/.test(firstPart)
        ) {
          apt = firstPart;
          rest = after;
        }
      }

      // Split remaining address into parts
      const parts = rest.split(",").map((p) => p.trim());
      const [street, city, state, postalCode, country] = [
        parts[0] || "",
        parts[1] || "",
        parts[2]?.replace(/\d+$/, "").trim() || "", // strip postal from state
        parts[2]?.match(/\d+$/)?.[0] || parts[3] || "",
        parts[4] || "India", // fallback
      ];

      setApartment(apt);
      setRadius(provider?.service_radius?.toString() || "");

      if (provider.primary_location) {
        const coords = provider.primary_location.coordinates;
        setLocationData({
          type: "point",
          coordinates: [coords[1], coords[0]], // lat, lng flip
          address: exact,
          details: {
            street,
            city,
            state,
            country,
            postalCode,
          },
        });
      }
    }
  }, [provider]);

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

    if (!locationData?.coordinates?.length) {
      toast({
        title: "Invalid Location",
        description: "Please select a valid location on the map.",
        variant: "destructive",
      });
      return;
    }

    const [lat, lng] = locationData.coordinates;

    // Rebuild formatted address
    const formattedAddress = [
      apartment,
      locationData.details?.street,
      locationData.details?.city,
      locationData.details?.state,
      locationData.details?.postalCode,
      locationData.details?.country,
    ]
      .filter(Boolean) // remove empty values
      .join(", ");

    const updateData = {
      exact_address: formattedAddress,
      service_radius: numericRadius,
      primary_location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      latitude: lat,
      longitude: lng,
    };

    setLoading(true);
    try {
      await providerAPI.updateProviderLocation(
        provider.provider_id,
        updateData
      );

      toast({
        title: "Success",
        description: "Provider location updated successfully.",
      });

      if (onLocationUpdate) {
        onLocationUpdate({
          ...provider,
          ...updateData,
        });
      }
    } catch (error) {
      console.error("Error updating provider location:", error);
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Map */}
      <SetLocationWithMap
        initialLocation={locationData}
        onLocationSelect={(loc) => setLocationData(loc)}
      />

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>House/Flat No.</Label>
          <Input
            value={apartment}
            placeholder="Apartment / Suite"
            onChange={(e) => setApartment(e.target.value)}
          />
        </div>
        <div>
          <Label>Street Address</Label>
          <Input
            value={locationData?.details?.street || ""}
            placeholder="Street Address"
            onChange={(e) =>
              setLocationData((prev) => ({
                ...prev,
                details: { ...prev.details, street: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <Label>City</Label>
          <Input
            placeholder="City"
            value={locationData?.details?.city || ""}
            onChange={(e) =>
              setLocationData((prev) => ({
                ...prev,
                details: { ...prev.details, city: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <Label>State</Label>
          <Input
            placeholder="State"
            value={locationData?.details?.state || ""}
            onChange={(e) =>
              setLocationData((prev) => ({
                ...prev,
                details: { ...prev.details, state: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <Label>Postal Code</Label>
          <Input
            value={locationData?.details?.postalCode || ""}
            placeholder="Postal Code"
            onChange={(e) =>
              setLocationData((prev) => ({
                ...prev,
                details: { ...prev.details, postalCode: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <Label>Service Radius (km)</Label>
          <Input
            type="number"
            value={radius}
            onChange={handleRadiusChange}
            placeholder="Max 1000 km"
            min="1"
            max="1000"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || !locationData?.coordinates?.length}
        >
          {loading ? "Updating..." : "Update Location"}
        </Button>
      </div>
    </div>
  );
};

export default ProviderLocationEditor;
