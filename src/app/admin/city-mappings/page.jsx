"use client";
import React, { useState, useEffect } from "react";
import { cityMappingService } from "@/api/cityMappingService";
import { serviceAPI } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Upload,
  MapPin,
} from "lucide-react";

const CityMappingsPage = () => {
  const [cityMappings, setCityMappings] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [formData, setFormData] = useState({
    sub_city_name: "",
    main_city_name: "",
    state: "",
    status: "active",
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    main_city: "",
  });

  useEffect(() => {
    fetchCityMappings();
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      console.log("Fetching cities...");
      const response = await serviceAPI.getCities();
      console.log("Cities response:", response);
      console.log("Cities data:", response.data);
      const citiesData = response.data || [];
      console.log("Setting cities to:", citiesData);
      console.log("Cities array length:", citiesData.length);
      if (citiesData.length > 0) {
        console.log("First city:", citiesData[0]);
      }
      setCities(citiesData);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cities",
        variant: "destructive",
      });
    }
  };

  const fetchCityMappings = async () => {
    try {
      setLoading(true);
      const response = await cityMappingService.getAllCityMappings(filters);
      setCityMappings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching city mappings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch city mappings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchCityMappings();
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      main_city: "",
    });
    setTimeout(() => fetchCityMappings(), 0);
  };

  const openDialog = (mapping = null) => {
    if (mapping) {
      setSelectedMapping(mapping);
      setFormData({
        sub_city_name: mapping.sub_city_name,
        main_city_name: mapping.main_city_name,
        state: mapping.state || "",
        status: mapping.status,
      });
    } else {
      setSelectedMapping(null);
      setFormData({
        sub_city_name: "",
        main_city_name: "",
        state: "",
        status: "active",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedMapping(null);
    setFormData({
      sub_city_name: "",
      main_city_name: "",
      state: "",
      status: "active",
    });
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.sub_city_name ||
        !formData.main_city_name ||
        !formData.state
      ) {
        toast({
          title: "Error",
          description: "Sub City, Main City, and State are required",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      if (selectedMapping) {
        await cityMappingService.updateCityMapping(
          selectedMapping.id,
          formData
        );
        toast({
          title: "Success",
          description: "City mapping updated successfully",
        });
      } else {
        await cityMappingService.createCityMapping(formData);
        toast({
          title: "Success",
          description: "City mapping created successfully",
        });
      }

      closeDialog();
      fetchCityMappings();
    } catch (error) {
      console.error("Error saving city mapping:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save city mapping",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (mapping) => {
    setSelectedMapping(mapping);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedMapping(null);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await cityMappingService.deleteCityMapping(selectedMapping.id);
      toast({
        title: "Success",
        description: "City mapping deleted successfully",
      });
      closeDeleteDialog();
      fetchCityMappings();
    } catch (error) {
      console.error("Error deleting city mapping:", error);
      toast({
        title: "Error",
        description: "Failed to delete city mapping",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique main cities for filter
  const uniqueMainCities = [
    ...new Set(cityMappings.map((m) => m.main_city_name)),
  ].sort();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            City Mappings Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage sub-city to main-city mappings
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Mapping
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Mappings</p>
              <p className="text-2xl font-bold">{cityMappings.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Mappings</p>
              <p className="text-2xl font-bold">
                {cityMappings.filter((m) => m.status === "active").length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Main Cities</p>
              <p className="text-2xl font-bold">{uniqueMainCities.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search cities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label>Main City</Label>
              <Select
                value={filters.main_city || "all"}
                onValueChange={(value) =>
                  handleFilterChange("main_city", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Main Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Main Cities</SelectItem>
                  {uniqueMainCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange("status", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={handleClearFilters} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>City Mappings ({cityMappings.length})</CardTitle>
          <CardDescription>
            List of all sub-city to main-city mappings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3">Loading mappings...</span>
            </div>
          ) : cityMappings.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No city mappings found</p>
              <Button
                onClick={() => openDialog()}
                className="mt-4"
                variant="outline"
              >
                Add First Mapping
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sub City</TableHead>
                    <TableHead>Main City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">
                        {mapping.sub_city_name}
                      </TableCell>
                      <TableCell>{mapping.main_city_name}</TableCell>
                      <TableCell>{mapping.state || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mapping.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {mapping.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(mapping)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(mapping)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMapping ? "Edit City Mapping" : "Add New City Mapping"}
            </DialogTitle>
            <DialogDescription>
              {selectedMapping
                ? "Update the city mapping details below"
                : "Create a new sub-city to main-city mapping"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="sub_city_name">
                Sub City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sub_city_name"
                value={formData.sub_city_name}
                onChange={(e) =>
                  setFormData({ ...formData, sub_city_name: e.target.value })
                }
                placeholder="Enter sub city name"
              />
            </div>

            <div>
              <Label htmlFor="main_city_name">
                Main City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.main_city_name}
                onValueChange={(value) => {
                  console.log("Selected city:", value);
                  setFormData({ ...formData, main_city_name: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main city" />
                </SelectTrigger>
                <SelectContent>
                  {cities && cities.length > 0 ? (
                    cities.map((city) => (
                      <SelectItem key={city.city_id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      {loading ? "Loading cities..." : "No cities available"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {cities.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {loading
                    ? "Loading cities..."
                    : `${cities.length} cities loaded`}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="Enter state"
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{selectedMapping ? "Update" : "Create"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete City Mapping</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the mapping for{" "}
              <strong>{selectedMapping?.sub_city_name}</strong> →{" "}
              <strong>{selectedMapping?.main_city_name}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CityMappingsPage;
