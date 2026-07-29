import React, { useState, useEffect } from "react";
import { adminBookingService } from "../../api/adminBookingService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
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
import { getDistanceFromLatLonInKm } from "@/utils/distanceCaculate";

const EligibleProvider = ({
  cityId,
  categoryIds,
  currentProvider,
  onAssign,
  booking,
  onClose,
  onCancelBooking, //not yet implemented
}) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByDistanceAsc, setSortByDistanceAsc] = useState(true);

  console.log("EligibleProvider props:", { cityId, categoryIds, booking });

  useEffect(() => {
    console.log("useEffect triggered - fetching providers");
    if (cityId && categoryIds) {
      fetchProviders();
    } else {
      console.log("Missing required params:", { cityId, categoryIds });
    }
  }, [cityId, categoryIds, booking]);

  const fetchProviders = async () => {
    console.log("fetchProviders called with:", {
      cityId,
      categoryIds,
      booking,
    });
    try {
      setLoading(true);

      const categoryIdParam = Array.isArray(categoryIds)
        ? categoryIds.join(",")
        : categoryIds;

      const options = {
        search: searchQuery || undefined,
        bookingId: booking?.booking_id || undefined,
      };

      // Remove undefined values
      Object.keys(options).forEach(
        (key) => options[key] === undefined && delete options[key]
      );

      console.log("Calling API with params:", {
        cityId,
        categoryId: categoryIdParam,
        options,
      });

      const response = await adminBookingService.getServiceProviders(
        cityId,
        categoryIdParam,
        options
      );

      console.log("API response:", response);

      // initialize distance to null for each provider
      const providersWithDistance = response.map((p) => ({
        ...p,
        distance: null,
      }));
      setProviders(providersWithDistance);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDistance = (provider) => {
    const providerLat = provider?.primary_location?.coordinates[1];
    const providerLon = provider?.primary_location?.coordinates[0];
    const customerLat = booking?.service_location?.coordinates[1];
    const customerLon = booking?.service_location?.coordinates[0];

    const distance = getDistanceFromLatLonInKm(
      providerLat,
      providerLon,
      customerLat,
      customerLon
    );

    console.log(distance);

    setProviders((prev) =>
      prev.map((p) =>
        p.provider_id === provider?.provider_id
          ? { ...p, distance: distance }
          : p
      )
    );
  };

  const handleSortByDistance = () => {
    setSortByDistanceAsc((prev) => !prev);
    setProviders((prev) =>
      [...prev].sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return sortByDistanceAsc
          ? a.distance - b.distance
          : b.distance - a.distance;
      })
    );
  };

  const filteredProviders = providers.filter((provider) =>
    (provider.User?.name || provider.business_name)
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Select Service Provider</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input
          placeholder="Search providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <Button variant="secondary" onClick={handleSortByDistance}>
            Sort by Distance {sortByDistanceAsc ? "↑" : "↓"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading providers...</div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-4 text-red-500 font-semibold">
            Sorry, no any eligible providers found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Distance (km)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((provider) => (
                <TableRow
                  key={provider.provider_id}
                  className={
                    provider.provider_id === currentProvider?.provider_id
                      ? "bg-gray-100"
                      : ""
                  }
                >
                  <TableCell>{provider.User?.name || "N/A"}</TableCell>
                  <TableCell>{provider.User?.email || "N/A"}</TableCell>
                  <TableCell>{provider.business_name || "N/A"}</TableCell>
                  <TableCell>
                    {provider.distance !== null ? (
                      `${parseFloat(provider.distance).toFixed(2)} km`
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCalculateDistance(provider)}
                      >
                        Calculate
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={
                        provider.provider_id === currentProvider?.provider_id
                          ? "outline"
                          : "default"
                      }
                      size="sm"
                      onClick={() => onAssign(provider.provider_id)}
                      disabled={
                        provider.provider_id === currentProvider?.provider_id
                      }
                    >
                      {provider.provider_id === currentProvider?.provider_id
                        ? "Assigned"
                        : "Select"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="destructive" onClick={onCancelBooking}>
            Cancel Booking
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default EligibleProvider;
