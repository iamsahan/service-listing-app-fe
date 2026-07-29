import React, { useState, useEffect } from "react";
import { providerAPI } from "@/api/provider";
import { toast } from "@hooks/use-toast";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { cn } from "@/lib/utils";
import FileInput from "@/components/FileInput";
import { CalendarSearch } from "lucide-react";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Checkbox } from "@/components/ui/checkbox";
import ProviderTermsAndConditionsDialog from "./ProviderTermsDialog";

const BusinessRegistrationForm = ({
  enquiryData,
  rejectedFields,
  previousRegData,
}) => {
  const isReRegistration = previousRegData && rejectedFields?.length > 0;

  // Calculate minimum start
  const today = new Date();
  const minStartDate = today.toISOString().split("T")[0];

  // Calculate maximum start
  const maxStartDate = new Date(
    today.getFullYear() - 200,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  console.log(previousRegData);

  const [formData, setFormData] = useState({
    // Pre-filled data from enquiry (non-editable)
    enquiry_id: enquiryData?.enquiry_id || "",
    business_name: enquiryData?.business_name || "",
    business_type: enquiryData?.business_type || "",
    authorized_person_name: enquiryData?.authorized_person_name || "",
    authorized_person_contact:
      enquiryData?.authorized_person_contact ||
      previousRegData?.User?.mobile ||
      "",
    email: enquiryData?.User?.email || "",
    primary_location: enquiryData?.primary_location || "",
    number_of_employees: enquiryData?.number_of_employees || "",

    // New registration fields - Fixed field mappings
    business_registration_number:
      previousRegData?.business_registration_number || "",
    tax_id: previousRegData?.tax_id || "",
    business_start_date: previousRegData?.business_start_date || "",
    whatsapp_number: previousRegData?.whatsapp_number || "",
    service_radius: previousRegData?.service_radius || "",
    exact_address: previousRegData?.exact_address || "", // Added missing address field
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
    categories: (enquiryData?.ServiceCategories || []).map((cat) => ({
      id: cat.category_id,
      experience_years: 0,
      is_primary: false,
    })),
    cities: (enquiryData?.Cities || []).map((city) => ({
      id: city.city_id || "",
      service_radius: 0,
      is_primary: false,
    })),
    employees:
      previousRegData?.ServiceProviderEmployees?.map((emp) => {
        return {
          name: emp.User.name,
          gender: emp.User.gender,
          qualification: emp.qualification,
          designation: emp.role,
          phone: emp.User.mobile,
          whatsapp_number: emp.whatsapp_number,
          email: emp.User.email,
          service_category: emp.service_category,
          experience: emp.experience,
        };
      }) ||
      Array(enquiryData?.number_of_employees || 1).fill({
        name: "",
        gender: "",
        qualification: "",
        designation: "",
        phone: "",
        whatsapp_number: null,
        email: "",
        service_category: "",
        experience: "",
      }),
    documents: {
      business_registration: null,
      address_proof: null,
      insurance: null,
      terms_acceptance: null,
      agreement: null,
      logo: null,
    },
    payment_method: previousRegData?.payment_method || "upi",
    payment_details: {
      upi: previousRegData?.payment_details?.upi || {
        id: "",
        display_name: "",
        phone: "",
      },
      bank: previousRegData?.payment_details?.bank || {
        name: "",
        branch: "",
        ifsc: "",
        account_number: "",
      },
    },
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();

  // Update form data when previousRegData changes (for async data loading)
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

      setFormData((prevFormData) => ({
        ...prevFormData,
        primary_location: enquiryData?.primary_location || "",
        number_of_employees: enquiryData?.number_of_employees || "",
        service_radius: previousRegData?.service_radius || 0,
        exact_address: previousRegData?.exact_address || "",
        business_name:
          previousRegData?.business_name || enquiryData?.business_name || "",
        business_type:
          previousRegData?.business_type || enquiryData?.business_type || "",
        business_start_date: previousRegData?.business_start_date || "",
        business_registration_number:
          previousRegData?.business_registration_number || "",
        tax_id: previousRegData?.tax_id || "",
        whatsapp_number: previousRegData?.whatsapp_number || "",
        email: previousRegData?.User?.email || enquiryData?.User?.email || "",
        authorized_person_name:
          previousRegData?.User?.name ||
          enquiryData?.authorized_person_name ||
          "",
        authorized_person_contact:
          previousRegData?.authorized_person_contact ||
          previousRegData?.User?.mobile ||
          enquiryData?.authorized_person_contact ||
          previousRegData?.User?.mobile ||
          "",
        payment_method: previousRegData?.payment_method || "upi",
        employees:
          previousRegData?.ServiceProviderEmployees?.map((emp) => {
            return {
              name: emp.User.name,
              gender: emp.User.gender,
              qualification: emp.qualification,
              designation: emp.role,
              phone: emp.User.mobile,
              whatsapp_number: emp.whatsapp_number,
              email: emp.User.email,
              service_category: emp.service_category,
              experience: emp.experience,
            };
          }) ||
          Array(enquiryData?.number_of_employees || 1).fill({
            name: "",
            gender: "",
            qualification: "",
            designation: "",
            phone: "",
            whatsapp_number: null,
            email: "",
            service_category: "",
            experience: "",
          }),
        documents: documentsFromAPI,
        payment_details: {
          upi: previousRegData?.payment_details?.upi || {
            id: "",
            display_name: "",
            phone: "",
          },
          bank: previousRegData?.payment_details?.bank || {
            name: "",
            branch: "",
            ifsc: "",
            account_number: "",
          },
        },
      }));
    }
  }, [previousRegData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format name for display
    const friendlyName = name
      .split(".")
      .pop()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Show/hide error messages
    if (value === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: `${friendlyName} is required`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }

    // Validate business start date
    if (name === "business_start_date") {
      const error = isValidStartDate(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        business_start_date: error || "",
      }));
    }

    // Validate service_radius
    if (name === "service_radius") {
      const radius = parseInt(value);
      if (radius < 0 || radius > 1000) return;
    }

    // Validate phone-like fields
    if (name === "whatsapp_number" || name === "payment_details.upi.phone") {
      if (value.length > 10 || !/^[0-9]{0,10}$/.test(value)) return;
    }

    // Validate tax_id / TIN
    if (name === "tax_id") {
      if (value.length > 11) return;
    }

    // Handle nested
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

    // Handle regular
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeChange = (index, field, value) => {
    const updatedEmployees = [...formData.employees];

    // Show/hide error messages realtime
    if (value === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`employees[${index}].${field}`]: `${field
          .split("_")
          .join(" ")} is required`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`employees[${index}].${field}`]: "",
      }));
    }

    // Prevent unusual inputs in mobile
    if (field === "phone" || field === "whatsapp_number") {
      if (value.length > 10 || !value.match(/^[0-9]{0,10}$/)) {
        return;
      }
    }

    updatedEmployees[index] = {
      ...updatedEmployees[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      employees: updatedEmployees,
    }));
  };

  // Validate employees
  const validateEmployees = (errors) => {
    formData.employees.forEach((employee, index) => {
      if (!employee.name?.trim() === "" || !employee.name)
        errors[`employees[${index}].name`] = "Required";
      else if (!employee.name?.match(/^[a-zA-Z\s]+$/))
        errors[`employees[${index}].name`] = "Invalid name";
      if (!employee.phone?.match(/^\d{10}$/))
        errors[`employees[${index}].phone`] = "Required";
      if (!employee.email?.trim() === "" || !employee.email)
        errors[`employees[${index}].email`] = "Required";
      else if (!employee.email?.match(/^\S+@\S+\.\S+$/))
        errors[`employees[${index}].email`] = "Invalid email";
      if (!employee.gender) errors[`employees[${index}].gender`] = "Required";
    });

    if (Object.keys(errors).length === 0) {
      const emails = new Set();
      formData.employees.forEach((employee, index) => {
        if (emails.has(employee.email)) {
          errors[`employees[${index}].email`] = "Email already used";
        } else {
          emails.add(employee.email);
        }
      });

      const phones = new Set();
      formData.employees.forEach((employee, index) => {
        if (phones.has(employee.phone)) {
          errors[`employees[${index}].phone`] = "Phone number already used";
        } else {
          phones.add(employee.phone);
        }
      });
    }

    return errors;
  };

  const isValidStartDate = (startDate) => {
    const today = new Date();
    const start = new Date(startDate);

    if (start > today) return "Start date cannot be in the future";
    if (start.getFullYear() < today.getFullYear() - 200)
      return "Invalid start date";
  };

  const validateStep = (stepNumber) => {
    let newErrors = {};

    switch (stepNumber) {
      case 1:
        // Business Registration Number
        if (!formData.business_registration_number?.trim())
          newErrors.business_registration_number = "Required";
        else if (
          !/^[A-Za-z0-9\-\/]+$/.test(formData.business_registration_number)
        )
          newErrors.business_registration_number =
            "Only letters, numbers, hyphens, and slashes allowed";
        else if (
          formData.business_registration_number.length < 5 ||
          formData.business_registration_number.length > 30
        )
          newErrors.business_registration_number = "Must be 5–30 characters";

        // Tax ID
        if (!formData.tax_id?.trim()) newErrors.tax_id = "Required";
        else if (!/^\d{11}$/.test(formData.tax_id))
          newErrors.tax_id = "Tax ID must be exactly 11 digits";

        // WhatsApp Number
        if (!formData.whatsapp_number?.trim())
          newErrors.whatsapp_number = "Required";
        else if (!/^\d{10}$/.test(formData.whatsapp_number))
          newErrors.whatsapp_number = "WhatsApp number must be 10 digits";

        // Business Start Date
        if (!formData.business_start_date)
          newErrors.business_start_date = "Required";
        else {
          const error = isValidStartDate(formData.business_start_date);
          if (error) newErrors.business_start_date = error;
        }
        break;

      case 2:
        // Service Radius
        if (!formData.service_radius || formData.service_radius === 0)
          newErrors.service_radius = "Required";
        else if (isNaN(formData.service_radius))
          newErrors.service_radius = "Must be a number";
        else if (formData.service_radius < 1 || formData.service_radius > 500)
          newErrors.service_radius = "Must be between 1 and 500 km";

        // Exact Address
        if (!formData.exact_address?.trim())
          newErrors.exact_address = "Required";
        else if (
          formData.exact_address.length < 10 ||
          formData.exact_address.length > 200
        )
          newErrors.exact_address = "Address must be 10–200 characters";
        break;

      case 3:
        // If you later add employees logic
        newErrors = validateEmployees(newErrors);
        break;

      case 4:
        if (isReRegistration) {
          if (
            !formData.documents.business_registration &&
            rejectedFields.includes("business_registration")
          )
            newErrors.business_registration = "Required";
          if (
            !formData.documents.address_proof &&
            rejectedFields.includes("address_proof")
          )
            newErrors.address_proof = "Required";
          if (
            !formData.documents.terms_acceptance &&
            rejectedFields.includes("terms_acceptance")
          )
            newErrors.terms_acceptance = "Required";
          if (
            !formData.documents.agreement &&
            rejectedFields.includes("agreement")
          )
            newErrors.agreement = "Required";
        } else {
          if (!formData.documents.business_registration)
            newErrors.business_registration = "Required";
          if (!formData.documents.address_proof)
            newErrors.address_proof = "Required";
          if (!formData.documents.terms_acceptance)
            newErrors.terms_acceptance = "Required";
          if (!formData.documents.agreement) newErrors.agreement = "Required";
        }
        break;

      case 5:
        if (formData.payment_method === "upi") {
          const upiRegex = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

          if (!formData.payment_details.upi.id?.trim())
            newErrors["payment_details.upi.id"] = "Required";
          else if (!upiRegex.test(formData.payment_details.upi.id))
            newErrors["payment_details.upi.id"] = "Invalid UPI ID";
          else if (formData.payment_details.upi.id.length > 100)
            newErrors["payment_details.upi.id"] = "UPI ID too long";

          if (!formData.payment_details.upi.display_name?.trim())
            newErrors["payment_details.upi.display_name"] = "Required";
          else if (
            formData.payment_details.upi.display_name.length < 3 ||
            formData.payment_details.upi.display_name.length > 50
          )
            newErrors["payment_details.upi.display_name"] =
              "Must be 3–50 characters";

          if (!formData.payment_details.upi.phone?.trim())
            newErrors["payment_details.upi.phone"] = "Required";
          else if (!/^\d{10}$/.test(formData.payment_details.upi.phone))
            newErrors["payment_details.upi.phone"] =
              "Phone must be exactly 10 digits";
        } else {
          if (!formData.payment_details.bank.name?.trim())
            newErrors["payment_details.bank.name"] = "Required";
          else if (
            formData.payment_details.bank.name.length < 3 ||
            formData.payment_details.bank.name.length > 100
          )
            newErrors["payment_details.bank.name"] = "Must be 3–100 characters";

          if (!formData.payment_details.bank.branch?.trim())
            newErrors["payment_details.bank.branch"] = "Required";
          else if (
            formData.payment_details.bank.branch.length < 3 ||
            formData.payment_details.bank.branch.length > 100
          )
            newErrors["payment_details.bank.branch"] =
              "Must be 3–100 characters";

          if (!formData.payment_details.bank.ifsc?.trim())
            newErrors["payment_details.bank.ifsc"] = "Required";
          else if (
            !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.payment_details.bank.ifsc)
          )
            newErrors["payment_details.bank.ifsc"] = "Invalid IFSC Code";

          if (!formData.payment_details.bank.account_number?.trim())
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

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(step)) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append non-file fields
      Object.keys(formData).forEach((key) => {
        if (
          key !== "documents" &&
          formData[key] !== undefined &&
          formData[key] !== null &&
          key !== "business_start_date"
        ) {
          formDataToSend.append(
            key,
            typeof formData[key] === "object"
              ? JSON.stringify(formData[key])
              : formData[key]
          );
        } else if (key === "business_start_date") {
          let dateString;
          if (formData[key]) {
            // Handle both Date objects and string dates
            if (formData[key] instanceof Date) {
              dateString = formData[key].toISOString().split("T")[0];
            } else if (typeof formData[key] === "string") {
              // If it's already a string in YYYY-MM-DD format, use it directly
              dateString = formData[key];
            } else {
              // Convert to Date first, then to string
              dateString = new Date(formData[key]).toISOString().split("T")[0];
            }
            formDataToSend.append(key, dateString);
          }
        }
      });

      // Append file fields
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(key, file);
        }
      });

      const response = await providerAPI.registerProvider(formDataToSend);

      toast({
        title: "Success!",
        description: "Your registration was submitted successfully.",
        variant: "default",
      });

      if (response?.provider_id) {
        // Handle success
        toast({
          title: "Success!",
          description: "Your registration was submitted successfully.",
          variant: "default",
        });
      }

      router.push("/service-provider/register/sucess");
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

      const errorMessage =
        validationErrorString !== ""
          ? validationErrorString
          : error.response?.data?.details ||
            error.response?.data?.message ||
            error.message ||
            "Registration failed. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFileInput = (name, label, required = false) => {
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

  const renderReadOnlyField = (label, value) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        disabled
        className="mt-1 p-2 w-full bg-gray-100 border rounded-md"
      />
    </div>
  );

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

  const renderBusinessInfo = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Business Information</h2>

      {renderReadOnlyField("Business Name", formData.business_name)}
      {renderReadOnlyField(
        "Authorized Person",
        formData.authorized_person_name
      )}
      {renderReadOnlyField(
        "Contact Number",
        formData.authorized_person_contact
      )}
      {renderReadOnlyField("Email", formData.email)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInputField(
          "tax_id",
          "Tax Identification Number",
          "Tax Identification Number",
          "text",
          false,
          true
        )}
        {renderInputField(
          "business_registration_number",
          "Business Registration Number",
          "Business Registration Number",
          "text",
          previousRegData.business_registration_number,
          true
        )}
        {renderInputField(
          "whatsapp_number",
          "WhatsApp Number",
          "WhatsApp Number",
          "tel",
          false,
          true
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Business Start Date
        </label>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MuiDatePicker
            label="Select your business start date"
            value={
              formData.business_start_date
                ? dayjs(formData.business_start_date)
                : null
            }
            onChange={(newValue) => {
              handleChange({
                target: {
                  name: "business_start_date",
                  value: newValue ? newValue.format("YYYY-MM-DD") : "",
                },
              });
            }}
            minDate={maxStartDate ? dayjs(maxStartDate) : null}
            maxDate={minStartDate ? dayjs(minStartDate) : dayjs()}
            disabled={
              isReRegistration &&
              !rejectedFields.includes("business_start_date")
            }
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "outlined",
                error: !!errors.business_start_date,
                helperText: errors.business_start_date,
                InputProps: {
                  startAdornment: (
                    <CalendarSearch className="ml-3 mr-2 text-gray-400 h-4 w-4" />
                  ),
                },
                className: "w-full",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#3b82f6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "8px 12px",
                  },
                },
              },
            }}
          />
        </LocalizationProvider>

        {errors.business_start_date && (
          <p className="text-red-500 text-sm mt-1">
            {errors.business_start_date}
          </p>
        )}
      </div>
    </div>
  );

  const renderServiceDetails = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Service Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInputField(
          "service_radius",
          "Service Radius (km)",
          "e.g., 25",
          "number",
          false,
          true
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="exact_address"
          className="block text-sm font-medium text-gray-700"
        >
          Complete Business Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="exact_address"
          name="exact_address"
          value={formData.exact_address}
          disabled={
            isReRegistration && !rejectedFields.includes("exact_address")
          }
          onChange={handleChange}
          placeholder="e.g., Sunrise County, Korrapadu road, Proddatur, Kadapa Dist"
          className={`w-full p-2 border rounded ${
            errors.exact_address
              ? "border-red-500 bg-red-500/5 text-red-500"
              : ""
          }`}
          rows="3"
        />
        {errors.exact_address && (
          <p className="text-red-500 text-sm mt-1">{errors.exact_address}</p>
        )}
      </div>
    </div>
  );

  const renderEmployeeDetails = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Employee Details</h2>

      {formData.employees.map((employee, index) => (
        <div key={index} className="p-4 border rounded space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Employee {index + 1}</h3>
            <p>
              {index + 1} of {formData.employees.length}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor={`employee_name_${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Employee Name <span className="text-red-500">*</span>
              </label>
              <input
                id={`employee_name_${index}`}
                type="text"
                value={employee.name}
                disabled={
                  previousRegData.ServiceProviderEmployees &&
                  !rejectedFields.includes("ServiceProviderEmployees")
                }
                onChange={(e) =>
                  handleEmployeeChange(index, "name", e.target.value)
                }
                placeholder="Employee Name"
                className={`p-2 border rounded w-full ${
                  errors[`employees[${index}].name`]
                    ? "border-red-500 bg-red-500/5 text-red-500"
                    : ""
                }`}
              />
              {errors[`employees.${index}.name`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`employees[${index}].name`]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`employee_gender_${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id={`employee_gender_${index}`}
                value={employee.gender}
                disabled={
                  isReRegistration &&
                  !rejectedFields.includes("ServiceProviderEmployees")
                }
                onChange={(e) =>
                  handleEmployeeChange(index, "gender", e.target.value)
                }
                className={cn("p-2 border rounded w-full h-11", {
                  "border-red-500 bg-red-500/5 text-red-500":
                    errors[`employees[${index}].gender`],
                })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {errors[`employees.${index}.gender`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`employees[${index}].gender`]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`employee_qualification_${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Qualification
              </label>
              <input
                id={`employee_qualification_${index}`}
                type="text"
                disabled={
                  isReRegistration &&
                  !rejectedFields.includes("ServiceProviderEmployees")
                }
                value={employee.qualification}
                onChange={(e) =>
                  handleEmployeeChange(index, "qualification", e.target.value)
                }
                placeholder="e.g., Diploma in Engineering"
                className="p-2 border rounded w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`employee_designation_${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Designation
              </label>
              <input
                id={`employee_designation_${index}`}
                type="text"
                value={employee.designation}
                disabled={
                  isReRegistration &&
                  !rejectedFields.includes("ServiceProviderEmployees")
                }
                onChange={(e) =>
                  handleEmployeeChange(index, "designation", e.target.value)
                }
                placeholder="e.g., Senior Technician"
                className="p-2 border rounded w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`employee_phone_${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                id={`employee_phone_${index}`}
                type="tel"
                disabled={
                  isReRegistration &&
                  !rejectedFields.includes("ServiceProviderEmployees")
                }
                value={employee.phone}
                onChange={(e) =>
                  handleEmployeeChange(index, "phone", e.target.value)
                }
                placeholder="Mobile Number"
                className={`p-2 border rounded w-full ${
                  errors[`employees[${index}].phone`]
                    ? "border-red-500 bg-red-500/5 text-red-500"
                    : ""
                }`}
              />
              {errors[`employees[${index}].phone`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`employees[${index}].phone`]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`employee_email_${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id={`employee_email_${index}`}
                type="email"
                disabled={
                  isReRegistration &&
                  !rejectedFields.includes("ServiceProviderEmployees")
                }
                value={employee.email}
                required
                onChange={(e) =>
                  handleEmployeeChange(index, "email", e.target.value)
                }
                placeholder="Email"
                className={`p-2 border rounded w-full h-11 ${
                  errors[`employees[${index}].email`]
                    ? "border-red-500 bg-red-500/5 text-red-500"
                    : ""
                }`}
              />
              {errors[`employees[${index}].email`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`employees[${index}].email`]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`employee_whatsapp_${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                WhatsApp Number
              </label>
              <input
                id={`employee_whatsapp_${index}`}
                type="tel"
                disabled={
                  isReRegistration &&
                  !rejectedFields.includes("ServiceProviderEmployees")
                }
                value={employee.whatsapp_number}
                onChange={(e) =>
                  handleEmployeeChange(index, "whatsapp_number", e.target.value)
                }
                placeholder="WhatsApp Number"
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
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

      <p className="py-2">
        Supported File Types: PDF, JPG, PNG, doc/docx (2MB max file size for
        each)
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderFileInput(
          "business_registration",
          "Business Registration Document",
          true
        )}
        {renderFileInput("address_proof", "Address Proof", true)}
        {renderFileInput("insurance", "Employee Insurance Documents")}
        {renderFileInput("terms_acceptance", "Signed Terms & Conditions", true)}
        {renderFileInput("agreement", "Signed Service Agreement", true)}
        {renderFileInput("logo", "Business Logo")}
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
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              onChange={handleChange}
              placeholder="e.g., john@paytm or 9876543210@upi"
              className={`w-full p-2 border rounded ${
                errors["payment_details.upi.id"]
                  ? "border-red-500 bg-red-500/5 text-red-500"
                  : ""
              }`}
            />
            {errors["payment_details.upi.id"] && (
              <p className="text-red-500 text-sm mt-1">
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
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              onChange={handleChange}
              placeholder="e.g., John Doe"
              className={`w-full p-2 border rounded ${
                errors["payment_details.upi.display_name"]
                  ? "border-red-500 bg-red-500/5 text-red-500"
                  : ""
              }`}
            />
            {errors["payment_details.upi.display_name"] && (
              <p className="text-red-500 text-sm mt-1">
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
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              onChange={handleChange}
              placeholder="e.g., 9876543210"
              className={`w-full p-2 border rounded ${
                errors["payment_details.upi.phone"]
                  ? "border-red-500 bg-red-500/5 text-red-500"
                  : ""
              }`}
            />
            {errors["payment_details.upi.phone"] && (
              <p className="text-red-500 text-sm mt-1">
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
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              onChange={handleChange}
              placeholder="e.g., Commercial Bank of Ceylon"
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.name"]
                  ? "border-red-500 bg-red-500/5 text-red-500"
                  : ""
              }`}
            />
            {errors["payment_details.bank.name"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["payment_details.bank.name"]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="bank_branch"
              className="block text-sm font-medium text-gray-700"
            >
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              id="bank_branch"
              type="text"
              name="payment_details.bank.branch"
              value={formData.payment_details.bank.branch}
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              onChange={handleChange}
              placeholder="e.g., Colombo 03 Branch"
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.branch"]
                  ? "border-red-500 bg-red-500/5 text-red-500"
                  : ""
              }`}
            />
            {errors["payment_details.bank.branch"] && (
              <p className="text-red-500 text-sm mt-1">
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
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              onChange={handleChange}
              placeholder="e.g., COMB0230001"
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.ifsc"]
                  ? "border-red-500 bg-red-500/5 text-red-500"
                  : ""
              }`}
            />
            {errors["payment_details.bank.ifsc"] && (
              <p className="text-red-500 text-sm mt-1">
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
              disabled={
                isReRegistration && !rejectedFields.includes("payment_details")
              }
              onChange={handleChange}
              placeholder="e.g., 8001234567890"
              className={`w-full p-2 border rounded ${
                errors["payment_details.bank.account_number"]
                  ? "border-red-500 text-red-500 bg-red-500/5"
                  : ""
              }`}
            />
            {errors["payment_details.bank.account_number"] && (
              <p className="text-red-500 text-sm mt-1">
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
        return renderBusinessInfo();
      case 2:
        return renderServiceDetails();
      case 3:
        return renderEmployeeDetails();
      case 4:
        return renderDocuments();
      case 5:
        return renderPaymentDetails();
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      <span className="text-xl font-bold">
        Complete Your Business Registration
      </span>

      <div>
        {loading && (
          <LoadingScreen message={"Registration Application Submitting...."} />
        )}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-1/5 h-2 mx-1 rounded ${
                step >= i ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {renderStep()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Previous
              </button>
            )}
            {step < 5 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
              >
                Next
              </button>
            )}

            {step === 5 && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 ml-auto"
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

export default BusinessRegistrationForm;
