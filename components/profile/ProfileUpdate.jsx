"use client";

import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { providerAPI } from "@/api/provider";
import { toast } from "@/hooks/use-toast";
import { InputOtp } from "@heroui/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "350px" };

const ProfileUpdatePage = () => {
  const [otpMode, setOtpMode] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    radius: "",
    email: "",
    mobile: "",
    whatsapp_number: "",
    alternate_number: "",
    latitude: "",
    longitude: "",
  });

  const [originalData, setOriginalData] = useState({
    mobile: "",
    whatsapp_number: "",
    alternate_number: "",
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const getProfileData = async () => {
      const res = await providerAPI.getProfileData();
      const p = res.data;
      const updated = {
        address: p.exact_address || "",
        radius: p.service_radius || "",
        email: p.User?.email || "",
        mobile: p.User?.mobile || "",
        whatsapp_number: p.whatsapp_number || "",
        alternate_number: p.alternate_number || "",
        latitude: p.latitude || "",
        longitude: p.longitude || "",
      };
      setFormData(updated);
      setOriginalData({
        mobile: updated.mobile,
        whatsapp_number: updated.whatsapp_number,
        alternate_number: updated.alternate_number,
      });
    };

    getProfileData();
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace?.();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: place.formatted_address || "",
    }));
  };

  const handleMapClick = (e) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setFormData((prev) => ({
          ...prev,
          address: results[0].formatted_address,
        }));
      }
    });
  };

  const updateContact = async (type) => {
    const value =
      formData[
        type === "mobile"
          ? "mobile"
          : type === "whatsapp"
          ? "whatsapp_number"
          : "alternate_number"
      ];

    try {
      const response = await providerAPI.updateProfile({
        [type === "mobile"
          ? "mobile"
          : type === "whatsapp"
          ? "whatsapp_number"
          : "alternate_number"]: value,
      });

      const verifications = response.data?.verifications_required;
      if (verifications?.[type]) {
        setOtpMode({ type, value });
      } else {
        toast({
          title: "Updated",
          description: `${type} updated successfully.`,
        });
        setOriginalData((prev) => ({
          ...prev,
          [type === "mobile"
            ? "mobile"
            : type === "whatsapp"
            ? "whatsapp_number"
            : "alternate_number"]: value,
        }));
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: `Failed to update ${type}.`,
        variant: "destructive",
      });
    }
  };

  const handleOtpVerify = async () => {
    try {
      await providerAPI.verifyProfile({
        type: otpMode.type,
        value: otpMode.value,
        code: otp,
      });

      toast({ title: "Verified", description: "OTP verified successfully." });
      setOtp("");
      setOtpMode(null);
    } catch {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct code.",
        variant: "destructive",
      });
    }
  };

  const handleGeneralSave = async () => {
    setLoading(true);
    try {
      await providerAPI.updateProfile({
        exact_address: formData.address,
        service_radius: formData.radius,
        email: formData.email,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const maskNumber = (num) =>
    num ? num.replace(/^(\d{2})\d{6}(\d{2})$/, "$1******$2") : "";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">Update Profile</h1>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle>Service Area & Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <Label>Location</Label>
            {isLoaded && (
              <>
                <GoogleMap
                  onLoad={(map) => (mapRef.current = map)}
                  onClick={handleMapClick}
                  mapContainerStyle={mapContainerStyle}
                  center={{
                    lat: Number(formData.latitude) || 20.5937,
                    lng: Number(formData.longitude) || 78.9629,
                  }}
                  zoom={formData.latitude ? 15 : 5}
                >
                  {formData.latitude && formData.longitude && (
                    <Marker
                      position={{
                        lat: Number(formData.latitude),
                        lng: Number(formData.longitude),
                      }}
                    />
                  )}
                </GoogleMap>

                <Autocomplete
                  onLoad={(ac) => (autocompleteRef.current = ac)}
                  onPlaceChanged={handlePlaceChanged}
                  options={{ componentRestrictions: { country: "in" } }}
                >
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </Autocomplete>
              </>
            )}
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Service Radius (km)</Label>
            <Input
              type="number"
              value={formData.radius}
              onChange={(e) =>
                setFormData({ ...formData, radius: e.target.value })
              }
            />
          </div>

          <div className="pt-4 text-right">
            <Button onClick={handleGeneralSave} disabled={loading}>
              Save Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Numbers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          {[
            { label: "Mobile Number", key: "mobile", type: "mobile" },
            {
              label: "WhatsApp Number",
              key: "whatsapp_number",
              type: "whatsapp",
            },
            {
              label: "Alternate Number",
              key: "alternate_number",
              type: "alt_mobile",
            },
          ].map(({ label, key, type }) => {
            const value = formData[key];
            const original = originalData[key];
            const isChanged = value !== original;
            const isValid = /^\d{10}$/.test(value);

            return (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center border rounded px-2 h-10 text-muted-foreground bg-muted">
                    +91
                  </div>
                  <Input
                    className="flex-1"
                    type="tel"
                    value={value}
                    maxLength={10}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                  />
                  <Button
                    variant="secondary"
                    disabled={!isChanged || !isValid}
                    onClick={() => updateContact(type)}
                  >
                    Change
                  </Button>
                </div>
                {!isValid && isChanged && (
                  <p className="text-sm text-red-500">
                    Please enter a valid 10-digit number.
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* OTP Dialog */}
      <Dialog
        open={!!otpMode}
        onOpenChange={(open) => !open && setOtpMode(null)}
      >
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {otpMode?.type === "mobile" &&
                `Enter OTP sent to mobile: ${maskNumber(otpMode.value)}`}
              {otpMode?.type === "whatsapp" &&
                `Enter OTP sent to WhatsApp: ${maskNumber(otpMode.value)}`}
              {otpMode?.type === "alt_mobile" &&
                `Enter OTP sent to alternate number: ${maskNumber(
                  otpMode.value
                )}`}
              {otpMode?.type === "email" &&
                `Check your email inbox: ${otpMode.value}`}
            </DialogTitle>
          </DialogHeader>

          <InputOtp
            length={6}
            value={otp}
            onValueChange={setOtp}
            variant="faded"
          />

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOtpMode(null)}>
              Cancel
            </Button>
            <Button onClick={handleOtpVerify}>Verify</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileUpdatePage;
