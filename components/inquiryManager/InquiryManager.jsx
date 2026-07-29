"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Modal from "react-modal";
import { Card, CardContent } from "@/components/ui/card";
import { providerAPI } from "@api/provider";
import InquiryPopup from "@components/popups/InquiryPopup";
import { toast } from "@hooks/use-toast";
import TableActionsMenu from "../menus/TableActionsMenu";
import CopyToClipboard from "../CopyToClipboard";
import { serviceAPI } from "@/api/services";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "../ui/select";
import { Label } from "../ui/label";
import DatePicker from "../DatePicker";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const InquiryManager = () => {
  const [inquirys, setInqirys] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");
  const [sortDate, setSortDate] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [registrationLink, setRegistrationLink] = useState();
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratedLink, setRegeneratedLink] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceCityOptions, setServiceCityOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [filters, setFilters] = useState({
    limit: 10,
    city: "all",
    category: "all",
    date: null,
    search: "",
    createdWithin: "",
    startDate: "",
    endDate: "",
  });

  const handleOpenModal = (inquiry) => {
    setIsOpen(true);
    setSelectedInquiry(inquiry);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const openConfirmModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setRegistrationLink("");
  };

  const openRejectModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectReason("");
  };

  const fetchInquirys = async () => {
    try {
      // Clean up filters - remove "all" values and null/empty values
      const cleanFilters = {};

      if (filters.limit) cleanFilters.limit = filters.limit;
      if (filters.city && filters.city !== "all")
        cleanFilters.city = filters.city;
      if (filters.category && filters.category !== "all")
        cleanFilters.category = filters.category;
      if (filters.date) cleanFilters.date = filters.date;
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.createdWithin)
        cleanFilters.createdWithin = filters.createdWithin;
      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;

      // Add status filter based on tab
      if (tabIndex === 0) {
        cleanFilters.status = "pending";
      } else if (tabIndex === 1) {
        cleanFilters.status = "approved";
      } else if (tabIndex === 2) {
        cleanFilters.status = "rejected";
      }

      const res = await providerAPI.getEnquiry(cleanFilters, currentPage);
      const { inquiries, totalPages } = res.data;
      setTotalPages(totalPages);
      setInqirys(inquiries);
      setFilteredInquiries(inquiries);
    } catch (error) {
      console.error("error fetching inquiries", error);
    }
  };

  const fetchSingleInquiry = async (inquiryId) => {
    try {
      const res = await providerAPI.getEnquiryById(inquiryId);
      const updatedInquiry = res.data;

      // Update the inquiry in the list
      setInqirys((prevInquiries) =>
        prevInquiries.map((inquiry) =>
          inquiry.enquiry_id === inquiryId ? updatedInquiry : inquiry
        )
      );

      // Update filtered inquiries as well
      setFilteredInquiries((prevFiltered) =>
        prevFiltered.map((inquiry) =>
          inquiry.enquiry_id === inquiryId ? updatedInquiry : inquiry
        )
      );

      return updatedInquiry;
    } catch (error) {
      console.error("Error fetching single inquiry:", error);
      return null;
    }
  };

  useEffect(() => {
    let intervalId;

    // Initial fetch
    fetchInquirys();
    if (!serviceCityOptions.length) fetchCities();
    if (!categoryOptions.length) fetchCategories();

    // Poll every 5 minutes
    intervalId = setInterval(() => {
      fetchInquirys();
    }, 300000);

    return () => {
      clearInterval(intervalId);
    };
  }, [filters, currentPage, tabIndex]);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await providerAPI
        .approveEnquiry(selectedInquiry.enquiry_id)
        .then((res) => setRegistrationLink(res.data.registration_link));

      const updatedInquiries = inquirys.map((item) =>
        item.enquiry_id === selectedInquiry.enquiry_id
          ? { ...item, status: "approved" }
          : item
      );

      setInqirys(updatedInquiries);
      toast({
        title: "Success!",
        description: "Service Provider Inquiry Approved Sucessfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("error in inquiry approve", error);
      toast({
        title: "Error",
        description: "Failed to approve Inquiry!",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const filterInquiries = () => {
    let filtered = inquirys;

    // Status filtering is now done on backend, no need to filter here

    if (businessTypeFilter) {
      filtered = filtered?.filter(
        (inquiry) => inquiry.business_type === businessTypeFilter
      );
    }

    if (filters.search) {
      filtered = filtered?.filter((inquiry) =>
        inquiry.User?.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (sortDate === "asc") {
      filtered = filtered?.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (sortDate === "desc") {
      filtered = filtered?.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    setFilteredInquiries(filtered);
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

  useEffect(() => {
    filterInquiries();
  }, [businessTypeFilter, sortDate, inquirys, filters.search]);

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter a rejection reason!",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRejecting(true);
      await providerAPI.rejectEnquiry(selectedInquiry.enquiry_id, {
        reason: rejectReason,
      });
      const updatedInquiries = inquirys.map((item) =>
        item.enquiry_id === selectedInquiry.enquiry_id
          ? { ...item, status: "rejected" }
          : item
      );
      setInqirys(updatedInquiries);
      closeRejectModal();
      toast({
        title: "Success!",
        description: "Inquiry rejected successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error rejecting inquiry", error);
      toast({
        title: "Error",
        description: "Failed to reject inquiry!",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const openRegenerateModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setRegenerateModalOpen(true);
  };

  const closeRegenerateModal = () => {
    setRegenerateModalOpen(false);
    setRegeneratedLink("");
  };

  const handleRegenerateLink = async () => {
    try {
      setIsRegenerating(true);
      const response = await providerAPI.regenerateEnquiryLink(
        selectedInquiry.enquiry_id
      );
      setRegeneratedLink(response.data.registration_link);

      // Fetch updated inquiry data to ensure UI consistency
      const updatedInquiry = await fetchSingleInquiry(
        selectedInquiry.enquiry_id
      );

      if (updatedInquiry) {
        console.log("Inquiry data updated with new registration link");
      }

      toast({
        title: "Success!",
        description: "Registration link regenerated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error regenerating link", error);
      toast({
        title: "Error",
        description: "Failed to regenerate registration link!",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteInquiry = async (inquiry) => {
    try {
      await providerAPI.deleteEnquiry(inquiry.enquiry_id);

      const updatedInquiries = inquirys.filter(
        (item) => item.enquiry_id !== inquiry.enquiry_id
      );

      setInqirys(updatedInquiries);

      toast({
        title: "Success!",
        description: "Inquiry deleted successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting inquiry", error);
      toast({
        title: "Error",
        description: "Failed to delete inquiry!",
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

  return (
    <div className="p-6">
      {/* Status Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <Tabs
          value={tabIndex}
          onValueChange={(value) => {
            setTabIndex(value);
            setCurrentPage(1);
          }}
        >
          <TabsList className="grid grid-cols-3 h-14 w-full">
            <TabsTrigger
              value={0}
              className="text-base font-medium data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
            >
              <Clock className="w-5 h-5 mr-2" />
              Pending Approval
            </TabsTrigger>
            <TabsTrigger
              value={1}
              className="text-base font-medium data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger
              value={2}
              className="text-base font-medium data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search and Filter Options */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-6">
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
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All Categories" />
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
              Search Inquiry
            </label>
            <input
              type="text"
              placeholder="Search by provider name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <ShadSelect
              value={businessTypeFilter || "all"}
              onValueChange={(value) =>
                setBusinessTypeFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </ShadSelect>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <ShadSelect
              value={filters.city}
              onValueChange={(value) => setFilters({ ...filters, city: value })}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All Cities" />
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
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  createdWithin: value,
                  startDate: "",
                  endDate: "",
                  date: null,
                })
              }
            >
              <SelectTrigger className="w-full h-10">
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
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value,
                  createdWithin: "",
                  date: null,
                })
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  endDate: e.target.value,
                  createdWithin: "",
                  date: null,
                })
              }
              min={filters.startDate}
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Date
            </label>
            <input
              type="date"
              value={
                filters.date
                  ? new Date(filters.date).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  date: e.target.value ? new Date(e.target.value) : null,
                  createdWithin: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="flex-1 h-10"
              >
                Sort {sortDate === "asc" ? "↓" : "↑"}
              </Button>
              <Button
                onClick={() =>
                  setFilters({
                    ...filters,
                    startDate: "",
                    endDate: "",
                    createdWithin: "",
                    date: null,
                  })
                }
                variant="outline"
                className="flex-1 h-10"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <CardContent>
          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                {tabIndex !== 2 && <TableHead>Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries?.map((inquiry) => (
                <TableRow key={inquiry.enquiry_id}>
                  <TableCell>{inquiry.User.name}</TableCell>
                  <TableCell>
                    {inquiry.User.role === "business_service_provider"
                      ? "Business-SP"
                      : inquiry.User.role === "service_provider"
                      ? "Individual"
                      : "Employee"}
                  </TableCell>
                  <TableCell>{inquiry.business_type}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap max-w-[300px]">
                      {inquiry.ServiceCategories?.map((category) => (
                        <span
                          key={category.category_id}
                          className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 whitespace-nowrap"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </TableCell>
                  {tabIndex !== 2 && (
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full 
                ${
                  inquiry.status === "approved"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
                      >
                        {inquiry.status}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="text-right w-56">
                    <div className="flex justify-end gap-2">
                      <>
                        {inquiry.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              onClick={() => handleOpenModal(inquiry)}
                            >
                              View Details
                            </Button>
                            <Button
                              onClick={() => openConfirmModal(inquiry)}
                              variant="outline"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => openRejectModal(inquiry)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {inquiry.status === "approved" && (
                          <>
                            <Button
                              variant="default"
                              onClick={() => handleOpenModal(inquiry)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => openRegenerateModal(inquiry)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                            >
                              Regenerate Reg Link
                            </Button>
                          </>
                        )}
                      </>
                    </div>
                  </TableCell>

                  <TableCell>
                    <TableActionsMenu
                      moduleName="inquiry"
                      onConfirm={() => handleDeleteInquiry(inquiry)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between mt-5 mb-2 px-4">
            <div className="flex items-center">
              <Label>Page Size:</Label>
              <ShadSelect
                value={String(filters.limit)}
                onValueChange={(e) => {
                  setFilters({ ...filters, limit: Number(e) });
                  setCurrentPage(1);
                }}
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

        {/* Confirm Modal */}
        <Modal
          isOpen={confirmModalOpen}
          onRequestClose={closeConfirmModal}
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
                onClick={closeConfirmModal}
                disabled={isApproving}
              >
                Dismiss
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Are you sure you want to approve this inquiry?</p>

              <div className="flex space-x-4">
                <Button
                  className="flex-1"
                  onClick={handleApprove}
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

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          onRequestClose={handleCloseModal}
          ariaHideApp={false}
          contentLabel="Service Description"
          className="m-10 bg-white p-16 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out w-3/4 max-w-3xl max-h-[80vh] overflow-y-auto flex flex-col items-center"
          overlayClassName="fixed inset-0 flex justify-center items-center bg-opacity-50 bg-black backdrop-blur-xs"
        >
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>

          <InquiryPopup inquiry={selectedInquiry} />
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onRequestClose={closeRejectModal}
          ariaHideApp={false}
          className="m-10 bg-white p-8 rounded-lg shadow-xl w-96 max-w-lg"
          overlayClassName="fixed inset-0 flex justify-center items-center bg-opacity-50 bg-black backdrop-blur-xs"
        >
          <div className="space-y-4">
            <p>Enter a reason for rejecting this inquiry:</p>

            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex space-x-4">
              <Button
                className="flex-1"
                onClick={handleReject}
                disabled={isRejecting}
              >
                {isRejecting ? "Rejecting..." : "Confirm"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={closeRejectModal}
                disabled={isRejecting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Regenerate Link Modal */}
        <Modal
          isOpen={regenerateModalOpen}
          onRequestClose={closeRegenerateModal}
          ariaHideApp={false}
          className="m-10 bg-white p-8 rounded-lg shadow-xl w-96 max-w-lg"
          overlayClassName="fixed inset-0 flex justify-center items-center bg-opacity-50 bg-black backdrop-blur-xs"
        >
          {regeneratedLink ? (
            <div className="space-y-4">
              <p className="font-semibold">New Registration Link:</p>
              <CopyToClipboard value={regeneratedLink} />

              <Button
                type="button"
                className="w-full"
                onClick={closeRegenerateModal}
              >
                Dismiss
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                Are you sure you want to regenerate the registration link for
                this inquiry?
              </p>
              <p className="text-sm text-gray-600">
                This will invalidate the previous link.
              </p>

              <div className="flex space-x-4">
                <Button
                  className="flex-1"
                  onClick={handleRegenerateLink}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? "Regenerating..." : "Confirm"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeRegenerateModal}
                  disabled={isRegenerating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default InquiryManager;
