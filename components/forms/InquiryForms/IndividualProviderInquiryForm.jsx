"use client";
import React, { useEffect, useState } from "react";
import { serviceAPI } from "@/api/services";
import Select from "react-select";
import { providerAPI } from "@api/provider";
import SetLocationWithMap from "@/components/SetLocationWithMap";
import { toast } from "@hooks/use-toast";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { cn } from "@/lib/utils";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField } from "@mui/material";
import dayjs from "dayjs";

const IndividualProviderInquiryForm = ({ formData, onFormDataChange }) => {
  const [step, setStep] = useState(1);

  // Calculate minimum age (18 years old - latest possible birth date)
  const today = dayjs();
  const minAgeDate = today.subtract(18, "year");

  // Calculate maximum age (80 years old - earliest possible birth date)
  const maxAgeDate = today.subtract(80, "year");

  const [citiesOptions, setCitiesOpions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [serviceCategoriesOptions, setServiceCategoriesOptions] = useState([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState(
    []
  );
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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

  // Handle Input Change
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

    // Prevent unusual inputs in years_experience
    if (name === "years_experience") {
      const years = parseInt(value);
      if (years < 0 || years > 80) {
        return;
      }
    }

    // Prevent unusual inputs in email
    if (name === "email") {
      if (value.length > 50) {
        return;
      }
    }

    // Prevent unusual inputs in mobile
    if (name === "mobile") {
      if (value.length > 10 || !value.match(/^[0-9]{0,10}$/)) {
        return;
      }
    }

    onFormDataChange({ ...formData, [name]: value });
  };

  // Handle Location Change
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

  // Handle Location Select from SetLocationWithMap
  const handleLocationSelect = (locationData) => {
    const location = {
      coordinates: locationData.coordinates,
      address: locationData.details?.street
        ? `${locationData.details.street}, ${
            locationData.details.city || ""
          }, ${locationData.details.state || ""}`
        : locationData.address, // fallback to full address
      details: locationData.details,
    };

    handleLocationChange(location);
  };

  //Handle Seelecte categories change
  const handleSelectedCategoriesChange = (selectedCategories) => {
    if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        categories: "",
      }));

      onFormDataChange({
        ...formData,
        categories: selectedCategories.map((category) => category.value),
      });
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        categories: "Select at least one category",
      }));
    }

    setSelectedServiceCategories(selectedCategories);
  };

  // Handle Selected Cities Change
  const handleSelectedCitiesChange = (selectedCities) => {
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

  const validateStep1 = () => {
    let newErrors = {};

    // Full Name Validation
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Full name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s'.-]+$/.test(formData.name.trim())) {
      newErrors.name =
        "Full name can only contain letters, spaces, and basic punctuation";
    }

    // Email Validation
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (formData.email.trim().length > 100) {
      newErrors.email = "Email must not exceed 100 characters";
    }

    // Mobile Validation
    if (!formData.mobile || formData.mobile.trim() === "") {
      newErrors.mobile = "Phone number is required";
    } else {
      const cleanMobile = formData.mobile.replace(/[^0-9]/g, "");
      if (!/^\d{10,15}$/.test(cleanMobile)) {
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

    // Experience Validation
    if (
      formData.years_experience === "" ||
      formData.years_experience === null
    ) {
      newErrors.years_experience = "Experience is required";
    } else if (isNaN(formData.years_experience)) {
      newErrors.years_experience = "Experience must be a number";
    } else if (formData.years_experience < 1) {
      newErrors.years_experience = "Experience must be at least 1 year";
    } else if (formData.years_experience > 80) {
      newErrors.years_experience = "Experience must be less than 80 years";
    }

    // Cities Validation
    if (!selectedCities || selectedCities.length === 0) {
      newErrors.cities = "Select at least one city";
    }

    // Categories Validation
    if (!selectedServiceCategories || selectedServiceCategories.length === 0) {
      newErrors.categories = "Select at least one category";
    }

    // Location Validation
    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    // Skills Validation
    if (!formData.skills || formData.skills.trim() === "") {
      newErrors.skills = "Skills are required";
    } else if (formData.skills.trim().length < 2) {
      newErrors.skills = "Skills must be at least 2 characters";
    } else if (formData.skills.trim().length > 300) {
      newErrors.skills = "Skills must not exceed 300 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Go to Next Step
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  // Go to Previous Step
  const prevStep = () => setStep((prev) => prev - 1);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const formDataToSend = {
      type: "individual",
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      gender: formData.gender || null,
      business_type: "individual",
      dob: formData.dob || null,
      years_experience: formData.years_experience.toString().padStart(2, "0"), // Format as "04" for 4
      categories: selectedServiceCategories.map((cat) => cat.value),
      cities: selectedCities.map((city) => city.value),
      location: {
        type: "point",
        coordinates: formData.location?.coordinates || [],
      },
      skills: formData.skills,
    };

    try {
      setIsLoading(true);
      await providerAPI.createEnquiry(formDataToSend);
      console.log("Final Form Data:", formDataToSend);
      toast({
        title: "Success!",
        description: "Your inquiry was submitted successfully.",
        variant: "default",
      });

      router.push("/registration/sucess");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.details ||
        "Failed to submit inquiry. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pl-1">
      {isLoading && (
        <LoadingScreen message={"Inquiry Application Submitting...."} />
      )}
      <form onSubmit={handleSubmit}>
        {/* Step 1: General Information */}
        {step === 1 && (
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label className="block">
                Full Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
                maxLength={100}
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "bg-red-500/5 border border-red-500/50 text-red-500":
                      errors.name,
                  }
                )}
              />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="block">Gender</label>
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
              <label className="block">Date Of Birth</label>

              <div
                className={cn("rounded-md", {
                  "border border-red-500/50": errors.dob,
                })}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={formData.dob ? dayjs(formData.dob) : null}
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
                        placeholder: "Select your date of birth",
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
                Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., john.doe@example.com"
                required
                maxLength={50}
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "bg-red-500/5 border border-red-500/50 text-red-500":
                      errors.email,
                  }
                )}
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block">
                Phone
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
                    "bg-red-500/5 border border-red-500/50 text-red-500":
                      errors.mobile,
                  }
                )}
              />
              {errors.mobile && <p className="text-red-500">{errors.mobile}</p>}
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-[var(--color-primary)] hover:bg-indigo-600 text-white py-3 px-6 rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {step === 2 && (
          <div className="space-y-4">
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
                onChange={handleSelectedCitiesChange}
                placeholder="Select cities where you provide services"
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
                Exact Location
                <span className="text-red-500">*</span>
              </label>
              <div
                className={cn({
                  "border-red-500 bg-red-500/5": errors.location,
                  "border-gray-300": !errors.location,
                })}
              >
                <SetLocationWithMap
                  initialLocation={formData.location}
                  onLocationSelect={handleLocationSelect}
                  countryRestriction="in"
                />
              </div>
              {errors.location && (
                <p className="text-red-500">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block">
                Service Categories
                <span className="text-red-500">*</span>
              </label>

              <Select
                id="categories"
                options={serviceCategoriesOptions}
                isMulti
                value={selectedServiceCategories}
                onChange={handleSelectedCategoriesChange}
                placeholder="Select service categories you specialize in"
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
              />
              {errors.categories && (
                <p className="text-red-500">{errors.categories}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block">
                Years of Experience
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="years_experience"
                min="0"
                max="80"
                value={formData.years_experience}
                onChange={handleChange}
                placeholder="e.g., 5"
                required
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "bg-red-500/5 border border-red-500/50 text-red-500":
                      errors.years_experience,
                  }
                )}
              />
              {errors.years_experience && (
                <p className="text-red-500">{errors.years_experience}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block">
                Skills
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., Plumbing, Electrical work, Home repairs"
                className={cn(
                  "w-full bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  {
                    "bg-red-500/5 border border-red-500/50 text-red-500":
                      errors.skills,
                  }
                )}
              />
              {errors.skills && <p className="text-red-500">{errors.skills}</p>}
            </div>

            <div className="w-full flex gap-2 pt-3">
              <button
                type="button"
                onClick={prevStep}
                className="bg-[var(--color-primary)] text-white py-3 px-6 rounded w-1/2"
              >
                Back
              </button>

              <button
                type="submit"
                className="bg-green-500 text-white py-3 px-6 rounded w-1/2"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default IndividualProviderInquiryForm;
