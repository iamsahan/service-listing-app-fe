import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { profileAPI } from "@/api/profile";
import PinDropMap from "./PinDropMap";
import { cn } from "@/lib/utils";
import { set } from "date-fns";

// Helper to join unique address parts
const joinUnique = (parts) =>
  [...new Set(parts.filter(Boolean).map((p) => p.trim()))].join(", ");

const AddressFormDialog = ({
  isOpen,
  onClose,
  initialLocation,
  onSave,
  onBack,
  isLoaded,
}) => {
  const { toast } = useToast();

  const [addressForm, setAddressForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    landmark: "",
    type: "home",
    otherType: "",
    location: initialLocation || null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = useCallback((field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (!initialLocation) return;

    setAddressForm((prev) => ({
      ...prev,
      location: initialLocation,
      line1: initialLocation.details?.street || prev.line1,
      city: initialLocation.details?.city || prev.city,
      state: initialLocation.details?.state || prev.state,
      postal_code: initialLocation.details?.postalCode || prev.postal_code,
      type: initialLocation.type || prev.type,
      otherType: initialLocation.otherType || prev.otherType,
      landmark: initialLocation.landmark || prev.landmark,
      line2: initialLocation.flatNo || prev.line2,
    }));
  }, [initialLocation]);

  const handleLocationSelect = useCallback((locationData) => {
    setAddressForm((prev) => ({
      ...prev,
      line1: locationData.details?.street || prev.line1,
      city: locationData.details?.city || prev.city,
      state: locationData.details?.state || prev.state,
      postal_code: locationData.details?.postalCode || prev.postal_code,
      location: {
        type: "Point",
        coordinates: locationData.coordinates,
      },
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        line1,
        line2,
        city,
        state,
        postal_code,
        landmark,
        type,
        otherType,
        location,
      } = addressForm;

      if (!city || !location) {
        toast({ title: "Incomplete Details", variant: "destructive" });
        return;
      }

      const payload = {
        line1: location.name
          ? line1?.trim()
            ? location.name + ", " + line1?.trim()
            : location.name
          : line1?.trim(),
        line2: line2?.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postal_code.trim(),
        landmark: landmark?.trim(),
        type: type === "other" ? otherType || "other" : type,
        location: {
          coordinates: [location.coordinates.lat, location.coordinates.lng],
        },
      };

      if (initialLocation && initialLocation.id) {
        // Update existing address
        const response = await profileAPI.updateAddress(
          initialLocation.id,
          payload
        );
        toast({ title: "Success", description: "Address updated!" });
        onSave(response.data);
      } else {
        // Create new address
        const response = await profileAPI.createAddress(payload);
        toast({ title: "Success", description: "Address created!" });
        onSave(response.data);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save address.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full min-h-svh lg:min-h-[500px] p-0">
        <div className="grid grid-cols-1 lg:grid-cols-7">
          {/* Map Section */}
          <div className="w-full col-span-4 min-h-[200px] h-full">
            <PinDropMap
              initialLocation={addressForm.location}
              onLocationSelect={handleLocationSelect}
              countryRestriction="in"
              isLoaded={isLoaded}
            />
          </div>

          {/* Form Section */}
          <div className="flex flex-col justify-between p-5 col-span-3">
            <div className="space-y-4">
              <Button
                size="sm"
                variant="outline"
                onClick={onBack}
                className="gap-1"
              >
                <ChevronLeft />
                Change
              </Button>

              <div>
                <DialogTitle className="text-xl font-bold text-gray-800 mb-1 capitalize">
                  {addressForm.location?.name ||
                    addressForm.line1 ||
                    "Selected Location"}
                </DialogTitle>

                <p className="text-sm text-gray-600">
                  {joinUnique([
                    addressForm.location?.name ? addressForm.line1 : "",
                    addressForm.city,
                    addressForm.state,
                    addressForm.postal_code,
                  ])}
                </p>
              </div>

              <div className="space-y-3 mt-3">
                <Input
                  value={addressForm.line2}
                  onChange={(e) => updateForm("line2", e.target.value)}
                  placeholder="House/Flat No.*"
                  required
                />

                <Input
                  value={addressForm.landmark}
                  onChange={(e) => updateForm("landmark", e.target.value)}
                  placeholder="Landmark (Optional)"
                />
              </div>

              {/* Address Type Badges */}
              <div className="mt-4 space-y-2">
                <span className="text-sm text-gray-600">Save as</span>

                <div className="flex gap-2">
                  {["home", "work", "other"].map((t) => (
                    <Button
                      key={t}
                      variant={addressForm.type === t ? "secondary" : "outline"}
                      className={cn(
                        "text-sm text-muted-foreground",
                        addressForm.type === t && "text-primary"
                      )}
                      size="sm"
                      onClick={() => updateForm("type", t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {addressForm.type === "other" && (
                <Input
                  value={addressForm.otherType}
                  onChange={(e) => updateForm("otherType", e.target.value)}
                  placeholder="Place name (Optional)"
                  className="mt-2"
                />
              )}
            </div>

            <DialogFooter className="mt-6 border-t pt-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || !addressForm.location || !addressForm.line2
                }
                className="w-full bg-[#5f60b9] hover:bg-[#5f60b9]/90 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Address"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormDialog;
