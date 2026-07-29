"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { cn } from "@/lib/utils";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { serviceAPI } from "../../api/services";

const libraries = ["places"];
const containerStyle = {
  width: "100%",
  height: "300px",
};
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
const STATUS_OPTIONS = ["active", "inactive"];

const CityManager = () => {
  const [cities, setCities] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    latitude: "",
    longitude: "",
    status: "active",
    radius: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const { toast } = useToast();
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "",
    libraries,
  });

  const editForm = useForm({
    defaultValues: {
      name: "",
      state: "",
      latitude: "",
      longitude: "",
      status: "active",
      radius: "",
    },
  });

  // Load cities
  useEffect(() => {
    loadCities();
  }, []);

  // Reset edit form
  useEffect(() => {
    if (selectedCity) {
      editForm.reset({
        name: selectedCity.name,
        state: selectedCity.state,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        status: selectedCity.status,
        radius: selectedCity.radius,
      });
    }
  }, [selectedCity, editForm]);

  // Handle API load error and debug
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API Load Error:", loadError);
      toast({
        title: "Error",
        description: "Failed to load Google Maps API: " + loadError.message,
        variant: "destructive",
      });
    }
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY) {
      console.error("Missing Google Maps API Key");
      toast({
        title: "Error",
        description: "Google Maps API Key is missing.",
        variant: "destructive",
      });
    }
    console.log("Google Maps API Loaded:", isLoaded);
  }, [loadError, isLoaded, toast]);

  const handlePlaceChanged = () => {
    try {
      const place = autocompleteRef.current.getPlace();
      console.log("Place selected:", place);
      if (!place?.geometry?.location) {
        toast({
          title: "Error",
          description: "No details available for the selected city.",
          variant: "destructive",
        });
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setMarkerPosition({ lat, lng });

      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(12);
      }

      const comp = (type) =>
        place.address_components?.find((c) => c.types.includes(type))
          ?.long_name || "";
      const cityName = comp("locality") || place.name;
      const stateName = comp("administrative_area_level_1");

      setFormData({
        name: cityName,
        state: stateName,
        latitude: lat.toString(),
        longitude: lng.toString(),
        status: "active",
      });
      setSearchInput(place.formatted_address || "");
    } catch (error) {
      console.error("Error in handlePlaceChanged:", error);
      toast({
        title: "Error",
        description: "Failed to process selected city.",
        variant: "destructive",
      });
    }
  };

  // Reverse geocode
  const fetchAddress = async (lat, lng) => {
    setIsLoading(true);
    setSearchInput("Detecting location...");
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&result_type=locality`
      );
      const data = await res.json();
      console.log("Geocode result:", data);
      if (data.results && data.results.length) {
        const place = data.results[0];

        const comp = (type) =>
          place.address_components?.find((c) => c.types.includes(type))
            ?.long_name || "";
        const cityName =
          comp("locality") || place.formatted_address.split(",")[0];
        const stateName = comp("administrative_area_level_1");

        setFormData({
          name: cityName,
          state: stateName,
          latitude: lat.toString(),
          longitude: lng.toString(),
          status: "active",
        });
        setSearchInput(place.formatted_address || "");
      } else {
        toast({
          title: "Error",
          description: "No city found at this location.",
          variant: "destructive",
        });
        setSearchInput("");
      }
    } catch (error) {
      console.error("Geocode error:", error);
      toast({
        title: "Error",
        description: "Unable to fetch city details.",
        variant: "destructive",
      });
      setSearchInput("");
    } finally {
      setIsLoading(false);
    }
  };

  const debounceFetchAddress = (lat, lng) => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchAddress(lat, lng), 600);
  };

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    debounceFetchAddress(lat, lng);
  };

  const onCurrentLocationClick = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSearchInput("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerPosition({ lat, lng });
        setSearchInput("");
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(12);
        }
        fetchAddress(lat, lng);
      },
      (error) => {
        setIsLoading(false);
        setSearchInput("");
        toast({
          title: "Location Error",
          description:
            error.code === error.PERMISSION_DENIED
              ? "Please allow location access."
              : "Unable to retrieve your location.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const loadCities = async () => {
    try {
      const response = await serviceAPI.getCitiesForAdmin();
      setCities(response.data);
    } catch (error) {
      console.error("Load cities error:", error);
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.state ||
      !formData.latitude ||
      !formData.longitude
    ) {
      toast({
        title: "Error",
        description: "Please select a valid city to fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await serviceAPI.createCity(formData);
      toast({
        title: "Success",
        description: "City added successfully",
      });
      setIsAddDialogOpen(false);
      setMarkerPosition(defaultCenter);
      setFormData({
        name: "",
        state: "",
        latitude: "",
        longitude: "",
        status: "active",
        radius: "",
      });
      setSearchInput("");
      loadCities();
    } catch (error) {
      console.error("Add city error:", error);
      toast({
        title: "Error",
        description:
          "Failed to add city: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data) => {
    try {
      await serviceAPI.updateCity(selectedCity.city_id, data);
      toast({
        title: "Success",
        description: "City updated successfully",
      });
      setIsEditDialogOpen(false);
      loadCities();
    } catch (error) {
      console.error("Edit city error:", error);
      toast({
        title: "Error",
        description: "Failed to update city",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (cityId) => {
    if (window.confirm("Are you sure you want to delete this city?")) {
      try {
        await serviceAPI.deleteCity(cityId);
        toast({
          title: "Success",
          description: "City deleted successfully",
        });
        loadCities();
      } catch (error) {
        console.error("Delete city error:", error);
        toast({
          title: "Error",
          description: "Failed to delete city",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (city) => {
    setSelectedCity(city);
    setIsEditDialogOpen(true);
  };

  const handleDialogOpenChange = (open) => {
    console.log("Dialog open change:", open);
    setIsAddDialogOpen(open);
  };

  const handleAutocompleteContainerMouseDown = (e) => {
    e.stopPropagation();
  };

  if (loadError) return <div>Error loading Google Maps API</div>;
  if (!isLoaded) return <div>Loading Google Maps API...</div>;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cities Management</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Add City
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New City</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-3 w-full">
                  <div
                    className="flex-grow"
                    onMouseDown={handleAutocompleteContainerMouseDown}
                  >
                    <label htmlFor="name" className="block text-sm font-medium">
                      City Name
                    </label>
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        console.log("Autocomplete loaded:", autocomplete);
                        autocompleteRef.current = autocomplete;
                      }}
                      onPlaceChanged={handlePlaceChanged}
                      options={{
                        componentRestrictions: { country: "in" },
                        types: ["(cities)"],
                        fields: [
                          "address_components",
                          "geometry",
                          "formatted_address",
                          "name",
                        ],
                      }}
                    >
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        placeholder="Search for an Indian city"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        disabled={isLoading}
                        autoComplete="off"
                        spellCheck={false}
                        required
                      />
                    </Autocomplete>
                  </div>
                  <Button
                    type="button"
                    className={cn(
                      "px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6",
                      isLoading && "cursor-wait"
                    )}
                    onClick={onCurrentLocationClick}
                    disabled={isLoading}
                    title="Use Current Location"
                  >
                    <FaLocationCrosshairs
                      className={isLoading ? "animate-spin" : ""}
                    />
                  </Button>
                </div>

                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={markerPosition}
                  zoom={12}
                  onLoad={(map) => (mapRef.current = map)}
                  options={{ streetViewControl: false }}
                >
                  <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd}
                  />
                </GoogleMap>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium"
                    >
                      State
                    </label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="latitude"
                      className="block text-sm font-medium"
                    >
                      Latitude
                    </label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="longitude"
                      className="block text-sm font-medium"
                    >
                      Longitude
                    </label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="radius"
                      className="block text-sm font-medium"
                    >
                      Radius (km)
                    </label>
                    <Input
                      id="radius"
                      name="radius"
                      type="number"
                      step="any"
                      value={formData.radius}
                      onChange={(e) =>
                        setFormData({ ...formData, radius: e.target.value })
                      }
                      placeholder="Enter radius in km"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium"
                    >
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Add City
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Radius (km)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.city_id}>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.state}</TableCell>
                <TableCell>{city.latitude}</TableCell>
                <TableCell>{city.longitude}</TableCell>
                <TableCell>{city.radius || "N/A"}</TableCell>
                <TableCell>{city.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(city)}
                    >
                      <Pencil size={16} />
                    </Button>
                    {/* <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(city.city_id)}
                    >
                      <Trash2 size={16} />
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit City</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEdit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City Name</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="any" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="any" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="radius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Radius (km)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          placeholder="Enter radius in km"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Update City
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CityManager;
