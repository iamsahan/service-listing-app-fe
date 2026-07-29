"use client";
import { MapPin, Plus, Edit2, Trash2, Star } from "lucide-react";
import React, { useState, useEffect } from "react";
import LocationFlow from "../maps/LocationFlow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { profileAPI } from "@/api/profile";

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await profileAPI.getAddresses();
      setAddresses(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load addresses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openAddressModal = (address) => {
    setSelectedAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDelete = async (addressId) => {
    try {
      await profileAPI.deleteAddress(addressId);
      fetchAddresses();
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      await profileAPI.setPrimaryAddress(addressId);
      fetchAddresses();
      toast({
        title: "Success",
        description: "Primary address updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update primary address. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 mx-auto max-w-4xl min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Saved Addresses</h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openAddressModal(null)}
          className="flex items-center gap-2 text-[#5f60b9] hover:text-[#5f60b9]/80"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {/* Address List */}
      <div className="space-y-3">
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="font-medium capitalize">{address.type}</span>
                  {address.is_primary && (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openAddressModal(address)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {address.line1}
                {address.line2 && ` ${address.line2}`}
                {address.landmark && `, ${address.landmark}`}
                {`, ${address.city}, ${address.state} ${address.postal_code}`}
              </p>

              {!address.is_primary && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-5"
                  onClick={() => handleSetPrimary(address.id)}
                >
                  Set as Primary
                </Button>
              )}
            </div>
          </Card>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>No addresses saved yet</p>
          </div>
        )}
      </div>

      {/* Address Modal */}
      <LocationFlow
        isOpen={isAddressModalOpen}
        initialAddress={
          selectedAddress
            ? {
                id: selectedAddress.id,
                coordinates: {
                  lat: selectedAddress?.location?.coordinates[0],
                  lng: selectedAddress?.location?.coordinates[1],
                },
                name: selectedAddress?.line1 || "",
                landmark: selectedAddress?.landmark || "",
                flatNo: selectedAddress?.line2 || "",
                type: ["home", "work"].includes(selectedAddress?.type)
                  ? selectedAddress?.type
                  : "other",
                otherType: ["home", "work"].includes(selectedAddress?.type)
                  ? ""
                  : selectedAddress?.type || "",
                address: [
                  selectedAddress?.line2,
                  selectedAddress?.city,
                  selectedAddress?.state,
                  selectedAddress?.postal_code,
                ]
                  .filter(Boolean)
                  .join(", "),
                details: {
                  city: selectedAddress?.city || "",
                  state: selectedAddress?.state || "",
                  postalCode: selectedAddress?.postal_code || "",
                },
              }
            : null
        }
        onClose={() => setIsAddressModalOpen(false)}
        onSave={() => {
          setIsAddressModalOpen(false);
          fetchAddresses();
        }}
      />
    </div>
  );
};

export default AddressManager;
