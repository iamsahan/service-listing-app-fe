"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Calendar, User, Building } from "lucide-react";

const ProviderDetailsView = ({ provider }) => {
  if (!provider) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending_approval":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "suspended":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatAvailabilityHours = (hours) => {
    if (!hours) return "N/A";

    const days = Object.entries(hours)
      .map(([day, schedule]) => {
        if (schedule.isOpen) {
          return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${
            schedule.start
          } - ${schedule.end}`;
        }
        return null;
      })
      .filter(Boolean);

    return days.length > 0 ? days.join(", ") : "No availability set";
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex justify-between items-center">
        <Badge className={`${getStatusColor(provider.status)} text-white`}>
          {provider.status?.replace("_", " ").toUpperCase()}
        </Badge>
        <span className="text-sm text-gray-500">
          Provider ID: {provider.provider_id}
        </span>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-sm">{provider.User?.name || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-sm flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {provider.User?.email || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Mobile</label>
            <p className="text-sm flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {provider.User?.mobile || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              WhatsApp
            </label>
            <p className="text-sm">{provider.whatsapp_number || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Date of Birth
            </label>
            <p className="text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(provider.User?.dob)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Gender</label>
            <p className="text-sm">{provider.User?.gender || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Nationality
            </label>
            <p className="text-sm">{provider.nationality || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Qualification
            </label>
            <p className="text-sm">{provider.qualification || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      {provider.business_name && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Business Name
              </label>
              <p className="text-sm">{provider.business_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Business Type
              </label>
              <p className="text-sm">{provider.business_type || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Registration Number
              </label>
              <p className="text-sm">
                {provider.business_registration_number || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="text-sm">{provider.exact_address || "N/A"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Service Radius
              </label>
              <p className="text-sm">
                {provider.service_radius
                  ? `${provider.service_radius} km`
                  : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Coordinates
              </label>
              <p className="text-sm">
                {provider.primary_location?.coordinates
                  ? `${provider.primary_location.coordinates[1]}, ${provider.primary_location.coordinates[0]}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity Information */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Aadhar Number
            </label>
            <p className="text-sm">{provider.aadhar_number || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              PAN Number
            </label>
            <p className="text-sm">{provider.pan_number || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Availability Information */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Availability Type
            </label>
            <p className="text-sm">
              {provider.availability_type?.replace("_", " ") || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Working Hours
            </label>
            <p className="text-sm">
              {formatAvailabilityHours(provider.availability_hours)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Languages Spoken
            </label>
            <p className="text-sm">
              {provider.languages_spoken?.length > 0
                ? provider.languages_spoken.join(", ")
                : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Contact Name
            </label>
            <p className="text-sm">
              {provider.emergency_contact_name || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Reference Name
            </label>
            <p className="text-sm">{provider.reference_name || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Reference Number
            </label>
            <p className="text-sm">{provider.reference_number || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      {provider.ServiceProviderService?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {provider.ServiceProviderService.map((service, index) => (
                <Badge key={index} variant="outline">
                  {service.Service?.service_name || "Unknown Service"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProviderDetailsView;
