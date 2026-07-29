"use client";
import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, User, Phone, Mail, Map } from "lucide-react";
import { adminBookingService } from "../../api/adminBookingService";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Circle,
} from "@react-google-maps/api";

const AssignmentMapView = ({ assignments, bookingLocation }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY?.trim(),
    libraries: ["places"],
  });

  // Generate URL to show all locations on Google Maps
  const generateCombinedMapUrl = () => {
    const bookingCoords = bookingLocation?.coordinates?.coordinates;
    if (!bookingCoords) return "https://www.google.com/maps";

    const [bookingLng, bookingLat] = bookingCoords;
    let url = `https://www.google.com/maps/dir/${bookingLat},${bookingLng}`;

    // Add provider locations as waypoints
    assignments.forEach((assignment, index) => {
      const providerCoords =
        assignment.provider?.location?.coordinates?.coordinates;
      if (providerCoords) {
        const [providerLng, providerLat] = providerCoords;
        url += `/${providerLat},${providerLng}`;
      }
    });

    return url;
  };

  console.log(
    "Google Maps API Key exists:",
    !!process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY
  ); // Debug log
  console.log("Booking location:", bookingLocation); // Debug log
  console.log("Assignments count:", assignments?.length); // Debug log

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Google Maps API key not configured</p>
          <p className="text-xs text-gray-400 mt-1">
            Please set NEXT_PUBLIC_GOOGLE_MAP_API_KEY in your environment
          </p>
          {assignments.length > 0 && (
            <button
              onClick={() => window.open(generateCombinedMapUrl(), "_blank")}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Open in Google Maps instead
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  const getMapCenter = () => {
    const bookingCoords = bookingLocation?.coordinates?.coordinates;
    if (bookingCoords) {
      return { lat: bookingCoords[1], lng: bookingCoords[0] };
    }
    return { lat: 20.5937, lng: 78.9629 }; // Default to India center
  };

  const getProviderColor = (index) => {
    const colors = [
      "#0000FF",
      "#00FF00",
      "#800080",
      "#FF8C00",
      "#FFFF00",
      "#FF1493",
      "#00FFFF",
    ];
    return colors[index % colors.length];
  };

  const mapContainerStyle = { width: "100%", height: "400px" };

  return (
    <div className="space-y-4">
      {/* Interactive Google Map with Service Radius Visualization */}
      <div className="h-96 rounded-lg overflow-hidden shadow-md">
        {assignments.length > 0 && bookingLocation?.coordinates?.coordinates ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={getMapCenter()}
            zoom={11}
            onClick={() => window.open(generateCombinedMapUrl(), "_blank")}
          >
            {/* Booking Location Marker */}
            <Marker
              position={getMapCenter()}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="red" stroke="white" stroke-width="2"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">B</text>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
              }}
              title="Booking Location"
            />

            {/* Provider Markers and Service Radius Circles */}
            {assignments.map((assignment, index) => {
              const providerCoords =
                assignment.provider?.location?.coordinates?.coordinates;
              if (!providerCoords) return null;

              const position = {
                lat: providerCoords[1],
                lng: providerCoords[0],
              };
              const serviceRadius = assignment.provider?.service_radius || 5;
              const color = getProviderColor(index);

              return (
                <div key={assignment.assignment_id}>
                  {/* Provider Marker */}
                  <Marker
                    position={position}
                    icon={{
                      url:
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
                          <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">${
                            index + 1
                          }</text>
                        </svg>
                      `),
                      scaledSize: new window.google.maps.Size(24, 24),
                    }}
                    title={`${
                      assignment.provider?.business_name ||
                      assignment.provider?.user?.name
                    } - ${assignment.distance_km}km`}
                  />

                  {/* Service Radius Circle */}
                  <Circle
                    center={position}
                    radius={serviceRadius * 1000} // Convert km to meters
                    options={{
                      fillColor: color,
                      fillOpacity: 0.1,
                      strokeColor: color,
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                </div>
              );
            })}
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center text-gray-500">
              <p>
                {!assignments.length
                  ? "No assignments available"
                  : "No location data available"}
              </p>
              <p className="text-sm mt-1">Unable to display map</p>
              {assignments.length > 0 && (
                <button
                  onClick={() =>
                    window.open(generateCombinedMapUrl(), "_blank")
                  }
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Try opening in Google Maps
                </button>
              )}
            </div>
          </div>
        )}
      </div>{" "}
      {/* Map Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Map className="w-4 h-4" />
          Map Legend & Provider Service Areas
        </h4>

        {/* Map Features Explanation */}
        <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>Interactive Map Features:</strong> Red marker (B) shows
            booking location. Colored markers (1,2,3...) show provider locations
            with circular service radius areas. Click and drag to explore the
            map.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Booking Location */}
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
            <span className="text-sm">
              <strong>Booking Location:</strong> {bookingLocation?.address}
              {bookingLocation?.coordinates?.coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${bookingLocation.coordinates.coordinates[1]},${bookingLocation.coordinates.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  View on Google Maps
                </a>
              )}
            </span>
          </div>

          {/* Provider Locations */}
          {assignments.map((assignment, index) => {
            const providerCoords =
              assignment.provider?.location?.coordinates?.coordinates;
            const markerColors = {
              0: "bg-blue-500",
              1: "bg-green-500",
              2: "bg-purple-500",
              3: "bg-orange-500",
              4: "bg-yellow-500",
            };
            const bgColors = {
              0: "bg-blue-50",
              1: "bg-green-50",
              2: "bg-purple-50",
              3: "bg-orange-50",
              4: "bg-yellow-50",
            };

            return (
              <div
                key={assignment.assignment_id}
                className={`flex items-center gap-2 p-2 rounded ${
                  bgColors[index % 5] || "bg-gray-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white shadow flex items-center justify-center text-white text-xs font-bold ${
                    markerColors[index % 5] || "bg-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm flex-1">
                  <strong>
                    {assignment.provider?.business_name ||
                      assignment.provider?.user?.name}
                    :
                  </strong>{" "}
                  {assignment.distance_km}km away,{" "}
                  {assignment.provider?.service_radius}km service radius
                  {providerCoords && (
                    <a
                      href={`https://www.google.com/maps?q=${providerCoords[1]},${providerCoords[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      View Location
                    </a>
                  )}
                </span>
                <Badge
                  className={`${
                    assignment.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : assignment.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : assignment.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {assignment.status}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Combined Map Link */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <a
              href={generateCombinedMapUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              View All Locations with Directions on Google Maps
            </a>
          </div>
        </div>

        {/* Map Coordinates Info */}
        <div className="mt-3 pt-3 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              <strong>Booking Coordinates:</strong>{" "}
              {bookingLocation?.coordinates?.coordinates
                ? `${bookingLocation.coordinates.coordinates[1].toFixed(
                    4
                  )}, ${bookingLocation.coordinates.coordinates[0].toFixed(4)}`
                : "N/A"}
            </div>
            <div>
              <strong>Total Providers:</strong> {assignments.length}
            </div>
            <div>
              <strong>Service Areas:</strong> Colored circles show coverage
              zones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentHistory = ({ bookingId }) => {
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchAssignmentHistory();
    }
  }, [bookingId]);

  const fetchAssignmentHistory = async () => {
    try {
      setLoading(true);
      const data = await adminBookingService.getAssignmentHistory(bookingId);
      setAssignmentData(data);
    } catch (error) {
      console.error("Error fetching assignment history:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      assigned: "bg-blue-100 text-blue-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatLocation = (location) => {
    if (location?.coordinates?.coordinates) {
      const [lng, lat] = location.coordinates.coordinates;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return "N/A";
  };

  if (loading) {
    return (
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment History - {bookingId}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">Loading assignment history...</div>
        </div>
      </DialogContent>
    );
  }

  if (error) {
    return (
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment History - {bookingId}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-8">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </DialogContent>
    );
  }

  const { data: assignments, booking, statistics } = assignmentData;

  return (
    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Assignment History - {bookingId}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-medium">{booking?.booking_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusColor(booking?.status)}>
                  {booking?.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {new Date(booking?.booking_date).toLocaleDateString()} -{" "}
                  {booking?.start_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-sm">
                  {booking?.location?.address ||
                    formatLocation(booking?.location)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Assignment Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Assignments</p>
                <p className="font-medium text-lg">
                  {statistics?.total_assignments}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Distance</p>
                <p className="font-medium text-lg">
                  {statistics?.average_distance_km} km
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="font-medium text-lg">
                  {statistics?.average_response_time_minutes} min
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status Breakdown</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(statistics?.status_counts || {}).map(
                    ([status, count]) => (
                      <Badge key={status} className={getStatusColor(status)}>
                        {status}: {count}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssignmentMapView
              assignments={assignments}
              bookingLocation={booking?.location}
            />
          </CardContent>
        </Card>

        {/* Assignment History Tables */}
        <div className="space-y-6">
          {/* Sequential Assignments (Attempt #1) */}
          {assignments.filter((assignment) => assignment.attempt_number === 1)
            .length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Sequential Assignments (Attempt #1)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Initial assignment attempts to the most suitable providers
                  based on distance and availability.
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Scores</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Assigned At</TableHead>
                      <TableHead>Rejection Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments
                      .filter((assignment) => assignment.attempt_number === 1)
                      .map((assignment) => (
                        <TableRow key={assignment.assignment_id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {assignment.provider?.business_name ||
                                  assignment.provider?.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assignment.provider?.business_type}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {assignment.provider?.provider_id}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <User className="w-3 h-3" />
                                {assignment.provider?.user?.name}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {assignment.provider?.user?.mobile}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {assignment.provider?.user?.email}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {assignment.provider?.location?.address}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatLocation(assignment.provider?.location)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Service Radius:{" "}
                                {assignment.provider?.service_radius}km
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline">
                              {assignment.distance_km} km
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1 text-xs">
                              <div>Provider: {assignment.provider_score}</div>
                              <div>Distance: {assignment.distance_score}</div>
                              <div>Rating: {assignment.rating_score}</div>
                              <div>Workload: {assignment.workload_score}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={getStatusColor(assignment.status)}
                            >
                              {assignment.status}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {assignment.response_time
                              ? `${assignment.response_time} min`
                              : "N/A"}
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              {formatDate(assignment.assigned_at)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm max-w-[200px]">
                              {assignment.rejection_reason || "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* City Wide Assignments (Attempt #2+) */}
          {assignments.filter((assignment) => assignment.attempt_number >= 2)
            .length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  City Wide Assignments (Attempt #2+)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Extended search assignments when initial providers were
                  unavailable or declined.
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attempt #</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Scores</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Assigned At</TableHead>
                      <TableHead>Rejection Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments
                      .filter((assignment) => assignment.attempt_number >= 2)
                      .map((assignment) => (
                        <TableRow key={assignment.assignment_id}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-orange-50 text-orange-700 border-orange-200"
                            >
                              #{assignment.attempt_number}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {assignment.provider?.business_name ||
                                  assignment.provider?.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assignment.provider?.business_type}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {assignment.provider?.provider_id}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <User className="w-3 h-3" />
                                {assignment.provider?.user?.name}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {assignment.provider?.user?.mobile}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {assignment.provider?.user?.email}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {assignment.provider?.location?.address}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatLocation(assignment.provider?.location)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Service Radius:{" "}
                                {assignment.provider?.service_radius}km
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline">
                              {assignment.distance_km} km
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1 text-xs">
                              <div>Provider: {assignment.provider_score}</div>
                              <div>Distance: {assignment.distance_score}</div>
                              <div>Rating: {assignment.rating_score}</div>
                              <div>Workload: {assignment.workload_score}</div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={getStatusColor(assignment.status)}
                            >
                              {assignment.status}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {assignment.response_time
                              ? `${assignment.response_time} min`
                              : "N/A"}
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              {formatDate(assignment.assigned_at)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm max-w-[200px]">
                              {assignment.rejection_reason || "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default AssignmentHistory;
