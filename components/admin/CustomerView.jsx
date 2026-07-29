"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Settings,
} from "lucide-react";

const CustomerView = ({ customer, isOpen, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const formatDate = (dateString, time = true) => {
    if (!dateString) return "Not available";
    return time
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  // Function to generate Google Maps iframe URL for customer addresses
  const generateMapUrl = (focusAddress = null) => {
    if (!customer?.addresses?.length) return null;

    // Filter valid addresses with coordinates
    const validAddresses = customer.addresses.filter(
      (address) =>
        address.location?.coordinates &&
        Array.isArray(address.location.coordinates) &&
        address.location.coordinates.length === 2 &&
        typeof address.location.coordinates[0] === "number" &&
        typeof address.location.coordinates[1] === "number"
    );

    if (validAddresses.length === 0) return null;

    // Use focused address as center point, or first address if no focus
    const centerAddress =
      focusAddress && focusAddress.location?.coordinates
        ? focusAddress
        : validAddresses[0];
    const lat = centerAddress.location.coordinates[1];
    const lng = centerAddress.location.coordinates[0];

    // Create markers parameter for multiple addresses
    let markers = "";
    validAddresses.forEach((address, index) => {
      const markerLat = address.location.coordinates[1];
      const markerLng = address.location.coordinates[0];
      // Highlight the focused address differently
      const color =
        address.id === centerAddress.id
          ? "red"
          : address.is_primary
          ? "green"
          : "blue";
      const label = `${index + 1}`;

      if (index > 0) markers += "|";
      markers += `color:${color}|label:${label}|${markerLat},${markerLng}`;
    });

    // Build the Google Maps iframe URL with markers
    const baseUrl = "https://www.google.com/maps/embed/v1/place";
    const params = new URLSearchParams({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "YOUR_API_KEY",
      q: `${lat},${lng}`,
      zoom: focusAddress ? "16" : validAddresses.length === 1 ? "15" : "12",
      maptype: "roadmap",
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Function to generate directions URL for opening in new tab
  const getDirectionsUrl = (address) => {
    if (!address.location?.coordinates) return null;

    const lat = address.location.coordinates[1];
    const lng = address.location.coordinates[0];

    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  // Function to focus on specific address
  const focusOnAddress = (address) => {
    setSelectedLocation(address);
    console.log("Focused on address:", address.line1);
  };

  // Early return after all hooks have been called
  if (!customer) {
    return null;
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                {customer.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Customer ID: #{customer.u_id} •{" "}
                {customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}
              </DialogDescription>
            </div>
            <Badge
              variant={
                customer.account_status === "active" ? "default" : "destructive"
              }
              className="text-sm px-3 py-1"
            >
              {customer.account_status.charAt(0).toUpperCase() +
                customer.account_status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Customer Information */}
          <div className="space-y-4">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {customer.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{customer.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {customer.dob
                        ? formatDate(customer.dob, false)
                        : "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">
                      {customer.gender
                        ? customer.gender.charAt(0).toUpperCase() +
                          customer.gender.slice(1)
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Account Status</span>
                  <Badge
                    variant={
                      customer.account_status === "active"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {customer.account_status.charAt(0).toUpperCase() +
                      customer.account_status.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email Verified</span>
                  <Badge
                    variant={customer.email_verified ? "default" : "secondary"}
                  >
                    {customer.email_verified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Mobile Verified</span>
                  <Badge
                    variant={customer.mobile_verified ? "default" : "secondary"}
                  >
                    {customer.mobile_verified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Account Balance</p>
                    <p className="font-medium">
                      {formatCurrency(customer.acc_balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Activity Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <div>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {formatDate(customer.created_at)}
                  </p>
                  <p>
                    <span className="font-medium">Last Login:</span>{" "}
                    {formatDate(customer.last_login)}
                  </p>
                  <p>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {formatDate(customer.last_updated)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Addresses and Map */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Customer Locations ({customer.addresses?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.addresses?.length > 0 ? (
                  <div className="space-y-4">
                    {/* Map Container */}
                    <div className="w-full h-80 bg-gray-100 rounded-lg border overflow-hidden">
                      {generateMapUrl(selectedLocation) ? (
                        <iframe
                          key={selectedLocation?.id || "default"} // Force re-render when selection changes
                          src={generateMapUrl(selectedLocation)}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Customer Locations Map"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <svg
                              className="w-12 h-12 mx-auto mb-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <p>No valid coordinates found</p>
                            <p className="text-sm text-gray-400">
                              Unable to display map
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          Address Details
                          {selectedLocation && (
                            <span className="ml-2 text-sm text-blue-600 font-normal">
                              (Showing: {selectedLocation.type})
                            </span>
                          )}
                        </h4>
                        {customer.addresses.some(
                          (addr) => addr.location?.coordinates
                        ) && (
                          <div className="flex gap-2">
                            {selectedLocation && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedLocation(null)}
                                className="text-xs text-gray-500"
                              >
                                Show All
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Open Google Maps with all addresses
                                const validAddresses =
                                  customer.addresses.filter(
                                    (addr) =>
                                      addr.location?.coordinates?.length === 2
                                  );
                                if (validAddresses.length > 0) {
                                  const firstAddr = validAddresses[0];
                                  const lat = firstAddr.location.coordinates[1];
                                  const lng = firstAddr.location.coordinates[0];
                                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                                  window.open(url, "_blank");
                                }
                              }}
                            >
                              View All on Map
                            </Button>
                          </div>
                        )}
                      </div>
                      {customer.addresses.map((address, index) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedLocation?.id === address.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => focusOnAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    address.is_primary ? "default" : "secondary"
                                  }
                                >
                                  {address.type.charAt(0).toUpperCase() +
                                    address.type.slice(1)}
                                </Badge>
                                {address.is_primary && (
                                  <Badge
                                    variant="outline"
                                    className="text-green-600 border-green-200"
                                  >
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                  {address.line1}
                                  {address.line2 && `, ${address.line2}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state}{" "}
                                  {address.postal_code}
                                </p>
                                {address.landmark && (
                                  <p className="text-sm text-gray-500">
                                    Landmark: {address.landmark}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">
                                  Added: {formatDate(address.createdAt)}
                                </p>
                                {address.location?.coordinates && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const directionsUrl =
                                          getDirectionsUrl(address);
                                        if (directionsUrl) {
                                          window.open(directionsUrl, "_blank");
                                        }
                                      }}
                                    >
                                      Get Directions
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 mb-1">
                                Address #{index + 1}
                              </p>
                              {address.location?.coordinates && (
                                <p className="text-xs text-gray-500">
                                  {address.location.coordinates[0].toFixed(4)},{" "}
                                  {address.location.coordinates[1].toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No addresses found for this customer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerView;
