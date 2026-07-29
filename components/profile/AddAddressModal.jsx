import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from "@/hooks/use-toast";
import { profileAPI } from "@/api/profile";
import SetLocationWithMap from "@/components/SetLocationWithMap";

const AddAddressModal = ({ isOpen, onSave, initialAddress, onClose }) => {
  const { toast } = useToast();

  const [addressForm, setAddressForm] = useState({
    type: "home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    location: null,
    landmark: "",
  });

  const [customType, setCustomType] = useState("");
  const [lockFields, setLockFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  // Sync initialAddress
  useEffect(() => {
    if (initialAddress) {
      setAddressForm({
        type: initialAddress.type || "home",
        line1: initialAddress.line1 || "",
        line2: initialAddress.line2 || "",
        city: initialAddress.city || "",
        state: initialAddress.state || "",
        postal_code: initialAddress.postal_code || "",
        location: initialAddress.location || null,
        landmark: initialAddress.landmark || "",
      });

      setLockFields(!!initialAddress.line1);
      setCustomType(initialAddress.type === "other" ? initialAddress.type : "");
    } else {
      setAddressForm({
        type: "home",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        location: null,
        landmark: "",
      });
      setLockFields(false);
      setCustomType("");
    }
  }, [initialAddress]);

  // Handle map selection
  const handleLocationSelect = (locationData) => {
    updateForm("line1", locationData.details.street || addressForm.line1);
    updateForm("city", locationData.details.city || addressForm.city);
    updateForm("state", locationData.details.state || addressForm.state);
    updateForm(
      "postal_code",
      locationData.details.postalCode || addressForm.postal_code
    );
    updateForm("location", {
      type: "Point",
      coordinates: locationData.coordinates,
    });
    setLockFields(true); // lock line1 after autocomplete
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalType =
      addressForm.type === "other" ? customType.trim() : addressForm.type;

    const requiredFields = [
      "line1",
      "city",
      "state",
      "postal_code",
      "location",
    ];
    if (addressForm.type === "other") requiredFields.push("customType");

    const emptyFields = requiredFields.filter((f) =>
      f === "customType" ? !customType.trim() : !addressForm[f]
    );

    if (emptyFields.length) {
      toast({
        title: "Incomplete Details",
        description:
          "Please fill in all required fields and select a location.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...addressForm, type: finalType };

      let response;
      if (initialAddress?.id) {
        // Editing existing address
        response = await profileAPI.updateAddress(initialAddress.id, payload);
        toast({
          title: "Success",
          description: "Address updated successfully!",
        });
      } else {
        // Adding new address
        response = await profileAPI.createAddress(payload);
        toast({ title: "Success", description: "Address added successfully!" });
      }

      onSave(response.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optional fields
  const optionalFields = [
    {
      label: "House/Flat No.",
      field: "line2",
      placeholder: "Optional",
    },
    {
      label: "Landmark (Optional)",
      field: "landmark",
      placeholder: "E.g., Near the park or mall",
    },
  ];

  const getInputClass = (locked) =>
    locked ? "bg-gray-100 cursor-not-allowed" : "bg-white";

  return (
    <Dialog open={isOpen} className="pointer-events-none">
      <DialogContent className="[&>button:last-child]:hidden max-w-5xl w-full p-6 sm:p-8 bg-white rounded-2xl shadow-2xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-800">
            {initialAddress ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-700">
                Select Location <span className="text-red-500">*</span>
              </Label>
              <SetLocationWithMap
                key={initialAddress?.id || "new"}
                initialLocation={addressForm.location}
                onLocationSelect={handleLocationSelect}
                countryRestriction="in"
              />
            </div>

            {/* Address Form */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-xl shadow-inner">
              {/* Address Type */}
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-gray-700">
                  Address Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={addressForm.type}
                  onValueChange={(val) => {
                    updateForm("type", val);
                    if (val !== "other") setCustomType("");
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                {addressForm.type === "other" && (
                  <div className="space-y-1 mt-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Custom Label <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="e.g., Grandma's House"
                      className="bg-white"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Line 1 */}
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-gray-700">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={addressForm.line1}
                  onChange={(e) =>
                    !lockFields && updateForm("line1", e.target.value)
                  }
                  placeholder="Street address"
                  readOnly={lockFields}
                  className={getInputClass(lockFields)}
                  required
                />
              </div>

              {/* Optional Fields */}
              {optionalFields.map(({ label, field, placeholder }) => (
                <div key={field} className="space-y-1">
                  <Label className="text-sm font-semibold text-gray-700">
                    {label}
                  </Label>
                  <Input
                    value={addressForm[field]}
                    onChange={(e) => updateForm(field, e.target.value)}
                    placeholder={placeholder}
                    className="bg-white"
                  />
                </div>
              ))}

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-gray-700">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={addressForm.city}
                    readOnly
                    placeholder="City"
                    className="bg-gray-100 cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-gray-700">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={addressForm.state}
                    onChange={(e) => updateForm("state", e.target.value)}
                    placeholder="State"
                    className="bg-white"
                    required
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-gray-700">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={addressForm.postal_code}
                  onChange={(e) => updateForm("postal_code", e.target.value)}
                  placeholder="Postal code"
                  className="bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 justify-end lg:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 mt-3 lg:mt-0"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            >
              {isSubmitting ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAddressModal;
