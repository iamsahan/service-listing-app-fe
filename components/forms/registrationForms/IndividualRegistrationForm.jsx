import React, { useState, useEffect } from "react";
import { providerAPI } from "@/api/provider";
import Select from "react-select";
import { toast } from "@hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import FileInput from "@/components/FileInput";
import { compressFormDocuments } from "@/utils/imageCompression";
import { Checkbox } from "@/components/ui/checkbox";
import ProviderTermsAndConditionsDialog from "./ProviderTermsDialog";

const spokenLanguages = [
  { label: "Hindi", value: "hindi" },
  { label: "Tamil", value: "tamil" },
  { label: "Telugu", value: "telugu" },
];

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Generic suggestion templates with category name placeholders
const suggestionTemplates = {
  profile_bio: [
    "Experienced ${category name} professional with 5+ years of expertise. Dedicated to quality work and customer satisfaction with strong attention to detail.",
    "Certified ${category name} specialist offering comprehensive services. Expert in delivering excellent results and maintaining professional standards.",
    "Skilled ${category name} provider committed to exceeding client expectations. Professional approach with focus on quality and reliability.",
    "Licensed ${category name} professional with extensive experience. Specialized in modern techniques and customer-focused service delivery.",
  ],
  certificates_awards: [
    "Certified ${category name} Specialist - Professional Training Institute",
    "${category name} Excellence Certificate - Industry Standards Board",
    "Advanced ${category name} Techniques Certification",
    "Best ${category name} Service Award 2023 - Local Trade Association",
  ],
};

const IndividualRegistrationForm = ({
  enquiryData,
  previousRegData,
  rejectedFields,
}) => {
  const isReRegistration = previousRegData && rejectedFields?.length > 0;

  // Helper function to get suggestions based on service categories
  const getSuggestions = (fieldType) => {
    const templates = suggestionTemplates[fieldType] || [];

    if (!enquiryData?.ServiceCategories?.length) {
      // Use "Service" as default category name if no categories available
      return templates.map((template) =>
        template.replace(/\$\{category name\}/g, "Service")
      );
    }

    // Get the first service category's name
    const primaryCategory = enquiryData.ServiceCategories[0];
    const categoryName = primaryCategory?.name || "Service";

    // Replace ${category name} placeholder with actual category name
    return templates.map((template) =>
      template.replace(/\$\{category name\}/g, categoryName)
    );
  };

  const [formData, setFormData] = useState({
    enquiry_id: enquiryData?.enquiry_id || "",
    name: enquiryData?.User?.name || "",
    dob: enquiryData?.User?.dob || "",
    nationality: previousRegData?.nationality || "Indian",
    gender: enquiryData?.User?.gender || "",
    qualification: enquiryData?.qualification || "",
    email: enquiryData?.User?.email || "",
    phone: enquiryData?.User?.mobile || "",
    whatsapp_number: previousRegData?.whatsapp_number || "",
    alternate_number:
      previousRegData?.alternate_number || enquiryData?.alternate_number || "",
    exact_address: previousRegData?.exact_address || "",
    emergency_contact_name: previousRegData?.emergency_contact_name || "",
    reference_number: previousRegData?.reference_number || "",
    reference_name: previousRegData?.reference_name || "",
    aadhar_number: previousRegData?.aadhar_number || "",
    pan_number: previousRegData?.pan_number || "",
    languages_spoken: [], // Will be set properly in useEffect
    service_radius: previousRegData?.service_radius || "",
    availability_type: previousRegData?.availability_type || "full_time",
    availability_hours: previousRegData?.availability_hours || {
      monday: { start: "09:00", end: "18:00", isOpen: true },
      tuesday: { start: "09:00", end: "18:00", isOpen: true },
      wednesday: { start: "09:00", end: "18:00", isOpen: true },
      thursday: { start: "09:00", end: "18:00", isOpen: true },
      friday: { start: "09:00", end: "18:00", isOpen: true },
      saturday: { start: "09:00", end: "18:00", isOpen: true },
      sunday: { start: "09:00", end: "18:00", isOpen: false },
    },
    years_experience: enquiryData?.years_experience || "",
    specializations: enquiryData?.skills || [],

    profile_bio: previousRegData?.profile_bio || "",
    certificates_awards: previousRegData?.qualification || "",

    documents: {
      logo: null,
      id_proof: null,
      aadhar: null,
      pan: null,
      address_proof: null,
      qualification_proof: null,
      service_certificate: null,
      insurance: null,
      agreement: null,
      terms_acceptance: null,
    },

    social_media_links: {
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    payment_method: previousRegData?.payment_method || "upi",
    payment_details: {
      upi: {
        id: previousRegData?.payment_details?.upi?.id || "",
        display_name: previousRegData?.payment_details?.upi?.display_name || "",
        phone: previousRegData?.payment_details?.upi?.phone || "",
      },
      bank: {
        name: previousRegData?.payment_details?.bank?.name || "",
        branch: previousRegData?.payment_details?.bank?.branch || "",
        ifsc: previousRegData?.payment_details?.bank?.ifsc || "",
        account_number:
          previousRegData?.payment_details?.bank?.account_number || "",
      },
    },
    categories: (enquiryData?.ServiceCategories || []).map((cat) => ({
      id: cat.category_id || "",
      experience_years: 0,
      is_primary: false,
    })),
    cities: (enquiryData?.Cities || []).map((city) => ({
      id: city.city_id || "",
      service_radius: 0,
      is_primary: false,
    })),
    primary_location: enquiryData?.primary_location || "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [showProfileBioSuggestions, setShowProfileBioSuggestions] =
    useState(false);
  const [showCertificatesSuggestions, setShowCertificatesSuggestions] =
    useState(false);

  const router = useRouter();

  useEffect(() => {
    if (previousRegData) {
      // Process documents from ServiceProviderDocuments array
      const documentsFromAPI = {
        business_registration: null,
        address_proof: null,
        insurance: null,
        terms_acceptance: null,
        agreement: null,
        logo: null,
      };

      if (previousRegData.ServiceProviderDocuments) {
        previousRegData.ServiceProviderDocuments.forEach((doc) => {
          documentsFromAPI[doc.document_type] = doc.document_url;
        });
      }

      // Helper function to parse languages_spoken properly
      const parseLanguagesSpoken = (languagesData) => {
        if (!languagesData || !Array.isArray(languagesData)) return [];

        try {
          // Handle double-encoded JSON like ["[\"hindi\"]"]
          if (
            languagesData.length > 0 &&
            typeof languagesData[0] === "string"
          ) {
            // First level parse: ["[\"hindi\"]"] -> "[\"hindi\"]"
            const firstParse = languagesData[0];
            // Second level parse: "[\"hindi\"]" -> ["hindi"]
            return JSON.parse(firstParse);
          }
          return languagesData;
        } catch (error) {
          console.error("Error parsing languages_spoken:", error);
          return [];
        }
      };

      const parsedLanguages = parseLanguagesSpoken(
        previousRegData?.languages_spoken
      );

      // Update selectedLanguages state
      const selectedLangOptions = spokenLanguages.filter((lang) =>
        parsedLanguages.includes(lang.value)
      );
      setSelectedLanguages(selectedLangOptions);

      setFormData((prevFormData) => ({
        ...prevFormData,

        name: previousRegData?.User?.name || enquiryData?.User?.name || "",
        dob: previousRegData?.User?.dob || enquiryData?.User?.dob || "",
        nationality:
          previousRegData?.nationality ||
          previousRegData?.nationality ||
          "Indian",
        gender:
          previousRegData?.User?.gender || enquiryData?.User?.gender || "",
        qualification:
          previousRegData?.qualification || enquiryData?.qualification || "",
        whatsapp_number: previousRegData?.whatsapp_number || "",
        alternate_number:
          previousRegData?.alternate_number ||
          enquiryData?.alternate_number ||
          "",
        exact_address: previousRegData?.exact_address || "",
        emergency_contact_name: previousRegData?.emergency_contact_name || "",
        reference_number: previousRegData?.reference_number || "",
        reference_name: previousRegData?.reference_name || "",
        aadhar_number: previousRegData?.aadhar_number || "",
        pan_number: previousRegData?.pan_number || "",
        languages_spoken: parsedLanguages,
        service_radius: previousRegData?.service_radius || "",
        availability_type: previousRegData?.availability_type || "full_time",
        availability_hours: previousRegData?.availability_hours || {
          monday: { start: "09:00", end: "18:00", isOpen: true },
          tuesday: { start: "09:00", end: "18:00", isOpen: true },
          wednesday: { start: "09:00", end: "18:00", isOpen: true },
          thursday: { start: "09:00", end: "18:00", isOpen: true },
          friday: { start: "09:00", end: "18:00", isOpen: true },
          saturday: { start: "09:00", end: "18:00", isOpen: true },
          sunday: { start: "09:00", end: "18:00", isOpen: false },
        },
        years_experience: enquiryData?.years_experience || "",
        specializations: enquiryData?.skills || [],

        profile_bio: previousRegData?.profile_bio || "",
        certificates_awards: previousRegData?.qualification || "",

        documents: {
          logo: documentsFromAPI.logo || null,
          id_proof: documentsFromAPI.id_proof || null,
          aadhar: documentsFromAPI.aadhar || null,
          pan: documentsFromAPI.pan || null,
          address_proof: documentsFromAPI.address_proof || null,
          qualification_proof: documentsFromAPI.qualification_proof || null,
          service_certificate: documentsFromAPI.service_certificate || null,
          insurance: documentsFromAPI.insurance || null,
          agreement: documentsFromAPI.agreement || null,
          terms_acceptance: documentsFromAPI.terms_acceptance || null,
        },

        social_media_links: {
          facebook: "",
          instagram: "",
          linkedin: "",
        },
        payment_method: previousRegData?.payment_method || "upi",
        payment_details: {
          upi: {
            id: previousRegData?.payment_details?.upi?.id || "",
            display_name:
              previousRegData?.payment_details?.upi?.display_name || "",
            phone: previousRegData?.payment_details?.upi?.phone || "",
          },
          bank: {
            name: previousRegData?.payment_details?.bank?.name || "",
            branch: previousRegData?.payment_details?.bank?.branch || "",
            ifsc: previousRegData?.payment_details?.bank?.ifsc || "",
            account_number:
              previousRegData?.payment_details?.bank?.account_number || "",
          },
        },
        categories: (enquiryData?.ServiceCategories || []).map((cat) => ({
          id: cat.category_id || "",
          experience_years: 0,
          is_primary: false,
        })),
        cities: (enquiryData?.Cities || []).map((city) => ({
          id: city.city_id || "",
          service_radius: 0,
          is_primary: false,
        })),
        primary_location: enquiryData?.primary_location || "",
      }));
    }
  }, [previousRegData]);

  const handleDayToggle = (day, isChecked) => {
    handleChange({
      target: {
        name: `availability_hours.${day}.isOpen`,
        value: isChecked,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value, required } = e.target;

    // Custom error keys for part-time availability hours
    const erroKey =
      name === "availability_hours.start"
        ? "start_time"
        : name === "availability_hours.end"
        ? "end_time"
        : name;

    // Show/hide error messages realtime
    if (value === "" && required) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [erroKey]: `${name.split("_").join(" ")} is required`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [erroKey]: "",
      }));
    }

    // Validate service radius
    if (name === "service_radius") {
      const radius = parseInt(value);
      if (radius < 0 || radius > 1000) {
        return;
      }
    }

    // Validate phone-like fields
    if (
      name === "phone" ||
      name === "whatsapp_number" ||
      name === "alternate_number" ||
      name === "emergency_contact_number" ||
      name === "payment_details.upi.phone" ||
      name === "reference_number"
    ) {
      if (value.length > 10 || !value.match(/^[0-9]{0,10}$/)) {
        return;
      }
    }

    // Validate PAN
    if (name === "pan_number") {
      if (value.length > 10) {
        return;
      }
    }

    // Validate Aadhaar
    if (name === "aadhar_number") {
      if (value.length > 12 || !/^\d*$/.test(value)) {
        return;
      }
    }

    // Handle nested objects (any depth)
    if (name.includes(".")) {
      const keys = name.split(".");

      setFormData((prev) => {
        const updated = { ...prev };
        let obj = updated;

        for (let i = 0; i < keys.length - 1; i++) {
          obj[keys[i]] = { ...obj[keys[i]] };
          obj = obj[keys[i]];
        }

        obj[keys[keys.length - 1]] = value;
        return updated;
      });

      return;
    }

    // Handle regular fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle language change
  const handleLanguageChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        languages_spoken: "",
      }));

      setFormData((prev) => ({
        ...prev,
        languages_spoken: selectedOptions.map((option) => option.value),
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        languages_spoken: "Select at least one language",
      }));
    }

    setSelectedLanguages(selectedOptions);
  };

  const isValidTimeSlot = (availability_hours) => {
    const { start, end } = availability_hours;
    if (start > end) return "Start time cannot be after end time";
  };

  // Set default part-time availability hours
  useEffect(() => {
    if (
      formData.availability_type === "part_time" &&
      !formData.availability_hours.start &&
      !formData.availability_hours.end
    ) {
      setFormData((prev) => ({
        ...prev,
        availability_hours: {
          start: "08:00",
          end: "17:00",
        },
      }));
    }
  }, [formData.availability_type]);

  const validateStep = (stepNumber) => {
    let newErrors = {};

    switch (stepNumber) {
      case 1:
        // Nationality
        if (!formData.nationality) newErrors.nationality = "Required";
        else if (!formData.nationality.match(/^[a-zA-Z\s]+$/))
          newErrors.nationality = "Only alphabets are allowed";
        else if (
          formData.nationality.length < 3 ||
          formData.nationality.length > 50
        )
          newErrors.nationality = "Must be between 3 and 50 characters";

        // Aadhar
        if (!formData.aadhar_number) newErrors.aadhar_number = "Required";
        else if (!/^\d{12}$/.test(formData.aadhar_number))
          newErrors.aadhar_number = "Aadhar must be exactly 12 digits";

        // PAN
        if (!formData.pan_number) newErrors.pan_number = "Required";
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number))
          newErrors.pan_number = "Invalid PAN Number";
        else if (formData.pan_number.length !== 10)
          newErrors.pan_number = "PAN must be exactly 10 characters";

        // Address
        if (!formData.exact_address) newErrors.exact_address = "Required";
        else if (
          formData.exact_address.length < 10 ||
          formData.exact_address.length > 200
        )
          newErrors.exact_address =
            "Address must be between 10 and 200 characters";

        // Languages
        if (
          !formData.languages_spoken ||
          formData.languages_spoken.length === 0
        )
          newErrors.languages_spoken = "Required";
        break;

      case 2:
        // Service Radius
        if (!formData.service_radius) newErrors.service_radius = "Required";
        else if (isNaN(formData.service_radius))
          newErrors.service_radius = "Must be a number";
        else if (formData.service_radius < 1 || formData.service_radius > 500)
          newErrors.service_radius = "Must be between 1 and 500 km";

        if (formData.availability_type === "part_time") {
          if (!formData.availability_hours.start)
            newErrors.start_time = "Required";
          if (!formData.availability_hours.end) newErrors.end_time = "Required";

          const error = isValidTimeSlot(formData.availability_hours);
          if (error) newErrors.availability_hours = error;
        }
        break;

      case 3:
        if (isReRegistration) {
          if (!formData.documents.logo && rejectedFields.includes("logo"))
            newErrors.logo = "Required";
          if (
            !formData.documents.id_proof &&
            rejectedFields.includes("id_proof")
          )
            newErrors.id_proof = "Required";
          if (!formData.documents.aadhar && rejectedFields.includes("aadhar"))
            newErrors.aadhar = "Required";
          if (!formData.documents.pan && rejectedFields.includes("pan"))
            newErrors.pan = "Required";
          if (
            !formData.documents.address_proof &&
            rejectedFields.includes("address_proof")
          )
            newErrors.address_proof = "Required";
          if (
            !formData.documents.agreement &&
            rejectedFields.includes("agreement")
          )
            newErrors.agreement = "Required";
          if (
            !formData.documents.terms_acceptance &&
            rejectedFields.includes("terms_acceptance")
          )
            newErrors.terms_acceptance = "Required";
        } else {
          if (!formData.documents.logo) newErrors.logo = "Required";
          if (!formData.documents.id_proof) newErrors.id_proof = "Required";
          if (!formData.documents.aadhar) newErrors.aadhar = "Required";
          if (!formData.documents.pan) newErrors.pan = "Required";
          if (!formData.documents.address_proof)
            newErrors.address_proof = "Required";
        }
        break;

      case 4:
        if (formData.payment_method === "upi") {
          const upiRegex = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

          if (!formData.payment_details.upi.id)
            newErrors["payment_details.upi.id"] = "Required";
          else if (!upiRegex.test(formData.payment_details.upi.id))
            newErrors["payment_details.upi.id"] = "Invalid UPI ID";
          else if (formData.payment_details.upi.id.length > 100)
            newErrors["payment_details.upi.id"] = "UPI ID too long";

          if (!formData.payment_details.upi.display_name)
            newErrors["payment_details.upi.display_name"] = "Required";
          else if (
            formData.payment_details.upi.display_name.length < 3 ||
            formData.payment_details.upi.display_name.length > 50
          )
            newErrors["payment_details.upi.display_name"] =
              "Must be 3–50 characters";

          if (!formData.payment_details.upi.phone)
            newErrors["payment_details.upi.phone"] = "Required";
          else if (!/^\d{10}$/.test(formData.payment_details.upi.phone))
            newErrors["payment_details.upi.phone"] = "Phone must be 10 digits";
        } else {
          if (!formData.payment_details.bank.name)
            newErrors["payment_details.bank.name"] = "Required";
          else if (
            formData.payment_details.bank.name.length < 3 ||
            formData.payment_details.bank.name.length > 100
          )
            newErrors["payment_details.bank.name"] = "Must be 3–100 characters";

          if (!formData.payment_details.bank.branch)
            newErrors["payment_details.bank.branch"] = "Required";
          else if (
            formData.payment_details.bank.branch.length < 3 ||
            formData.payment_details.bank.branch.length > 100
          )
            newErrors["payment_details.bank.branch"] =
              "Must be 3–100 characters";

          if (!formData.payment_details.bank.ifsc)
            newErrors["payment_details.bank.ifsc"] = "Required";
          else if (
            !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.payment_details.bank.ifsc)
          )
            newErrors["payment_details.bank.ifsc"] = "Invalid IFSC Code";

          if (!formData.payment_details.bank.account_number)
            newErrors["payment_details.bank.account_number"] = "Required";
          else if (
            !/^\d{9,18}$/.test(formData.payment_details.bank.account_number)
          )
            newErrors["payment_details.bank.account_number"] =
              "Account number must be 9–18 digits";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(step)) {
      return;
    }

    setLoading(true);

    try {
      // Show compression progress
      toast({
        title: "Processing",
        description: "Compressing images for faster upload...",
        variant: "default",
      });

      // Compress images before upload
      const compressedDocuments = await compressFormDocuments(
        formData.documents
      );

      // Calculate total size reduction
      const originalSize = Object.values(formData.documents)
        .filter((file) => file instanceof File)
        .reduce((total, file) => total + file.size, 0);

      const compressedSize = Object.values(compressedDocuments)
        .filter((file) => file instanceof File)
        .reduce((total, file) => total + file.size, 0);

      console.log(
        `Total size reduction: ${(originalSize / 1024 / 1024).toFixed(
          2
        )}MB -> ${(compressedSize / 1024 / 1024).toFixed(2)}MB`
      );

      const formDataObj = new FormData();

      // Append non-file fields
      Object.keys(formData).forEach((key) => {
        if (
          key !== "documents" &&
          formData[key] !== undefined &&
          formData[key] !== null
        ) {
          formDataObj.append(
            key,
            typeof formData[key] === "object"
              ? JSON.stringify(formData[key])
              : formData[key]
          );
        }
      });

      // Append compressed documents
      Object.entries(compressedDocuments).forEach(([key, file]) => {
        if (file) {
          formDataObj.append(key, file);
        }
      });

      // Log FormData for debugging
      for (let [key, value] of formDataObj.entries()) {
        console.log(key, value);
      }

      // Update status
      setUploadStatus("Uploading registration data...");
      setUploadProgress(0);

      // Send the request with progress tracking
      const response = await providerAPI.registerProvider(
        formDataObj,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          setUploadStatus(`Uploading... ${percentCompleted}%`);
        }
      );

      if (response?.provider_id || response?.data?.provider_id) {
        toast({
          title: "Success!",
          description: "Your registration was submitted successfully.",
          variant: "default",
        });
        router.push("/service-provider/register/sucess");
      } else {
        toast({
          title: "Error",
          description: response?.message || "Registration failed.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);

      const validationErrors = error.response?.data?.validation;
      let validationErrorString = "";
      if (validationErrors?.length) {
        validationErrors.forEach((error) => {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [error.field]: error.message,
          }));

          validationErrorString += `${error.message}\n`;
        });
      }

      // Enhanced error handling for different scenarios
      let errorMessage = "";

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage =
          "Upload timed out. Please check your internet connection and try again. Consider using smaller image files.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (error.response?.status === 413) {
        errorMessage =
          "Files are too large. Please use smaller files (images will be compressed automatically).";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again in a few minutes.";
      } else {
        errorMessage =
          validationErrorString !== ""
            ? validationErrorString
            : error.response?.data?.details ||
              error.response?.data?.message ||
              error.message ||
              "Registration failed. Please try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStatus("");
    }
  };

  const renderInputField = (
    name,
    label,
    placeholder,
    type = "text",
    disabled = false,
    required = false
  ) => (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`p-2 border rounded w-full ${
          errors[name] ? "border-red-500 bg-red-500/5" : ""
        } ${
          type === "number"
            ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            : ""
        }`}
        disabled={
          (isReRegistration && !rejectedFields.includes(name)) || disabled
        }
        required={required}
      />

      {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
    </div>
  );

  const renderFileInput = (name, label, required = false) => {
    const validateFileSize = (file) => {
      const maxSizeInMB = 10; // 10MB limit per file
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        toast({
          title: "File Too Large",
          description: `${label} must be less than ${maxSizeInMB}MB. File will be compressed automatically.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    };

    return (
      <div className="space-y-2 w-full">
        <FileInput
          name={name}
          label={label}
          required={required}
          file={formData.documents[name]}
          disabled={isReRegistration && !rejectedFields.includes(name)}
          onFileChange={(e) => {
            const file = e.target.files[0];

            if (file && !validateFileSize(file)) {
              // Don't proceed with file that's too large
              return;
            }
            setFormData((prev) => ({
              ...prev,
              documents: { ...prev.documents, [name]: file },
            }));

            setErrors((prevErrors) => ({
              ...prevErrors,
              [name]: null,
            }));
          }}
          onFileRemove={() =>
            setFormData((prev) => ({
              ...prev,
              documents: { ...prev.documents, [name]: null },
            }))
          }
        />

        {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
      </div>
    );
  };

  const renderSuggestionField = (
    fieldName,
    fieldType,
    placeholder,
    rows = 3
  ) => {
    const suggestions = getSuggestions(fieldType);
    const showSuggestions =
      fieldType === "profile_bio"
        ? showProfileBioSuggestions
        : showCertificatesSuggestions;
    const setShowSuggestions =
      fieldType === "profile_bio"
        ? setShowProfileBioSuggestions
        : setShowCertificatesSuggestions;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            {fieldType === "profile_bio"
              ? "Profile Bio"
              : "Certificates/Awards"}
          </label>
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            {showSuggestions ? "Hide" : "Show"} Suggestions
          </button>
        </div>

        {showSuggestions && (
          <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Click to use a suggestion:
            </p>
            <div className="grid gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      [fieldName]: suggestion,
                    }));
                    setShowSuggestions(false);
                  }}
                  className="text-left text-sm p-2 bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={
            isReRegistration &&
            !rejectedFields.includes(
              fieldName === "profile_bio" ? "profile_bio" : "qualifications"
            )
          }
          className={`w-full p-2 border rounded ${
            errors[fieldName] ? "border-red-500 bg-red-500/5" : ""
          }`}
          rows={rows}
        />

        {errors[fieldName] && (
          <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
        )}
      </div>
    );
  };

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personal Information</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderInputField("name", "Full Name", "e.g., John Doe", "text", true)}

        <div className="space-y-2">
          <label
            htmlFor="dob"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            disabled
          />
        </div>

        {renderInputField(
          "nationality",
          "Nationality",
          "e.g., Indian",
          "text",
          false,
          true
        )}

        <div className="space-y-2">
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="p-2 border rounded w-full h-11"
            disabled
          >
            <option value="">{formData.gender}</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="languages_spoken"
            className="block text-sm font-medium text-gray-700"
          >
            Languages Spoken <span className="text-red-500">*</span>
          </label>
          <Select
            id="languages_spoken"
            isMulti
            options={spokenLanguages}
            value={selectedLanguages}
            isDisabled={
              isReRegistration && !rejectedFields.includes("languages")
            }
            styles={{
              control: (base) => ({
                ...base,
                borderColor: errors.languages_spoken ? "red" : "",
                backgroundColor: errors.languages_spoken
                  ? "rgba(239, 68, 68, 0.05)"
                  : "",
              }),
            }}
            onChange={handleLanguageChange}
            placeholder="Select languages you can speak fluently"
            required
          />
          {errors.languages_spoken && (
            <p className="text-red-500 text-sm mt-1">
              {errors.languages_spoken}
            </p>
          )}
        </div>

        {renderInputField(
          "aadhar_number",
          "Aadhar Number",
          "e.g., 123456789012 (12-digit Aadhar Number)",
          "text",
          false,
          true
        )}
        {renderInputField(
          "pan_number",
          "PAN Number",
          "e.g., ABCDE1234F",
          "text",
          false,
          true
        )}
        {renderInputField(
          "email",
          "Email Address",
          "e.g., john.doe@example.com",
          "email",
          true
        )}
        {renderInputField(
          "phone",
          "Phone Number",
          "e.g., 0771234567",
          "tel",
          true
        )}
        {renderInputField(
          "whatsapp_number",
          "WhatsApp Number",
          "e.g., 0123456789",
          "tel"
        )}
        {renderInputField(
          "alternate_number",
          "Alternate Number",
          "e.g., 0123456789",
          "tel"
        )}
        {renderInputField(
          "qualification",
          "Educational Qualification",
          "e.g., Bachelor's Degree in Engineering",
          "text"
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="exact_address"
          className="block text-sm font-medium text-gray-700"
        >
          Complete Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="exact_address"
          name="exact_address"
          value={formData.exact_address}
          onChange={handleChange}
          placeholder="e.g., Sunrise County, Korrapadu road, Proddatur, Kadapa Dist"
          disabled={isReRegistration && !rejectedFields.includes("address")}
          className={`w-full p-2 border rounded ${
            errors.exact_address ? "border-red-500 bg-red-500/5" : ""
          }`}
          rows="3"
        />

        {errors.exact_address && (
          <p className="text-red-500 text-sm mt-1">{errors.exact_address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderInputField(
          "emergency_contact_name",
          "Emergency Contact Name",
          "e.g., Jane Doe",
          "text"
        )}
        {renderInputField(
          "reference_name",
          "Reference Name",
          "e.g., Dr. Smith",
          "text"
        )}
        {renderInputField(
          "reference_number",
          "Reference Number",
          "e.g., 0123456789",
          "tel"
        )}
      </div>
    </div>
  );

  const renderServiceDetails = () => (
    <div className="space-y-4">
      {/* Service Radius and Availability Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderInputField(
          "service_radius",
          "Service Radius (km)",
          "e.g., 15",
          "number",
          false,
          true
        )}
        <div className="space-y-2">
          <label
            htmlFor="availability_type"
            className="block text-sm font-medium text-gray-700"
          >
            Availability Type
          </label>
          <select
            id="availability_type"
            name="availability_type"
            value={formData.availability_type}
            onChange={handleChange}
            className="p-2 border rounded w-full h-11"
            disabled={
              isReRegistration && !rejectedFields.includes("availability_type")
            }
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
          </select>
        </div>
      </div>

      {/* Years of Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderInputField(
          "years_experience",
          "Years of Experience",
          "e.g., 5",
          "number",
          true,
          false
        )}
      </div>

      {/* Part-Time Schedule Editor */}
      {formData.availability_type === "part_time" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Weekly Availability
          </h3>
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="border p-4 rounded-lg bg-gray-50 space-y-2"
            >
              {/* Day Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`isOpen-${day}`}
                  checked={formData.availability_hours[day]?.isOpen || false}
                  onChange={(e) => handleDayToggle(day, e.target.checked)}
                  disabled={
                    isReRegistration &&
                    !rejectedFields.includes("availability_hours")
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`isOpen-${day}`}
                  className="ml-2 capitalize text-gray-700"
                >
                  {day}
                </label>
              </div>

              {/* Time Inputs for Open Days */}
              {formData.availability_hours[day]?.isOpen && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor={`start-${day}`}
                      className="text-sm text-gray-600"
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      id={`start-${day}`}
                      name={`availability_hours.${day}.start`}
                      value={formData.availability_hours[day]?.start || ""}
                      onChange={handleChange}
                      disabled={
                        isReRegistration &&
                        !rejectedFields.includes("availability_hours")
                      }
                      className={cn("p-2 border rounded w-full", {
                        "border-red-500 bg-red-500/5 text-red-500":
                          errors[`${day}_start_time`],
                      })}
                    />
                    {errors[`${day}_start_time`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`${day}_start_time`]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor={`end-${day}`}
                      className="text-sm text-gray-600"
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      id={`end-${day}`}
                      name={`availability_hours.${day}.end`}
                      value={formData.availability_hours[day]?.end || ""}
                      onChange={handleChange}
                      disabled={
                        isReRegistration &&
                        !rejectedFields.includes("availability_hours")
                      }
                      className={cn("p-2 border rounded w-full", {
                        "border-red-500 bg-red-500/5 text-red-500":
                          errors[`${day}_end_time`],
                      })}
                    />
                    {errors[`${day}_end_time`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`${day}_end_time`]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {errors.availability_hours && (
            <p className="text-red-500 text-sm mt-1">
              {errors.availability_hours}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="specializations"
          className="block text-sm font-medium text-gray-700"
        >
          Specializations/Skills <span className="text-red-500">*</span>
        </label>
        <textarea
          id="specializations"
          name="specializations"
          value={formData.specializations}
          onChange={handleChange}
          disabled={
            isReRegistration && !rejectedFields.includes("specializations")
          }
          placeholder="e.g., Plumbing, Electrical work, AC repair, Home maintenance"
          className="w-full p-2 border rounded"
          rows="3"
          required
        />
      </div>

      {renderSuggestionField(
        "profile_bio",
        "profile_bio",
        "e.g., Experienced technician with 5+ years in home services. Dedicated to quality work and customer satisfaction. (Profile Bio)",
        3
      )}

      {renderSuggestionField(
        "certificates_awards",
        "certificates_awards",
        "e.g., Diploma in Electrical Engineering, Best Service Award 2023 (Certificates/Awards)",
        3
      )}
    </div>
  );

  const renderDocumentUploads = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between ">
        <h2 className="text-3xl font-semibold mb-4 md:mb-0">Documents</h2>

        <a
          href={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/uploads/docs/terms_and_conditions.pdf`}
          download
          target="_blank"
          className="inline-block px-4 py-1 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105"
        >
          Download Agreement
        </a>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              File Upload Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Supported formats: PDF, JPG, PNG, DOC/DOCX</li>
                <li>Maximum file size: 5MB per file</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="py-2">
        Supported File Types: PDF, JPG, PNG, doc/docx (5MB max file size for
        each)
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderFileInput("logo", "Profile Picture", true)}
        {renderFileInput("id_proof", "ID Proof", true)}
        {renderFileInput("aadhar", "Aadhar Card", true)}
        {renderFileInput("pan", "PAN Card", true)}
        {renderFileInput("address_proof", "Address Proof", true)}
        {renderFileInput("qualification_proof", "Qualification Proof")}
        {renderFileInput("service_certificate", "Service Certificates")}
        {renderFileInput("insurance", "Insurance Documents")}
        {renderFileInput("agreement", "Signed Agreement")}
        {renderFileInput("terms_acceptance", "Signed Terms & Conditions")}
      </div>
    </div>
  );

  const renderPaymentDetails = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Payment Details</h2>
      <div className="space-y-2">
        <label
          htmlFor="payment_method"
          className="block text-sm font-medium text-gray-700"
        >
          Payment Method
        </label>
        <select
          id="payment_method"
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          disabled={
            isReRegistration && !rejectedFields.includes("payment_details")
          }
        >
          <option value="upi">UPI</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {formData.payment_method === "upi" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="upi_id"
              className="block text-sm font-medium text-gray-700"
            >
              UPI ID <span className="text-red-500">*</span>
            </label>
            <input
              id="upi_id"
              type="text"
              name="payment_details.upi.id"
              value={formData.payment_details.upi.id}
              onChange={handleChange}
              placeholder="e.g., john@paytm or 9876543210@upi"
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              className={`w-full p-2 border rounded ${
                errors["payment_details.upi.id"]
                  ? "border-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.upi.id"] && (
              <p className="text-red-500 text-sm">
                {errors["payment_details.upi.id"]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="upi_display_name"
              className="block text-sm font-medium text-gray-700"
            >
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              id="upi_display_name"
              type="text"
              name="payment_details.upi.display_name"
              value={formData.payment_details.upi.display_name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              className={`w-full p-2 border rounded ${
                errors["payment_details.upi.display_name"]
                  ? "border-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.upi.display_name"] && (
              <p className="text-red-500 text-sm">
                {errors["payment_details.upi.display_name"]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="upi_phone"
              className="block text-sm font-medium text-gray-700"
            >
              UPI Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="upi_phone"
              type="tel"
              name="payment_details.upi.phone"
              value={formData.payment_details.upi.phone}
              onChange={handleChange}
              placeholder="e.g., 9876543210"
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              className={`w-full p-2 border rounded ${
                errors["payment_details.upi.phone"]
                  ? "border-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.upi.phone"] && (
              <p className="text-red-500 text-sm">
                {errors["payment_details.upi.phone"]}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="bank_name"
              className="block text-sm font-medium text-gray-700"
            >
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              id="bank_name"
              type="text"
              name="payment_details.bank.name"
              value={formData.payment_details.bank.name}
              onChange={handleChange}
              placeholder="e.g., Commercial Bank of Ceylon"
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.name"]
                  ? "border-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.bank.name"] && (
              <p className="text-red-500 text-sm">
                {errors["payment_details.bank.name"]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bank_branch"
              className="block text-sm font-medium text-gray-700"
            >
              Branch Name
            </label>
            <input
              id="bank_branch"
              type="text"
              name="payment_details.bank.branch"
              value={formData.payment_details.bank.branch}
              onChange={handleChange}
              placeholder="e.g., Colombo 03 Branch"
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.branch"]
                  ? "border-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.bank.branch"] && (
              <p className="text-red-500 text-sm">
                {errors["payment_details.bank.branch"]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bank_ifsc"
              className="block text-sm font-medium text-gray-700"
            >
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              id="bank_ifsc"
              type="text"
              name="payment_details.bank.ifsc"
              value={formData.payment_details.bank.ifsc}
              onChange={handleChange}
              placeholder="e.g., COMB0230001"
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.ifsc"]
                  ? "border-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.bank.ifsc"] && (
              <p className="text-red-500 text-sm">
                {errors["payment_details.bank.ifsc"]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bank_account"
              className="block text-sm font-medium text-gray-700"
            >
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              id="bank_account"
              type="text"
              name="payment_details.bank.account_number"
              value={formData.payment_details.bank.account_number}
              onChange={handleChange}
              placeholder="e.g., 8001234567890"
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.account_number"]
                  ? "border-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.bank.account_number"] && (
              <p className="text-red-500 text-sm">
                {errors["payment_details.bank.account_number"]}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox id="terms_checkbox" required />
        <label htmlFor="terms_checkbox" className="text-sm">
          By submitting, you agree to our{" "}
          <ProviderTermsAndConditionsDialog
            trigger={
              <span className="underline cursor-pointer underline-offset-2 transition-colors font-medium">
                Terms and Conditions
              </span>
            }
          />
          .
        </label>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderPersonalDetails();
      case 2:
        return renderServiceDetails();
      case 3:
        return renderDocumentUploads();
      case 4:
        return renderPaymentDetails();
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      <span className="text-xl font-bold">Service Provider Registration</span>

      <div>
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-lg font-semibold mb-4">
                  {uploadStatus || "Processing registration..."}
                </div>

                {uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {uploadProgress}% completed
                    </div>
                  </div>
                )}

                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>

                <div className="text-sm text-gray-500 mt-4">
                  Please don't close this window. Large files are being
                  uploaded...
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-1/4 h-2 mx-1 ${
                step >= i ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {renderStep()}
          <div className="flex justify-between mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Previous
              </button>
            )}
            {step < 4 && (
              <button
                type="button"
                onClick={() =>
                  validateStep(step) && setStep((prev) => prev + 1)
                }
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            )}

            {step === 4 && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
              >
                {loading ? "Submitting..." : "Complete Registration"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndividualRegistrationForm;
