"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { serviceAPI } from "@/api/services";
import { providerAPI } from "@/api/provider";
import { Button } from "@/components/ui/button";
import { toast } from "@hooks/use-toast";
import { DeleteForeverOutlined } from "@/node_modules/@mui/icons-material";
import { PlusCircle, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ProviderDetailsEdit = ({ provider, onSave, onCancel }) => {
  const [serviceProvider, setServiceProvider] = useState({
    business_name: provider?.business_name || "",
    business_type: provider?.business_type || "",
    primary_location: provider?.primary_location || {
      type: "Point",
      coordinates: [0, 0],
    },
    nationality: provider?.nationality || "",
    exact_address: provider?.exact_address || "",
    business_registration_number: provider?.business_registration_number || "",
    name: provider?.User?.name || "",
    dob: provider?.User?.dob || "",
    gender: provider?.User?.gender || "",
    qualification: provider?.qualification || "",
    email: provider?.User?.email || "",
    account_status: provider?.User?.account_status || "",
    mobile: provider?.User?.mobile || "",
    whatsapp_number: provider?.whatsapp_number || "None",
    emergency_contact_name: provider?.emergency_contact_name || "",
    reference_number: provider?.reference_number || "",
    reference_name: provider?.reference_name || "",
    aadhar_number: provider?.aadhar_number || "",
    pan_number: provider?.pan_number || "",
    languages_spoken: provider?.languages_spoken || [],
    service_radius: provider?.service_radius || "",
    availability_type: provider?.availability_type || "full_time",
    availability_hours: {
      monday: provider?.availability_hours?.monday || {
        start: "09:00",
        end: "18:00",
        isOpen: false,
      },
      tuesday: provider?.availability_hours?.tuesday || {
        start: "09:00",
        end: "18:00",
        isOpen: false,
      },
      wednesday: provider?.availability_hours?.wednesday || {
        start: "09:00",
        end: "18:00",
        isOpen: false,
      },
      thursday: provider?.availability_hours?.thursday || {
        start: "09:00",
        end: "18:00",
        isOpen: false,
      },
      friday: provider?.availability_hours?.friday || {
        start: "09:00",
        end: "18:00",
        isOpen: false,
      },
      saturday: provider?.availability_hours?.saturday || {
        start: "09:00",
        end: "18:00",
        isOpen: false,
      },
      sunday: provider?.availability_hours?.sunday || {
        start: "09:00",
        end: "18:00",
        isOpen: false,
      },
    },
    services: provider?.ServiceProviderService || [],
    employees: provider?.ServiceProviderEmployee || [],
  });

  const [serviceCategories, setServiceCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServiceCategories();
    if (provider?.ServiceProviderService) {
      const providerServices = provider.ServiceProviderService.map((sps) => ({
        value: sps.Service.service_id,
        label: sps.Service.service_name,
      }));
      setSelectedServices(providerServices);
    }
  }, [provider]);

  const fetchServiceCategories = async () => {
    try {
      const response = await serviceAPI.getServiceCategories();
      setServiceCategories(response.data);
    } catch (error) {
      console.error("Error fetching service categories:", error);
    }
  };

  const fetchServices = async (categoryId) => {
    try {
      const response = await serviceAPI.getServicesByCategory(categoryId);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setServiceProvider((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setServiceProvider((prev) => ({
      ...prev,
      availability_hours: {
        ...prev.availability_hours,
        [day]: {
          ...prev.availability_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleServiceChange = (selectedOptions) => {
    setSelectedServices(selectedOptions || []);
  };

  const addEmployee = () => {
    setServiceProvider((prev) => ({
      ...prev,
      employees: [
        ...prev.employees,
        {
          name: "",
          phone_number: "",
          whatsapp_number: "",
          qualification: "",
          experience: "",
          aadhar_number: "",
          pan_number: "",
        },
      ],
    }));
  };

  const removeEmployee = (index) => {
    setServiceProvider((prev) => ({
      ...prev,
      employees: prev.employees.filter((_, i) => i !== index),
    }));
  };

  const handleEmployeeChange = (index, field, value) => {
    setServiceProvider((prev) => ({
      ...prev,
      employees: prev.employees.map((emp, i) =>
        i === index ? { ...emp, [field]: value } : emp
      ),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        ...serviceProvider,
        services: selectedServices.map((service) => service.value),
      };

      await providerAPI.updateProvider(provider.provider_id, updateData);
      
      toast({
        title: "Success",
        description: "Provider details updated successfully",
      });

      onSave();
    } catch (error) {
      console.error("Error updating provider:", error);
      toast({
        title: "Error",
        description: "Failed to update provider details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    { value: "sole_proprietorship", label: "Sole Proprietorship" },
    { value: "llc", label: "LLC" },
    { value: "corporation", label: "Corporation" },
    { value: "partnership", label: "Partnership" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const availabilityTypes = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "on_demand", label: "On Demand" },
  ];

  const serviceOptions = services.map((service) => ({
    value: service.service_id,
    label: service.service_name,
  }));

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={serviceProvider.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={serviceProvider.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              value={serviceProvider.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={serviceProvider.whatsapp_number}
              onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={serviceProvider.dob}
              onChange={(e) => handleInputChange("dob", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              options={genderOptions}
              value={genderOptions.find(option => option.value === serviceProvider.gender)}
              onChange={(option) => handleInputChange("gender", option?.value || "")}
              placeholder="Select gender"
            />
          </div>
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={serviceProvider.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={serviceProvider.qualification}
              onChange={(e) => handleInputChange("qualification", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={serviceProvider.business_name}
              onChange={(e) => handleInputChange("business_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="business_type">Business Type</Label>
            <Select
              options={businessTypes}
              value={businessTypes.find(option => option.value === serviceProvider.business_type)}
              onChange={(option) => handleInputChange("business_type", option?.value || "")}
              placeholder="Select business type"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="business_registration_number">Business Registration Number</Label>
            <Input
              id="business_registration_number"
              value={serviceProvider.business_registration_number}
              onChange={(e) => handleInputChange("business_registration_number", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="exact_address">Address</Label>
            <Textarea
              id="exact_address"
              value={serviceProvider.exact_address}
              onChange={(e) => handleInputChange("exact_address", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="service_radius">Service Radius (km)</Label>
            <Input
              id="service_radius"
              type="number"
              value={serviceProvider.service_radius}
              onChange={(e) => handleInputChange("service_radius", e.target.value)}
            />
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
            <Label htmlFor="aadhar_number">Aadhar Number</Label>
            <Input
              id="aadhar_number"
              value={serviceProvider.aadhar_number}
              onChange={(e) => handleInputChange("aadhar_number", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pan_number">PAN Number</Label>
            <Input
              id="pan_number"
              value={serviceProvider.pan_number}
              onChange={(e) => handleInputChange("pan_number", e.target.value)}
            />
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
            <Label htmlFor="availability_type">Availability Type</Label>
            <Select
              options={availabilityTypes}
              value={availabilityTypes.find(option => option.value === serviceProvider.availability_type)}
              onChange={(option) => handleInputChange("availability_type", option?.value || "")}
              placeholder="Select availability type"
            />
          </div>

          {/* Working Hours */}
          <div>
            <Label>Working Hours</Label>
            <div className="space-y-2 mt-2">
              {Object.entries(serviceProvider.availability_hours).map(([day, schedule]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-20">
                    <label className="text-sm font-medium">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={schedule.isOpen}
                      onChange={(e) => handleAvailabilityChange(day, "isOpen", e.target.checked)}
                    />
                    <span className="text-sm">Open</span>
                  </div>
                  {schedule.isOpen && (
                    <>
                      <Input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => handleAvailabilityChange(day, "start", e.target.value)}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => handleAvailabilityChange(day, "end", e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Service Category</Label>
              <Select
                options={serviceCategories.map(cat => ({ value: cat.category_id, label: cat.category_name }))}
                onChange={(option) => option && fetchServices(option.value)}
                placeholder="Select a category to load services"
              />
            </div>
            <div>
              <Label>Services</Label>
              <Select
                isMulti
                options={serviceOptions}
                value={selectedServices}
                onChange={handleServiceChange}
                placeholder="Select services"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Employees
            <Button onClick={addEmployee} size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviceProvider.employees.length === 0 ? (
            <p className="text-gray-500">No employees added</p>
          ) : (
            <div className="space-y-4">
              {serviceProvider.employees.map((employee, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Employee {index + 1}</h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEmployee(index)}
                    >
                      <DeleteForeverOutlined className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={employee.name || ""}
                        onChange={(e) => handleEmployeeChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={employee.phone_number || ""}
                        onChange={(e) => handleEmployeeChange(index, "phone_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>WhatsApp Number</Label>
                      <Input
                        value={employee.whatsapp_number || ""}
                        onChange={(e) => handleEmployeeChange(index, "whatsapp_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Qualification</Label>
                      <Input
                        value={employee.qualification || ""}
                        onChange={(e) => handleEmployeeChange(index, "qualification", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Input
                        value={employee.experience || ""}
                        onChange={(e) => handleEmployeeChange(index, "experience", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Aadhar Number</Label>
                      <Input
                        value={employee.aadhar_number || ""}
                        onChange={(e) => handleEmployeeChange(index, "aadhar_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>PAN Number</Label>
                      <Input
                        value={employee.pan_number || ""}
                        onChange={(e) => handleEmployeeChange(index, "pan_number", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              value={serviceProvider.emergency_contact_name}
              onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="reference_name">Reference Name</Label>
            <Input
              id="reference_name"
              value={serviceProvider.reference_name}
              onChange={(e) => handleInputChange("reference_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input
              id="reference_number"
              value={serviceProvider.reference_number}
              onChange={(e) => handleInputChange("reference_number", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderDetailsEdit;
