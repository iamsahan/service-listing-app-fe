"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJsApiLoader } from "@react-google-maps/api";
import PlacesSearch from "./PlacesSearch";
import AddressFormDialog from "./AddressFormDialog";

const libraries = ["places"];

const LocationFlow = ({
  isOpen,
  onClose,
  onSave,
  countryRestriction = "in",
  initialAddress = null,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationFound = (locationData) => {
    setSelectedLocation(locationData);
    setCurrentStep(2);
  };

  const handleBackToSearch = () => {
    setCurrentStep(1);
  };

  const handleSave = (addressData) => {
    onSave(addressData);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedLocation(null);
    onClose();
  };

  useEffect(() => {
    if (initialAddress && isOpen) {
      setSelectedLocation(initialAddress);
      setCurrentStep(2);
    }
  }, [initialAddress]);

  if (currentStep === 2) {
    return (
      <AddressFormDialog
        isOpen={isOpen}
        onClose={handleClose}
        initialLocation={selectedLocation}
        onSave={handleSave}
        onBack={handleBackToSearch}
        isLoaded={isLoaded}
      />
    );
  }

  // Handle loading states
  if (loadError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg w-full p-6">
          <div className="text-center text-red-600">
            Error loading Google Maps. Please refresh and try again.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg w-full p-6">
          <div className="text-center text-gray-600">
            Loading Google Maps...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-full sm:max-w-md min-h-svh lg:min-h-[570px] p-6 pt-8 bg-white lg:rounded-lg">
        {/* Places Search Component */}
        <PlacesSearch
          onLocationFound={handleLocationFound}
          countryRestriction={countryRestriction}
          isLoaded={isLoaded}
        />

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-gray-600 border-gray-300"
          >
            Cancel
          </Button>
          <div className="text-xs text-gray-500">Step 1 of 2</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationFlow;
