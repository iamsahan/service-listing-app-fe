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
      }
    };

    fetchCities();
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

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

    if (name === "business_name") {
      if (value.length > 100) return;
    }

    if (name === "name") {
      if (value.length > 50) return;
    }

    if (name === "mobile") {
      if (value.length > 10 || !value.match(/^[0-9]{0,10}$/)) return;
    }

    if (name === "email") {
      if (value.length > 100) return;
    }

    if (name === "website") {
      if (value.length > 100) return;
    }

    if (name === "no_of_employee") {
      const num = parseInt(value);
      if (num < 1 || num > 10000000000000000000) return;
    }

    onFormDataChange({ ...formData, [name]: value });
  };

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

  const handleLocationSelect = (locationData) => {
    const location = {
      coordinates: locationData.coordinates,
      address: locationData.details?.street
        ? `${locationData.details.street}, ${
            locationData.details.city || ""
          }, ${locationData.details.state || ""}`
        : locationData.address,
      details: locationData.details,
    };

    handleLocationChange(location);
  };

  const handleCitiesChange = (selectedCities) => {
    if (Array.isArray(selectedCities) && selectedCities.length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        cities: "",
      }));

      onFormDataChange({
        ...formData,
        cities: selectedCities.map((city) => city.value),
      });
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        cities: "Select at least one city",
      }));
    }

    setSelectedCities(selectedCities);
  };

  const handleCategoryChange = (selectedCategories) => {
    if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        categories: "",
      }));

      onFormDataChange({
        ...formData,
        categories: selectedCategories.map((cat) => cat.value),
      });
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        categories: "Select at least one category",
      }));
    }

    setSelectedServiceCategories(selectedCategories);
  };

  const isValidDOB = (dob) => {
    if (!dob) return;

    const dobDate = dayjs(dob);
    if (!dobDate.isValid()) return "Invalid date format";
    if (dobDate.isAfter(today)) return "Birthdate cannot be in the future";

    const age = today.diff(dobDate, "year");

    if (age < 18 || age > 80) return "Age must be between 18 and 80";
  };

  const validateStep1 = () => {
    let newErrors = {};

    if (!formData.business_name || formData.business_name.trim() === "") {
      newErrors.business_name = "Business name is required";
    }

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Authorized person name is required";
    }

    if (!formData.mobile || formData.mobile.trim() === "") {
      newErrors.mobile = "Authorized person contact is required";
    } else {
      const cleanMobile = formData.mobile.replace(/[^0-9]/g, "");
      if (!/^\d{10,15}$/.test(cleanMobile)) {
        newErrors.mobile = "Phone number must be between 10 and 15 digits";
      }
    }

    if (formData.dob && formData.dob.trim() !== "") {
      const error = isValidDOB(formData.dob);
      if (error) newErrors.dob = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Business email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!selectedCities || selectedCities.length === 0) {
      newErrors.cities = "Select at least one city";
    }

    if (!formData.location) {
      newErrors.location = "Business location is required";
    }

    if (!formData.no_of_employee || formData.no_of_employee === "") {
      newErrors.no_of_employee = "Number of employees is required";
    } else if (isNaN(formData.no_of_employee)) {
      newErrors.no_of_employee = "Must be a number";
    } else if (formData.no_of_employee < 1) {
      newErrors.no_of_employee = "Must be at least 1 employee";
    }

    if (!selectedServiceCategories || selectedServiceCategories.length === 0) {
      newErrors.categories = "Select at least one category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const formDataToSend = {
      type: "business",
      business_name: formData.business_name,
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      gender: formData.gender || null,
      dob: formData.dob || null,
      business_type: formData.business_type,
      website: formData.website || null,
      location: {
        type: "point",
        coordinates: formData.location?.coordinates || [],
      },
      categories: selectedServiceCategories.map((cat) => cat.value),
      cities: selectedCities.map((city) => city.value),
      no_of_employee: formData.no_of_employee.toString(),
    };

    try {
      setIsSubmitting(true);
      setIsLoading(true);
      await providerAPI.createEnquiry(formDataToSend);
      toast({
        title: "Success!",
        description: "Your business inquiry was submitted successfully.",
      });

      router.push("/registration/sucess");
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
    <div className="max-w-2xl mx-auto text-left">
      {isLoading && (
        <LoadingScreen message={"Inquiry Application Submitting...."} />
      )}
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Business Name
                <span className="text-red-500 ml-0.5">*</span>
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
                  "w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800",
                  {
                    "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5":
                      errors.business_name,
                  }
                )}
              />
              {errors.business_name && (
                <p className="text-red-500 text-xs pl-2">{errors.business_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Business Type
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                required
                className={cn(
                  "w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800",
                  {
                    "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5":
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
                <p className="text-red-500 text-xs pl-2">{errors.business_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Authorized Person Name
                <span className="text-red-500 ml-0.5">*</span>
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
                  "w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800",
                  {
                    "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5":
                      errors.name,
                  }
                )}
              />
              {errors.name && <p className="text-red-500 text-xs pl-2">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">Authorized Person Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">Authorized Person Date of Birth</label>
              <div
                className={cn("rounded-2xl overflow-hidden", {
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
                              : "#ffffff",
                            border: errors.dob ? "1px solid #ef4444" : "1px solid #e5e7eb",
                            borderRadius: "1rem",
                            transition: "all 0.2s ease-in-out",
                            "& fieldset": {
                              border: "none",
                            },
                            "&:hover fieldset": {
                              border: "none",
                            },
                            "&.Mui-focused fieldset": {
                              border: "none",
                            },
                            "&.Mui-focused": {
                              borderColor: "#10b981",
                              boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.12)",
                            },
                            "&.Mui-error fieldset": {
                              border: "none",
                            },
                          },
                          "& .MuiInputBase-input": {
                            padding: "12px 16px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1f2937",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {errors.dob && <p className="text-red-500 text-xs pl-2">{errors.dob}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Authorized Person Contact
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g., 0123456789"
                required
                className={cn(
                  "w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  {
                    "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5":
                      errors.mobile,
                  }
                )}
              />
              {errors.mobile && <p className="text-red-500 text-xs pl-2">{errors.mobile}</p>}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">Business Website</label>
              <input
                type="url"
                name="website"
                maxLength={50}
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g., https://www.yourcompany.com"
                className="w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Business Email
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="email"
                name="email"
                maxLength={50}
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., info@yourcompany.com"
                className={cn(
                  "w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800",
                  {
                    "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5":
                      errors.email,
                  }
                )}
              />
              {errors.email && <p className="text-red-500 text-xs pl-2">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Cities/Regions of Service
                <span className="text-red-500 ml-0.5">*</span>
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
                      : "#ffffff",
                    borderRadius: "1rem",
                    border: state.isFocused
                      ? "1px solid #10b981"
                      : errors.cities
                      ? "1px solid #ef4444"
                      : "1px solid #e5e7eb",
                    boxShadow: state.isFocused ? "0 0 0 4px rgba(16, 185, 129, 0.12)" : "none",
                    padding: "2px 4px",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#9ca3af",
                  }),
                }}
              />
              {errors.cities && <p className="text-red-500 text-xs pl-2">{errors.cities}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Business Location
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div
                className={cn("rounded-2xl overflow-hidden border border-neutral-200", {
                  "border border-red-500 bg-red-500/5": errors.location,
                })}
              >
                <SetLocationWithMap
                  initialLocation={formData.location}
                  onLocationSelect={handleLocationSelect}
                  countryRestriction="in"
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-xs pl-2">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Number of Employees
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="number"
                name="no_of_employee"
                value={formData.no_of_employee}
                onChange={handleChange}
                placeholder="e.g., 15"
                min="1"
                className={cn(
                  "w-full bg-white border border-neutral-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-sm font-semibold text-neutral-800",
                  {
                    "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-500/5":
                      errors.no_of_employee,
                  }
                )}
              />
              {errors.no_of_employee && (
                <p className="text-red-500 text-xs pl-2">{errors.no_of_employee}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                Service Categories
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <Select
                isMulti
                options={serviceCategoriesOptions}
                value={selectedServiceCategories}
                onChange={handleCategoryChange}
                placeholder="Select service categories your business offers"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: errors.categories
                      ? "rgba(239, 68, 68, 0.05)"
                      : "#ffffff",
                    borderRadius: "1rem",
                    border: state.isFocused
                      ? "1px solid #10b981"
                      : errors.categories
                      ? "1px solid #ef4444"
                      : "1px solid #e5e7eb",
                    boxShadow: state.isFocused ? "0 0 0 4px rgba(16, 185, 129, 0.12)" : "none",
                    padding: "2px 4px",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#9ca3af",
                  }),
                }}
              />
              {errors.categories && (
                <p className="text-red-500 text-xs pl-2">{errors.categories}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="w-1/2 bg-neutral-100 hover:bg-neutral-200 text-black py-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm transition-all"
              >
                Previous
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50"
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
