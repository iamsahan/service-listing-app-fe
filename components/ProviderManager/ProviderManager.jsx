"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { providerAPI } from "@/api/provider";
import {
  AlertCircle,
  CheckCircle,
  PenBoxIcon,
  XCircle,
  MapPin,
  Lock,
  Unlock,
  ShoppingBag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProviderDetails from "@components/ProviderDetails";
import ProviderDocuments from "./ProviderDocuments";
import ProviderLocationEditor from "./ProviderLocationEditor";
import ProviderServicesDialog from "./ProviderServicesDialog";
import Modal from "react-modal";
import { toast } from "@hooks/use-toast";
import Select from "react-select";
import TableActionsMenu from "../menus/TableActionsMenu";
import CopyToClipboard from "../CopyToClipboard";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "../ui/select";
import { serviceAPI } from "@/api/services";
import { Label } from "../ui/label";
import DisableProviderDialog from "./DisableProviderDialog";
import { ProviderBookings } from "../admin/ProviderBookings";

// Rejectable fields
const individualRejectableFields = [
  { value: "aadhar_number", label: "Aadhar Number" },
  { value: "aadhar", label: "Aadhar Card" },
  { value: "pan_number", label: "PAN Number" },
  { value: "pan", label: "PAN Card" },
  { value: "id_proof", label: "ID Proof" },
  { value: "address_proof", label: "Address Proof" },
  { value: "qualification_proof", label: "Qualification Proof" },
  { value: "service_certificate", label: "Service Certificates" },
  { value: "insurance", label: "Insurance Documents" },
  { value: "agreement", label: "Signed Agreement" },
  { value: "terms_acceptance", label: "Signed Terms & Conditions" },
  { value: "logo", label: "Business Logo" },
  { value: "business_registration", label: "Business Registration Document" },
  { value: "payment_details", label: "Payment Details" },
  { value: "nationality", label: "Nationality" },
  { value: "phone", label: "Phone Number" },
  { value: "languages_spoken", label: "Languages Spoken" },
  { value: "whatsapp_number", label: "WhatsApp Number" },
  { value: "alternate_number", label: "Alternate Number" },
  { value: "exact_address", label: "Business Address" },
  { value: "availability_hours", label: "Availability Hours" },
  { value: "specializations", label: "Specializations" },
  { value: "profile_bio", label: "Profile Bio" },
  { value: "qualifications", label: "Qualifications" },
];

const businessRejectableFields = [
  { value: "tax_id", label: "Tax Identification Number" },
  {
    value: "business_registration_number",
    label: "Business Registration Number",
  },
  { value: "whatsapp_number", label: "WhatsApp Number" },
  { value: "business_start_date", label: "Business Start Date" },
  { value: "service_radius", label: "Service Radius" },
  { value: "exact_address", label: "Business Address" },
  { value: "ServiceProviderEmployees", label: "Service Employee Details" },
  { value: "payment_details", label: "Payment Details" },
  { value: "business_registration", label: "Business Registration Document" },
  { value: "address_proof", label: "Address Proof" },
  { value: "insurance", label: "Employee Insurance Documents" },
  { value: "agreement", label: "Signed Agreement" },
  { value: "terms_acceptance", label: "Signed Terms & Conditions" },
  { value: "logo", label: "Business Logo" },
];

const getDisplayValue = (value, defaultValue = "N/A") => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : defaultValue;
  }
  return value || defaultValue;
};

const ProviderManager = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDocDialogOpen, setDocIsDialogOpen] = useState(false);
  const [isDisableDialogOpen, setDisableDialogOpen] = useState(false);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");
  const [sortDate, setSortDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [tabValue, setTabValue] = useState("pending_approval");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectingProvider, setRejectingProvider] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveProvider, setApproveProvider] = useState({
    providerId: null,
    status: null,
  });
  const [showBookings, setShowBookings] = useState(false);
  // Rejected fields
  const [rejectedFields, setRejectedFields] = useState([]);
  const [registrationLink, setRegistrationLink] = useState(null);
  const [accountUpdateLinks, setAccountUpdateLinks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceCityOptions, setServiceCityOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [filters, setFilters] = useState({
    limit: 10,
    city: "all",
    category: "all",
    search: "",
    status: "pending_approval",
    startDate: "",
    endDate: "",
    createdWithin: "",
  });

  useEffect(() => {
    let intervalId;

    const runInitialFetch = () => {
      fetchProviders();

      if (!serviceCityOptions.length) {
        fetchCities();
      }

      if (!categoryOptions.length) {
        fetchCategories();
      }
    };

    runInitialFetch();

    intervalId = setInterval(() => {
      fetchProviders();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, [isDialogOpen, isDocDialogOpen, isApproving, filters, currentPage]);

  const handleReject = async () => {
    if (!rejectionReason) {
      toast({
        title: "Please enter a rejection reason.",
        variant: "destructive",
      });
      return;
    }

    if (rejectedFields.length === 0) {
      toast({
        title: "Please select at least one rejected field.",
        variant: "destructive",
      });
      return;
    }

    try {
      await handleStatusUpdate(
        rejectingProvider.provider_id,
        "rejected",
        rejectionReason,
        rejectedFields,
      );
    } catch (error) {
      console.error("Error rejecting provider:", error);
    }
  };

  const openConfirmModal = (providerId, status) => {
    setApproveProvider({ providerId, status });
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
  };

  const closeRejectModal = () => {
    setIsRejectDialogOpen(false);
    setRejectionReason("");
    setRejectingProvider(null);
    setRejectedFields([]);
  };

  const handleShowBookings = (provider) => {
    setSelectedProvider(provider);
    setShowBookings(true);
  };

  const handleHideBookings = () => {
    setSelectedProvider(null);
    setShowBookings(false);
  };

  const fetchProviders = async () => {
    try {
      const response = await providerAPI.getProviders(filters, currentPage);
      const { providers, totalPages } = response.data;
      const formattedProviders = providers.map((provider) => ({
        ...provider,
        languages_spoken: Array.isArray(provider.languages_spoken)
          ? provider.languages_spoken
          : [],
        specializations: Array.isArray(provider.specializations)
          ? provider.specializations
          : [],
        business_name: String(provider.business_name || ""),
        business_type: String(provider.business_type || ""),
        years_experience: Number(provider.years_experience || 0),
        status: String(provider.status || "pending_approval"),
      }));

      setTotalPages(totalPages);
      setProviders(formattedProviders);
      setFilteredProviders(formattedProviders);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await serviceAPI.getCities();
      const cityOptions = response.data.map((city) => ({
        value: city.city_id,
        label: city.name,
      }));
      setServiceCityOptions(cityOptions);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setError("Failed to load service cities");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await serviceAPI.getAllCategories();
      const categoryOptions = response.data.map((category) => ({
        value: category.category_id,
        label: category.name,
      }));
      setCategoryOptions(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load service categories");
    }
  };

  const handleStatusUpdate = async (
    providerId,
    newStatus,
    rejectionReason = null,
    rejectedFields = [],
    providerType = null,
  ) => {
    try {
      setIsApproving(true);
      const updateData = {
        status: newStatus,
      };

      if (newStatus === "rejected") {
        if (!rejectionReason) {
          setRejectingProvider({
            provider_id: providerId,
            provider_type: providerType,
          });
          setIsRejectDialogOpen(true);
          return;
        }

        updateData.rejection_reason = rejectionReason;

        // Add rejected fields
        if (rejectedFields.length > 0) {
          updateData.rejected_fields = rejectedFields;
        }
      }

      await providerAPI.updateProvider(providerId, updateData).then((res) => {
        if (res.data.registration_link) {
          setRegistrationLink(res.data.registration_link);
        }

        if (res.data.password_links) {
          setAccountUpdateLinks(res.data.password_links);
        }
      });

      const updatedProviders = providers.map((provider) =>
        provider.provider_id === providerId
          ? {
              ...provider,
              status: newStatus,
              ...(newStatus === "rejected"
                ? { rejection_reason: rejectionReason }
                : {}),
            }
          : provider,
      );

      setProviders(updatedProviders);
      setFilteredProviders(updatedProviders);

      if (newStatus === "rejected") {
        setRejectionReason("");
        setRejectingProvider(null);
      }

      toast({
        title: "Success!",
        description: "Service Provider Updated Sucessfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating provider status:", error);
      toast({
        title: "Error",
        description: "Failed to update provider status!",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    // Filter by business type
    if (businessTypeFilter) {
      filtered = filtered.filter(
        (provider) => provider.business_type === businessTypeFilter,
      );
    }

    // Filter by date
    if (selectedDate) {
      const selectedDateString = new Date(selectedDate).toLocaleDateString();
      filtered = filtered.filter(
        (provider) =>
          new Date(provider.created_at).toLocaleDateString() ===
          selectedDateString,
      );
    }

    // Sort by date
    if (sortDate) {
      filtered = filtered.slice().sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortDate === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    setFilteredProviders(filtered);
  };

  const handleUpdateProvider = (updatedProvider) => {
    console.log("Updated", updatedProvider);
    setFilteredProviders((prevProviders) =>
      prevProviders.map((provider) =>
        provider.provider_id === updatedProvider.provider_id
          ? { ...updatedProvider }
          : provider,
      ),
    );
  };

  const handleDeleteProvider = async (provider) => {
    try {
      await providerAPI.deleteProvider(provider.provider_id);

      setFilteredProviders((prevProviders) =>
        prevProviders.filter(
          (provider) => provider.provider_id !== provider.provider_id,
        ),
      );

      toast({
        title: "Success!",
        description: "Provider deleted successfully!",
        variant: "default",
      });

      console.log("Deleted", provider);

      fetchProviders();
    } catch (error) {
      console.error("Error deleting provider:", error);

      toast({
        title: "Error",
        description: "Failed to delete provider!",
        variant: "destructive",
      });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleLocationUpdate = (updatedProvider) => {
    if (!selectedProvider) return;

    // Update the provider in the local state
    setProviders((prevProviders) =>
      prevProviders.map((provider) =>
        provider.provider_id === selectedProvider.provider_id
          ? {
              ...provider,
              exact_address: updatedProvider.exact_address,
              primary_location: updatedProvider.primary_location,
              service_radius: updatedProvider.service_radius,
            }
          : provider,
      ),
    );

    setIsLocationDialogOpen(false);
    fetchProviders(); // Refresh the list to ensure data consistency
  };

  useEffect(() => {
    filterProviders();
  }, [businessTypeFilter, sortDate, selectedDate, providers]);

  return (
    <div className="p-6">
      {/* Status Tab Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <Tabs
          value={tabValue}
          onValueChange={(value) => {
            setTabValue(value);
            setFilters({ ...filters, status: value });
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger
              value="pending_approval"
              className="text-base font-medium data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              Pending Approval
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="text-base font-medium data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="text-base font-medium data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search and Filter Options */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        {/* Row 1: Category, Search, Business Type, City */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <ShadSelect
              value={filters.category}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>

                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </ShadSelect>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Provider
            </label>
            <input
              type="text"
              placeholder="Search by provider name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <ShadSelect
              value={filters.city}
              onValueChange={(value) => setFilters({ ...filters, city: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>

                {serviceCityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </ShadSelect>
          </div>
        </div>

        {/* Row 2: Date Filters and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created Within
            </label>
            <ShadSelect
              value={filters.createdWithin}
              onValueChange={(value) => {
                setFilters({
                  ...filters,
                  createdWithin: value,
                  startDate: "",
                  endDate: "",
                });
                setSelectedDate("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3">Last 3 Months</SelectItem>
                <SelectItem value="last6">Last 6 Months</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </ShadSelect>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  startDate: e.target.value,
                  createdWithin: "",
                });
                setSelectedDate("");
              }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  endDate: e.target.value,
                  createdWithin: "",
                });
                setSelectedDate("");
              }}
              min={filters.startDate}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setFilters({
                  ...filters,
                  createdWithin: "",
                  startDate: "",
                  endDate: "",
                });
              }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actions
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => setSortDate(sortDate === "asc" ? "desc" : "asc")}
                variant="outline"
                className="flex-1"
              >
                Sort {sortDate === "asc" ? "↑" : "↓"}
              </Button>
              <Button
                onClick={() => {
                  setFilters({
                    ...filters,
                    startDate: "",
                    endDate: "",
                    createdWithin: "",
                  });
                  setSelectedDate("");
                }}
                variant="outline"
                className="flex-1"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                {tabValue !== "rejected" && <TableHead>Status</TableHead>}
                <TableHead>Joined Date</TableHead>
                {tabValue === "active" && <TableHead>Booking Count</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProviders.length ? (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.provider_id}>
                    <TableCell>
                      {getDisplayValue(provider?.User.name)}
                    </TableCell>
                    <TableCell>
                      {getDisplayValue(provider?.User.mobile)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {getDisplayValue(provider.business_type)}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2 flex-wrap max-w-[300px]">
                        {provider.serviceCategories?.map((category) => (
                          <span
                            key={category.category_id}
                            className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 whitespace-nowrap"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    {tabValue !== "rejected" && (
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-sm capitalize ${
                            provider?.User?.account_status === "active"
                              ? "bg-green-100 text-green-800"
                              : provider?.User?.account_status === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {provider?.User?.account_status}
                        </span>
                      </TableCell>
                    )}

                    <TableCell>
                      {provider.created_at
                        ? new Date(provider.created_at).toLocaleDateString()
                        : ""}
                    </TableCell>

                    {tabValue === "active" && (
                      <TableCell
                        onClick={() => handleShowBookings(provider)}
                        className="cursor-pointer hover:underline"
                      >
                        {provider.User?.booking_count || 0}
                      </TableCell>
                    )}

                    <TableCell className="w-56">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setDocIsDialogOpen(true);
                          }}
                        >
                          Docs
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setIsDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setIsLocationDialogOpen(true);
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Location
                        </Button>

                        {provider.status === "active" && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedProvider(provider);
                              setIsServicesDialogOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ShoppingBag className="h-4 w-4 mr-1" />
                            Services
                          </Button>
                        )}

                        {["active", "suspended"].includes(provider.status) && (
                          <Button
                            variant={
                              provider.is_disabled ? "default" : "destructive"
                            }
                            onClick={() => {
                              setSelectedProvider(provider);
                              setDisableDialogOpen(true);
                            }}
                          >
                            {provider.is_disabled ? (
                              <>
                                <Unlock />
                                Remove Sanction
                              </>
                            ) : (
                              <>
                                <Lock />
                                Sanction
                              </>
                            )}
                          </Button>
                        )}

                        {provider.status === "pending_approval" && (
                          <>
                            <Button
                              variant="default"
                              onClick={() =>
                                openConfirmModal(provider.provider_id, "active")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleStatusUpdate(
                                  provider.provider_id,
                                  "rejected",
                                  null,
                                  [],
                                  provider.business_type,
                                )
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <TableActionsMenu
                        moduleName="provider"
                        onConfirm={() => handleDeleteProvider(provider)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No providers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between mt-5">
            <div className="flex items-center">
              <Label>Page Size:</Label>
              <ShadSelect
                value={String(filters.limit)}
                onValueChange={(e) =>
                  setFilters({ ...filters, limit: Number(e) })
                }
              >
                <SelectTrigger className="w-16 border-none font-semibold">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </ShadSelect>
            </div>

            <div className="flex gap-5">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
              >
                Previous
              </Button>

              <span className="self-center">{`Page ${currentPage} of ${totalPages}`}</span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDocDialogOpen} onOpenChange={setDocIsDialogOpen}>
        <DialogContent className="max-w-7xl justify-center items-center">
          <DialogHeader>
            <div className="flex gap-10">
              <DialogTitle className="font-bold text-center justify-center text-3xl">
                Provider Documents
              </DialogTitle>
            </div>
          </DialogHeader>
          {selectedProvider && (
            <ProviderDocuments
              provider={selectedProvider}
              onCloseDialog={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex gap-10">
              <DialogTitle className="font-bold text-3xl">
                Provider Details
              </DialogTitle>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <PenBoxIcon />
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedProvider && (
            <ProviderDetails
              provider={selectedProvider}
              isEditing={isEditing}
              onCloseDialog={() => {
                setIsDialogOpen(false);
                setIsEditing(false);
              }}
              onUpdateProvider={handleUpdateProvider}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Location Change Modal */}
      <Modal
        isOpen={isLocationDialogOpen}
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto"
        overlayClassName="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Change Provider Location
              </h2>
              <p className="text-gray-600">
                Update address and service area for provider
              </p>
            </div>
          </div>

          {selectedProvider && (
            <ProviderLocationEditor
              provider={selectedProvider}
              onLocationUpdate={handleLocationUpdate}
              onCancel={() => setIsLocationDialogOpen(false)}
              countryRestriction="in"
              countryName="India"
            />
          )}
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectDialogOpen}
        onRequestClose={closeRejectModal}
        ariaHideApp={false}
        className="m-10 bg-white p-8 rounded-lg shadow-xl w-96 max-w-lg"
        overlayClassName="fixed inset-0 flex justify-center items-center bg-opacity-50 bg-black backdrop-blur-xs"
      >
        {registrationLink ? (
          <div className="space-y-4">
            <p className="font-semibold">Registration link:</p>
            <CopyToClipboard value={registrationLink} />

            <Button
              type="button"
              className="w-full"
              onClick={closeRejectModal}
              disabled={isApproving}
            >
              Dismiss
            </Button>
          </div>
        ) : (
          <div className="space-y-4 z-50">
            <p className="text-lg font-semibold">
              Reject Provider Registration
            </p>

            <Select
              isMulti
              placeholder="Select rejected fields"
              value={rejectedFields}
              onChange={setRejectedFields}
              options={
                rejectingProvider?.provider_type === "individual"
                  ? individualRejectableFields
                  : businessRejectableFields
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rejection Reason
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border p-2 shadow-sm"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeRejectModal}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={
                  !rejectionReason.trim() ||
                  rejectedFields.length === 0 ||
                  isApproving
                }
              >
                {isApproving ? "Rejecting..." : "Reject Registration "}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onRequestClose={closeConfirmModal}
        ariaHideApp={false}
        className="m-10 bg-white p-8 rounded-lg shadow-xl w-96 max-w-lg"
        overlayClassName="fixed inset-0 flex justify-center items-center bg-opacity-50 bg-black backdrop-blur-xs"
      >
        {accountUpdateLinks && accountUpdateLinks.length ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="font-semibold text-xl">
                Continue with Account Setup
              </p>
              <p className="text-sm">
                Use following links to continue with user account setup.
              </p>
            </div>

            {accountUpdateLinks.map((item, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm capitalize">
                  {item.type}: {item.name}
                </p>
                <CopyToClipboard value={item.link} />
              </div>
            ))}

            <Button
              type="button"
              className="w-full"
              onClick={closeConfirmModal}
              disabled={isApproving}
            >
              Dismiss
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Are you sure you want to approve this provider?</p>
            <div className="flex space-x-4">
              <Button
                className="flex-1"
                onClick={() =>
                  handleStatusUpdate(
                    approveProvider.providerId,
                    approveProvider.status,
                  )
                }
                disabled={isApproving}
              >
                {isApproving ? "Approving..." : "Confirm"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={closeConfirmModal}
                disabled={isApproving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {selectedProvider && (
        <DisableProviderDialog
          provider={selectedProvider}
          open={isDisableDialogOpen}
          onOpenChange={setDisableDialogOpen}
          onToggleComplete={fetchProviders}
        />
      )}

      {/* Provider Services Dialog */}
      {selectedProvider && (
        <ProviderServicesDialog
          open={isServicesDialogOpen}
          onOpenChange={setIsServicesDialogOpen}
          providerId={selectedProvider.provider_id}
        />
      )}

      <ProviderBookings
        open={showBookings}
        providerId={selectedProvider?.provider_id}
        onClose={handleHideBookings}
      />
    </div>
  );
};

export default ProviderManager;
