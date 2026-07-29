"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { toast } from "@/hooks/use-toast";
import { useMobile } from "@/src/hooks/useMobile";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const PinDropMap = ({
  initialLocation = null,
  onLocationSelect,
  countryRestriction = "in",
  isLoaded,
}) => {
  const isMobile = useMobile();
  const mapRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [zoom, setZoom] = useState(initialLocation ? 15 : 6);

  // Load initial location
  useEffect(() => {
    if (initialLocation) {
      let coords;

      if (initialLocation.coordinates) {
        if (Array.isArray(initialLocation.coordinates)) {
          const [first, second] = initialLocation.coordinates;
          coords =
            first >= -90 && first <= 90 && second >= -180 && second <= 180
              ? { lat: first, lng: second }
              : { lat: second, lng: first };
        } else if (
          initialLocation.coordinates.lat &&
          initialLocation.coordinates.lng
        ) {
          coords = {
            lat: initialLocation.coordinates.lat,
            lng: initialLocation.coordinates.lng,
          };
        }
      } else if (initialLocation.lat && initialLocation.lng) {
        coords = { lat: initialLocation.lat, lng: initialLocation.lng };
      }

      if (coords) {
        setMarkerPosition(coords);
        setZoom(15);
        if (mapRef.current) {
          mapRef.current.panTo(coords);
        }
      }
    }
  }, [initialLocation]);

  // Reverse geocode
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`
      );
      const data = await res.json();

      if (data.results && data.results.length && onLocationSelect) {
        const place =
          data.results.find(
            (r) =>
              r.types.includes("street_address") || r.types.includes("premise")
          ) || data.results[0];

        onLocationSelect({
          type: "point",
          coordinates: { lat, lng },
          details: extractAddressDetails(place),
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to fetch address from location.",
        variant: "destructive",
      });
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

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPosition}
      zoom={zoom}
      onLoad={(map) => {
        mapRef.current = map;
        if (initialLocation) {
          map.setZoom(15);
        }
      }}
      options={{
        streetViewControl: false,
        fullscreenControl: !isMobile,
      }}
    >
      <Marker
        position={markerPosition}
        draggable={true}
        onDragEnd={onMarkerDragEnd}
      />
    </GoogleMap>
  );
};

const extractAddressDetails = (place) => {
  const comp = (type) =>
    place.address_components?.find((c) => c.types.includes(type))?.long_name ||
    "";

  let street =
    comp("route") ||
    comp("sublocality_level_1") ||
    comp("sublocality") ||
    comp("neighborhood");
  let city = comp("locality") || comp("administrative_area_level_2");
  let state = comp("administrative_area_level_1");
  let postalCode = comp("postal_code");
  let country = comp("country");

  return {
    street,
    city,
    state,
    postalCode,
    country,
  };
};

export default PinDropMap;
