"use client";
import { profileAPI } from "@/api/profile";
import { reportAPI } from "@/api/reportService";
import React, { useEffect, useState } from "react";
import withAdminAuth from "@/components/withAdminAuth";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { adminBookingService } from "@/api/adminBookingService";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import CustomerView from "@/components/admin/CustomerView";
import UpdateCustomerForm from "@/components/admin/UpdateCustomerForm";
import { toast } from "@/hooks/use-toast";
import { serviceAPI } from "@/api/services";
import {
  Eye,
  Edit,
  FileText,
  Download,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import DatePicker from "@/components/DatePicker";
import DeleteCustomerDialog from "@/components/admin/DeleteCustomerDialog";
import { CustomerBookings } from "@/components/admin/CustomerBookings";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const CustomersPage = () => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [showCustomerView, setShowCustomerView] = useState(false);
  const [showCustomerBookings, setShowCustomerBookings] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [customerToUpdate, setCustomerToUpdate] = useState(null);
  const [status, setStatus] = useState(""); // For status change dialog
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [customerToSettle, setCustomerToSettle] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceCityOptions, setServiceCityOptions] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    city: "all",
    format: "pdf",
    search: "",
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [filters, setFilters] = useState({
    limit: 10,
    status: "all",
    city: "all",
    date: null,
    search: "",
    startDate: "",
    endDate: "",
    createdWithin: "",
  });

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchAllCustomers();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchAllCustomers();
    if (!serviceCityOptions?.length) fetchCities();
  }, [
    currentPage,
    filters.status,
    filters.city,
    filters.date,
    filters.limit,
    filters.startDate,
    filters.endDate,
    filters.createdWithin,
  ]);

  const fetchCities = async () => {
    try {
      const response = await serviceAPI.getCities();
      const cityOptions = response.data.map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setServiceCityOptions(cityOptions);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setError("Failed to load service cities");
    }
  };

  const fetchAllCustomers = async () => {
    try {
      // Prepare filters for API - only send non-empty values
      const apiFilters = {
        limit: filters.limit,
        page: currentPage,
      };

      // Add search if present
      if (filters.search && filters.search.trim() !== "") {
        apiFilters.search = filters.search.trim();
      }

      // Add status if not "all"
      if (filters.status && filters.status !== "all") {
        apiFilters.status = filters.status;
      }

      // Add city if not "all"
      if (filters.city && filters.city !== "all") {
        apiFilters.city = filters.city;
      }

      // Add date if present
      if (filters.date) {
        apiFilters.date = filters.date;
      }

      // Add custom date range if present (priority over single date)
      if (filters.startDate && filters.endDate) {
        apiFilters.startDate = filters.startDate;
        apiFilters.endDate = filters.endDate;
        // Remove single date if range is provided
        delete apiFilters.date;
      }

      // Add relative date filter if present
      if (filters.createdWithin) {
        apiFilters.createdWithin = filters.createdWithin;
        // Remove other date filters if relative is provided
        delete apiFilters.date;
        delete apiFilters.startDate;
        delete apiFilters.endDate;
      }

      const response = await profileAPI.getAllCustomers(apiFilters);
      const { customers, totalPages } = response.data;

      setCustomers(customers);
      setTotalPages(totalPages);
      setFilteredCustomers(customers);
    } catch (err) {
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (newStatus) => {
    if (!selectedCustomer) return;

    try {
      await profileAPI.updateCustomerProfileStatus(selectedCustomer.u_id, {
        status: newStatus,
      });

      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.u_id === selectedCustomer.u_id
            ? { ...customer, account_status: newStatus }
            : customer,
        ),
      );

      setFilteredCustomers((prevFiltered) =>
        prevFiltered.map((customer) =>
          customer.u_id === selectedCustomer.u_id
            ? { ...customer, account_status: newStatus }
            : customer,
        ),
      );

      setSelectedCustomer(null);
      setStatus("");
      setConfirmationDialogOpen(false);

      toast({
        title: "Success",
        description: "Customer status updated successfully",
        variant: "default",
      });
    } catch (err) {
      setError("Failed to update customer status.");
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  const handleViewCustomer = (customer, e) => {
    e.stopPropagation();
    setViewCustomer(customer);
    setShowCustomerView(true);
  };

  const handleStatusChange = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setConfirmationDialogOpen(true);
  };

  const closeCustomerView = () => {
    setShowCustomerView(false);
    setViewCustomer(null);
  };

  const handleUpdateCustomer = (customer, e) => {
    e.stopPropagation();
    setCustomerToUpdate(customer);
    setShowUpdateForm(true);
  };

  const handleViewBookings = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setShowCustomerBookings(true);
  };

  const handleUpdateSuccess = (updatedCustomer) => {
    // Update the customer in the local state
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.u_id === updatedCustomer.u_id ? updatedCustomer : customer,
      ),
    );

    // Also update filtered customers
    setFilteredCustomers((prevFiltered) =>
      prevFiltered.map((customer) =>
        customer.u_id === updatedCustomer.u_id ? updatedCustomer : customer,
      ),
    );

    setShowUpdateForm(false);
    setCustomerToUpdate(null);
  };

  const handleSettleClick = (customer, e) => {
    e.stopPropagation();
    setCustomerToSettle(customer);
    setSettleAmount(Math.abs(customer.acc_balance).toString());
    setSettleDialogOpen(true);
  };

  const handleSettleConfirm = async () => {
    if (!customerToSettle || !settleAmount) return;

    try {
      await adminBookingService.settleCustomerAccBalance(
        customerToSettle.u_id,
        { settleAmount },
      );

      fetchAllCustomers();

      setSettleDialogOpen(false);
      setCustomerToSettle(null);
      setSelectedCustomer(null);
      setSettleAmount("");
    } catch (err) {
      setError("Failed to settle amount.");
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

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      // Build query params based on current filters and report filters
      const params = {};
      if (reportFilters.startDate) params.startDate = reportFilters.startDate;
      if (reportFilters.endDate) params.endDate = reportFilters.endDate;
      if (reportFilters.status && reportFilters.status !== "all") {
        params.status = reportFilters.status;
      }
      if (reportFilters.city && reportFilters.city !== "all") {
        params.city = reportFilters.city;
      }
      if (reportFilters.search && reportFilters.search.trim() !== "") {
        params.search = reportFilters.search.trim();
      }
      if (reportFilters.format) params.format = reportFilters.format;

      // Call API to generate report
      const response = await reportAPI.generateCustomerReport(params);

      // Determine file extension and MIME type based on format
      const format = reportFilters.format || "pdf";
      const mimeType =
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf";
      const fileExtension = format === "excel" ? "xlsx" : "pdf";

      // Create blob from response
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `customer-report-${Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Customer report generated successfully",
        variant: "default",
      });

      setIsReportModalOpen(false);
      setReportFilters({
        startDate: "",
        endDate: "",
        status: "all",
        city: "all",
        format: "pdf",
        search: "",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate customer report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCustomer = async (type) => {
    try {
      await profileAPI.deleteCustomer(selectedCustomer.u_id, type);
      fetchAllCustomers();
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <div className="py-6 px-3 flex justify-center ">
      <Card className="w-full shadow-none rounded-lg bg-white">
        <CardHeader className="flex justify-between px-6 space-y-4 py-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-semibold text-gray-800">
              Customers
            </CardTitle>
            <Button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="Search by Name, or Status..."
              value={filters.search}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  search: e.target.value,
                });
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-72 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            />

            <Select
              value={filters.city}
              onValueChange={(value) => setFilters({ ...filters, city: value })}
            >
              <SelectTrigger className="w-[180px]">
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
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePicker
              selected={filters.date}
              onSelect={(date) =>
                setFilters({
                  ...filters,
                  date: date,
                  startDate: "",
                  endDate: "",
                  createdWithin: "",
                })
              }
              className="w-fit"
              placeholder="Filter by registration date"
            />
          </div>

          {/* Additional Date Filters Row */}
          <div className="flex gap-4 items-end">
            <Select
              value={filters.createdWithin}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  createdWithin: value,
                  date: null,
                  startDate: "",
                  endDate: "",
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Created within" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3">Last 3 Months</SelectItem>
                <SelectItem value="last6">Last 6 Months</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 items-end">
              <div className="flex flex-col">
                <Label className="text-xs mb-1">Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      startDate: e.target.value,
                      date: null,
                      createdWithin: "",
                    })
                  }
                  className="w-[150px]"
                />
              </div>
              <div className="flex flex-col">
                <Label className="text-xs mb-1">End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      endDate: e.target.value,
                      date: null,
                      createdWithin: "",
                    })
                  }
                  min={filters.startDate}
                  className="w-[150px]"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  ...filters,
                  date: null,
                  startDate: "",
                  endDate: "",
                  createdWithin: "",
                })
              }
              className="h-10"
            >
              Clear Date Filters
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-2 text-left">ID</TableHead>
                    <TableHead className="px-4 py-2 text-left">Name</TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Acc Balance
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Mobile
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Primary City
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Primary Address
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Booking Count
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Last Login
                    </TableHead>
                    <TableHead className="px-4 py-2 text-left">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers?.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer.u_id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {customer.u_id}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                parseFloat(customer.acc_balance) < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              ₹{customer.acc_balance || "0.00"}
                            </span>
                            {customer.acc_balance < 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={(e) => handleSettleClick(customer, e)}
                              >
                                Settle
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          {customer.mobile}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {customer.primary_city_name || (
                            <span className="text-gray-400 italic">
                              City not set yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {customer.primary_address || (
                            <span className="text-gray-400 italic">
                              Address not set yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full 
                            ${
                              customer.account_status === "active"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {customer.account_status}
                          </span>
                        </TableCell>

                        <TableCell
                          className="px-4 py-3 text-sm cursor-pointer hover:underline"
                          onClick={(e) => handleViewBookings(customer, e)}
                        >
                          {customer.booking_count}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-sm text-gray-600">
                          {customer.last_login
                            ? new Date(customer.last_login).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => handleViewCustomer(customer, e)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => handleUpdateCustomer(customer, e)}
                              title="Edit Customer Data"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {customer.account_status !== "active" && (
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8 px-3 text-xs font-medium"
                                onClick={(e) => handleStatusChange(customer, e)}
                                title="Activate Account"
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3 text-xs font-medium"
                              onClick={() => openDeleteModal(customer)}
                              title="Delete Customer"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan="8"
                        className="text-center py-4 text-gray-500"
                      >
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-between mt-5">
            <div className="flex items-center">
              <Label>Page Size:</Label>
              <Select
                value={String(filters.limit)}
                onValueChange={(e) => {
                  setFilters({ ...filters, limit: Number(e) });
                  setCurrentPage(1); // Reset to first page when changing page size
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
              </Select>
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

      {showCustomerDetails && selectedCustomer && (
        <Dialog
          open={showCustomerDetails}
          onOpenChange={setShowCustomerDetails}
        >
          <DialogContent className="max-w-sm lg:max-w-md w-full p-8 rounded-lg shadow-xl bg-white [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-800">
                Customer Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-3 grid grid-rows-1">
                <Label className="text-sm font-medium text-gray-600">
                  <strong>Name:</strong> {selectedCustomer.name}
                </Label>
                <Label className="text-sm font-medium text-gray-600">
                  <strong>Email:</strong> {selectedCustomer.email || "N/A"}
                </Label>
                <Label className="text-sm font-medium text-gray-600">
                  <strong>Mobile:</strong> {selectedCustomer.mobile}
                </Label>
                <Label className="text-sm font-medium text-gray-600">
                  <strong>Account Status:</strong>{" "}
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedCustomer.account_status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedCustomer.account_status}
                  </span>
                </Label>
                <Label className="text-sm font-medium text-gray-600">
                  <strong>Last Login:</strong>{" "}
                  {new Date(selectedCustomer.last_login).toLocaleString()}
                </Label>
                <Label className="text-sm font-medium text-gray-600">
                  <strong>Balance:</strong> {selectedCustomer.acc_balance}
                  {selectedCustomer.acc_balance < 0 && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Handle offer discount
                        }}
                      >
                        Offer Discount
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettleClick(selectedCustomer, e);
                        }}
                      >
                        Settle
                      </Button>
                    </div>
                  )}
                </Label>

                <Label className="text-sm font-medium text-gray-600">
                  <strong>Location:</strong> {selectedCustomer.exact_address}
                </Label>
              </div>

              {/* Change Status Dropdown */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-600">
                  <strong>Change Status:</strong>
                </Label>

                <Select
                  value={status}
                  onValueChange={(newStatus) => setStatus(newStatus)}
                >
                  <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowCustomerDetails(false);
                }}
                className="w-1/2 py-2 text-gray-700 border border-gray-300"
              >
                Close
              </Button>

              <Button
                className="w-1/2 py-2 text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (status === "") {
                    toast({
                      title: "Error",
                      description: "Please select a status.",
                      variant: "destructive",
                    });
                    return;
                  }

                  setConfirmationDialogOpen(true);
                }}
              >
                Update Status
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Settle Dialog */}
      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent className="max-w-md p-6 rounded-lg shadow-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Settle Balance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {customerToSettle && (
              <>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer: {customerToSettle.name}
                  </Label>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Balance: {customerToSettle.acc_balance}
                  </Label>
                </div>
                <div>
                  <Label
                    htmlFor="settleAmount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Amount to Settle
                  </Label>
                  <Input
                    id="settleAmount"
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    max={
                      customerToSettle.acc_balance < 0
                        ? Math.abs(customerToSettle.acc_balance)
                        : undefined
                    }
                    className="w-full"
                  />
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs p-0 mt-1 h-auto"
                    onClick={() =>
                      setSettleAmount(
                        Math.abs(customerToSettle.acc_balance).toString(),
                      )
                    }
                  >
                    Settle full amount ({Math.abs(customerToSettle.acc_balance)}
                    )
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSettleDialogOpen(false);
                setSettleAmount("");
              }}
              className="py-2 text-gray-700 border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              className="py-2 text-white bg-blue-600 hover:bg-blue-700"
              onClick={handleSettleConfirm}
              disabled={!settleAmount || parseFloat(settleAmount) <= 0}
            >
              Confirm Settle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onOpenChange={(open) => {
          setConfirmationDialogOpen(open);
          if (!open) {
            setSelectedCustomer(null);
          }
        }}
        onConfirm={() => {
          const newStatus =
            selectedCustomer?.account_status === "active"
              ? "inactive"
              : "active";
          updateCustomerStatus(newStatus);
        }}
        title="Change Customer Status"
        description={`Are you sure you want to ${
          selectedCustomer?.account_status === "active"
            ? "deactivate"
            : "activate"
        } ${selectedCustomer?.name}?`}
      />

      {/* Customer View Component */}
      <CustomerView
        customer={viewCustomer}
        isOpen={showCustomerView}
        onClose={closeCustomerView}
      />

      {/* Update Customer Form */}
      <UpdateCustomerForm
        customer={customerToUpdate}
        isOpen={showUpdateForm}
        onClose={() => {
          setShowUpdateForm(false);
          setCustomerToUpdate(null);
        }}
        onSuccess={handleUpdateSuccess}
      />

      {/* Customer Report Modal */}
      <Dialog
        open={isReportModalOpen}
        onOpenChange={(open) => {
          setIsReportModalOpen(open);
          if (!open) {
            setReportFilters({
              startDate: "",
              endDate: "",
              status: "all",
              city: "all",
              format: "pdf",
              search: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Customer Report
          </DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure filters to generate a detailed customer report in PDF or
              Excel format.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      endDate: e.target.value,
                    })
                  }
                  min={reportFilters.startDate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-status">Status</Label>
              <Select
                value={reportFilters.status}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    status: value,
                  })
                }
              >
                <SelectTrigger id="report-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-city">City</Label>
              <Select
                value={reportFilters.city}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    city: value,
                  })
                }
              >
                <SelectTrigger id="report-city">
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
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-search">Search Filter</Label>
              <Input
                id="report-search"
                type="text"
                placeholder="Search by name, mobile, or email"
                value={reportFilters.search}
                onChange={(e) =>
                  setReportFilters({
                    ...reportFilters,
                    search: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Leave empty to include all customers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-format">Report Format</Label>
              <Select
                value={reportFilters.format}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    format: value,
                  })
                }
              >
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportFilters({
                    startDate: "",
                    endDate: "",
                    status: "all",
                    city: "all",
                    format: "pdf",
                    search: "",
                  });
                }}
                disabled={isGeneratingReport}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate{" "}
                    {reportFilters.format === "excel" ? "Excel" : "PDF"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Report Modal */}
      <Dialog
        open={isReportModalOpen}
        onOpenChange={(open) => {
          setIsReportModalOpen(open);
          if (!open) {
            setReportFilters({
              startDate: "",
              endDate: "",
              status: "all",
              city: "all",
              format: "pdf",
              search: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Customer Report
          </DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure filters to generate a detailed customer report in PDF or
              Excel format.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) =>
                    setReportFilters({
                      ...reportFilters,
                      endDate: e.target.value,
                    })
                  }
                  min={reportFilters.startDate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-status">Status</Label>
              <Select
                value={reportFilters.status}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    status: value,
                  })
                }
              >
                <SelectTrigger id="report-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-city">City</Label>
              <Select
                value={reportFilters.city}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    city: value,
                  })
                }
              >
                <SelectTrigger id="report-city">
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
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-search">Search Filter</Label>
              <Input
                id="report-search"
                type="text"
                placeholder="Search by name, mobile, or email"
                value={reportFilters.search}
                onChange={(e) =>
                  setReportFilters({
                    ...reportFilters,
                    search: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                Leave empty to include all customers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-format">Report Format</Label>
              <Select
                value={reportFilters.format}
                onValueChange={(value) =>
                  setReportFilters({
                    ...reportFilters,
                    format: value,
                  })
                }
              >
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportFilters({
                    startDate: "",
                    endDate: "",
                    status: "all",
                    city: "all",
                    format: "pdf",
                    search: "",
                  });
                }}
                disabled={isGeneratingReport}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate{" "}
                    {reportFilters.format === "excel" ? "Excel" : "PDF"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteCustomerDialog
        isOpen={isDeleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleDeleteCustomer={handleDeleteCustomer}
      />

      <CustomerBookings
        open={showCustomerBookings}
        customerId={selectedCustomer?.u_id}
        onClose={() => {
          setShowCustomerBookings(false);
          setSelectedCustomer(null);
        }}
      />
    </div>
  );
};

export default withAdminAuth(CustomersPage, {
  module: "customers",
  action: "view",
});
