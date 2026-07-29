"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { serviceAPI } from "@/api/services";
import { providerAPI } from "@/api/provider";
import SetLocationWithMap from "@components/SetLocationWithMap";
import { toast } from "@hooks/use-toast";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { cn } from "@/lib/utils";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField } from "@mui/material";
import dayjs from "dayjs";

const BusinessProviderInquiryForm = ({ formData, onFormDataChange }) => {
  const [citiesOptions, setCitiesOpions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [serviceCategoriesOptions, setServiceCategoriesOptions] = useState([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState(
    []
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Calculate minimum age (18 years old - latest possible birth date)
  const today = dayjs();
  const minAgeDate = today.subtract(18, "year");

  // Calculate maximum age (80 years old - earliest possible birth date)
  const maxAgeDate = today.subtract(80, "year");

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const businessTypes = [
    { value: "sole_proprietorship", label: "Sole Proprietorship" },
    { value: "llc", label: "LLC" },
    { value: "corporation", label: "Corporation" },
    { value: "partnership", label: "Partnership" },
  ];

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await serviceAPI.getCities();
        const cityOptions = response.data.map((city) => ({
          value: city.city_id,
          label: city.name,
        }));
        setCitiesOpions(cityOptions);

        // Restore selected cities
        const selectedCityIds = formData.cities;
        if (selectedCityIds.length > 0) {
          const selectedCities = cityOptions.filter((city) =>
            selectedCityIds.includes(city.value)
          );
          setSelectedCities(selectedCities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await serviceAPI.getAllCategories();
        const categoryOptions = response.data.map((cat) => ({
          value: cat.category_id,
          label: cat.name,
        }));
        setServiceCategoriesOptions(categoryOptions);

        // Restore selected categories
        const selectedCategoryIds = formData.categories;
        if (selectedCategoryIds.length > 0) {
          const selectedCategories = categoryOptions.filter((cat) =>
            selectedCategoryIds.includes(cat.value)
          );
          setSelectedServiceCategories(selectedCategories);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to fetch services.",
          variant: "destructive",
        });
      }
    };

    fetchCities();
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Show/hide error messages realtime
    if (value === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: `${name.split("_").join(" ")} is required`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }

    if (name === "no_of_employee") {
      if (value < 0 || isNaN(value) || value > 1000) {
        return;
      }
    }

    // Prevent unusual inputs in mobile
    if (name === "mobile") {
      if (value.length > 10 || !value.match(/^[0-9]{0,10}$/)) {
        return;
      }
    }

    // Prevent unusual inputs in dob
    if (name === "dob") {
      const error = isValidDOB(value);
      if (error) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          dob: error,
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          dob: "",
        }));
      }
    }

    onFormDataChange((prev) => ({ ...prev, [name]: value }));
  };

  // Validate date of birth
  const isValidDOB = (dob) => {
    if (!dob) return;

    const dobDate = dayjs(dob);
    if (!dobDate.isValid()) return "Invalid date format";
    if (dobDate.isAfter(today)) return "Birthdate cannot be in the future";

    // Calculate age
    const age = today.diff(dobDate, "year");

    if (age < 18 || age > 80) return "Age must be between 18 and 80";
  };

  // Handle category change
  const handleCategoryChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        categories: "",
      }));

      onFormDataChange((prev) => ({
        ...prev,
        categories: selectedOptions.map((option) => option.value),
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        categories: "Select at least one category",
      }));
    }

    setSelectedServiceCategories(selectedOptions);
  };

  // Hnadle city change
  const handleCitiesChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        cities: "",
      }));

      onFormDataChange((prev) => ({
        ...prev,
        cities: selectedOptions.map((option) => option.value),
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        cities: "Select at least one city",
      }));
    }

    setSelectedCities(selectedOptions);
  };

  // Handle location change
  const handleLocationChange = (location) => {
    if (!location) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        location: "Location is required",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        location: "",
      }));
    }

    onFormDataChange({ ...formData, location: location });
  };

  // Handle location select from map
  const handleLocationSelect = (locationData) => {
    const location = {
      coordinates: locationData.coordinates,
      address: locationData.details?.street
        ? `${locationData.details.street}, ${locationData.details.city}, ${locationData.details.state}`
        : "Selected Location",
      details: locationData.details,
    };
    handleLocationChange(location);
  };

  const validateStep1 = () => {
    let newErrors = {};

    // Business Name Validation
    if (!formData.business_name || formData.business_name.trim() === "") {
      newErrors.business_name = "Business name is required";
    } else if (formData.business_name.trim().length < 2) {
      newErrors.business_name = "Business name must be at least 2 characters";
    } else if (formData.business_name.trim().length > 100) {
      newErrors.business_name = "Business name must not exceed 100 characters";
    }

    // Authorized Person Name Validation
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Authorized person name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
    }

    // Mobile Validation
    if (!formData.mobile || formData.mobile.trim() === "") {
      newErrors.mobile = "Authorized person contact is required";
    } else {
      const cleanMobile = formData.mobile.replace(/[^0-9]/g, "");
      const phoneRegex = /^\d{10,15}$/; // allows 10–15 digits
      if (!phoneRegex.test(cleanMobile)) {
        newErrors.mobile = "Phone number must be between 10 and 15 digits";
      }
    }

    // DOB Validation
    if (formData.dob && formData.dob.trim() !== "") {
      const error = isValidDOB(formData.dob);
      if (error) newErrors.dob = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};

    // Cities Validation
    if (!formData.cities || formData.cities.length === 0) {
      newErrors.cities = "Select at least one city";
    }

    // Categories Validation
    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = "Select at least one category";
    }

    // Employees Count Validation
    if (!formData.no_of_employee || formData.no_of_employee === "") {
      newErrors.no_of_employee = "Number of employees is required";
    } else if (isNaN(formData.no_of_employee)) {
      newErrors.no_of_employee = "Number of employees must be a number";
    } else if (formData.no_of_employee <= 0) {
      newErrors.no_of_employee = "Number of employees must be greater than 0";
    } else if (formData.no_of_employee > 10000) {
      newErrors.no_of_employee = "Number of employees cannot exceed 10,000";
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email must not exceed 100 characters";
    }

    // Location Validation
    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateStep2()) {
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = {
      type: formData.type,
      business_name: formData.business_name,
      authorized_person_name: formData.name,
      authorized_person_contact: formData.mobile,
      business_type: formData.business_type,
      business_website: formData.website,
      service_location: {
        type: "Point",
        coordinates: formData.location.coordinates,
        address: formData.address,
      },
      dob: formData.dob || null,
      categories: formData.categories,
      cities: selectedCities.map((city) => city.value),
      number_of_employees: parseInt(formData.no_of_employee),
      email: formData.email,
      gender: formData.gender || null,
    };

    try {
      setIsLoading(true);
      const response = await providerAPI.createEnquiry(formDataToSend);

      toast({
        title: "Success!",
        description: "Your inquiry was submitted successfully.",
        variant: "default",
      });

      router.push("/registration/sucess");
      // Reset form
      onFormDataChange({
        type: "business",
        business_name: "",
        name: "",
        mobile: "",
        email: "",
        gender: "",
        dob: "",
        business_type: "sole_proprietorship",
        website: "",
        location: { type: "Point", coordinates: [0, 0] },
        address: "",
        categories: [],
        no_of_employee: "",
      });
      setSelectedServiceCategories([]);
      setStep(1);
    } catch (error) {
      console.error("Submission error:", error);

      const errorMessage =
        error.response?.data?.details ||
        "Failed to submit inquiry. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {isLoading && (
        <LoadingScreen message={"Inquiry Application Submitting...."} />
      )}
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block">
                Business Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g., ABC Construction Services"
                required
                maxLength={50}
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "border border-red-500 bg-red-500/5 text-red-500":
                      errors.business_name,
                  }
                )}
              />
              {errors.business_name && (
                <p className="text-red-500">{errors.business_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block">
                Business Type
                <span className="text-red-500">*</span>
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                required
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "border border-red-500 bg-red-500/5 text-red-500":
                      errors.business_type,
                  }
                )}
              >
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.business_type && (
                <p className="text-red-500">{errors.business_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block">
                Authorized Person Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Smith"
                required
                maxLength={50}
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "border border-red-500 bg-red-500/5 text-red-500":
                      errors.name,
                  }
                )}
              />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="block">Authorized Person Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block">Authorized Person Date of Birth</label>
              <div
                className={cn("rounded-md", {
                  "border border-red-500/50": errors.dob,
                })}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      formData.dob && formData.dob.trim() !== ""
                        ? dayjs(formData.dob)
                        : null
                    }
                    onChange={(date) => {
                      const dateStr = date
                        ? `${date.year()}-${String(date.month() + 1).padStart(
                            2,
                            "0"
                          )}-${String(date.date()).padStart(2, "0")}`
                        : "";

                      handleChange({
                        target: {
                          name: "dob",
                          value: dateStr,
                        },
                      });
                    }}
                    minDate={maxAgeDate}
                    maxDate={minAgeDate}
                    format="DD/MM/YYYY"
                    enableAccessibleFieldDOMStructure={false}
                    slots={{
                      textField: TextField,
                    }}
                    slotProps={{
                      textField: {
                        placeholder: "Select authorized person's date of birth",
                        fullWidth: true,
                        variant: "outlined",
                        error: !!errors.dob,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: errors.dob
                              ? "rgba(239, 68, 68, 0.05)"
                              : "#f3f4f6",
                            border: "none",
                            borderRadius: "0.375rem",
                            "& fieldset": {
                              border: "none",
                            },
                            "&:hover fieldset": {
                              border: "none",
                            },
                            "&.Mui-focused fieldset": {
                              border: "2px solid #3b82f6",
                            },
                            "&.Mui-error fieldset": {
                              border: "1px solid #ef4444",
                            },
                          },
                          "& .MuiInputBase-input": {
                            padding: "8px 12px",
                            height: "24px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {errors.dob && <p className="text-red-500">{errors.dob}</p>}
            </div>

            <div className="space-y-2">
              <label className="block">
                Authorized Person Contact
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g., 0123456789"
                required
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  {
                    "border border-red-500 bg-red-500/5 text-red-500":
                      errors.mobile,
                  }
                )}
              />
              {errors.mobile && <p className="text-red-500">{errors.mobile}</p>}
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-[var(--color-primary)] text-white py-3 px-6 rounded mt-4"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block">Business Website</label>
              <input
                type="url"
                name="website"
                maxLength={50}
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g., https://www.yourcompany.com"
                className="w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block">
                Business Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                maxLength={50}
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., info@yourcompany.com"
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "border border-red-500 bg-red-500/5 text-red-500":
                      errors.email,
                  }
                )}
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block">
                Cities/Regions of Service
                <span className="text-red-500">*</span>
              </label>
              <Select
                id="cities"
                options={citiesOptions}
                isMulti
                value={selectedCities}
                onChange={handleCitiesChange}
                placeholder="Select cities where your business operates"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: errors.cities
                      ? "rgba(239, 68, 68, 0.05)"
                      : "#f3f4f6",
                    borderRadius: "0.375rem",
                    border: state.isFocused
                      ? "2px solid #3b82f6"
                      : errors.cities
                      ? "1px solid #ef4444"
                      : "none",
                    boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#6b7280",
                  }),
                }}
              />
              {errors.cities && <p className="text-red-500">{errors.cities}</p>}
            </div>

            <div className="space-y-2">
              <label className="block">
                Business Location
                <span className="text-red-500">*</span>
              </label>
              <SetLocationWithMap
                initialLocation={formData.location}
                onLocationSelect={handleLocationSelect}
                countryRestriction="in"
              />
              {errors.location && (
                <p className="text-red-500">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block">
                Number of Employees
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="no_of_employee"
                value={formData.no_of_employee}
                onChange={handleChange}
                placeholder="e.g., 15"
                min="1"
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "border border-red-500 bg-red-500/5 text-red-500":
                      errors.no_of_employee,
                  }
                )}
              />
              {errors.no_of_employee && (
                <p className="text-red-500">{errors.no_of_employee}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block">
                Service Categories
                <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                options={serviceCategoriesOptions}
                value={selectedServiceCategories}
                onChange={handleCategoryChange}
                placeholder="Select service categories your business offers"
                className="basic-multi-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: errors.categories
                      ? "rgba(239, 68, 68, 0.05)"
                      : "#f3f4f6",
                    borderRadius: "0.375rem",
                    border: state.isFocused
                      ? "2px solid #3b82f6"
                      : errors.categories
                      ? "1px solid #ef4444"
                      : "none",
                    boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#6b7280",
                  }),
                }}
                classNamePrefix="select"
              />
              {errors.categories && (
                <p className="text-red-500">{errors.categories}</p>
              )}
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="bg-[var(--color-primary)] text-white py-3 px-6 rounded w-1/2"
              >
                Previous
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 text-white py-3 px-6 rounded w-1/2"
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BusinessProviderInquiryForm;
