"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const libraries = ["places"];
const containerStyle = {
  width: "100%",
  height: "400px",
};
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const SetLocationWithMap = ({
  initialLocation = null,
  onLocationSelect,
  countryRestriction = "in",
}) => {
  const [zoomLevel, setZoomLevel] = useState(6);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const prevValidCoordsRef = useRef(defaultCenter);
  const autocompleteRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [isLoading, setIsLoading] = useState(false);

  // Extract address details helper
  const extractAddressDetails = (place) => {
    const comp = (type) =>
      place.address_components?.find((c) => c.types.includes(type))
        ?.long_name || "";
    return {
      street: comp("route"),
      city: comp("locality"),
      state: comp("administrative_area_level_1"),
      country: comp("country"),
      postalCode: comp("postal_code"),
    };
  };

  // Initialize Autocomplete
  useEffect(() => {
    if (isLoaded && !autocompleteRef.current) {
      if (!inputRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: countryRestriction },
          fields: [
            "address_components",
            "geometry",
            "formatted_address",
            "name",
          ],
          types: [],
          language: "en",
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) {
          toast({
            title: "Error",
            description: "No details available for the input location.",
            variant: "destructive",
          });
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMarkerPosition({ lat, lng });
        setSearchInput(place.formatted_address || "");

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }

        if (onLocationSelect) {
          onLocationSelect({
            type: "point",
            coordinates: [lat, lng],
            address: place.formatted_address,
            name: place.name,
            details: extractAddressDetails(place),
          });
        }
      });
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, countryRestriction, onLocationSelect]);

  // Load initial location if provided
  useEffect(() => {
    if (initialLocation) {
      let coords;

      if (initialLocation.coordinates) {
        const [first, second] = initialLocation.coordinates;
        if (first >= -90 && first <= 90 && second >= -180 && second <= 180) {
          coords = { lat: first, lng: second };
        } else {
          coords = { lat: second, lng: first };
        }
      } else if (initialLocation.lat && initialLocation.lng) {
        coords = { lat: initialLocation.lat, lng: initialLocation.lng };
      } else {
        return;
      }

      setMarkerPosition(coords);
      setSearchInput(
        initialLocation.address || initialLocation.formatted_address || ""
      );

      setZoomLevel(15);
      if (mapRef.current) {
        mapRef.current.panTo(coords);
      }
    }
  }, [initialLocation]);

  // Reverse geocode to get address from lat/lng
  const fetchAddress = async (lat, lng) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`
      );
      const data = await res.json();
      if (data.results && data.results.length) {
        const place = data.results[0];
        setSearchInput(place.formatted_address || "");

        if (onLocationSelect) {
          onLocationSelect({
            type: "point",
            coordinates: [lat, lng],
            address: place.formatted_address,
            name: place.address_components?.[0]?.long_name || "",
            details: extractAddressDetails(place),
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to fetch address from location.",
        variant: "destructive",
      });
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
    const newPos = new window.google.maps.LatLng(lat, lng);

    const indiaBounds = mapRef.current?.indiaBounds;
    if (indiaBounds && !indiaBounds.contains(newPos)) {
      toast({
        title: "Outside allowed region",
        description: "Please select a location within India.",
        variant: "destructive",
      });

      setMarkerPosition(prevValidCoordsRef.current);
      if (mapRef.current) {
        mapRef.current.panTo(prevValidCoordsRef.current);
      }
      return;
    }

    prevValidCoordsRef.current = { lat, lng };
    setMarkerPosition({ lat, lng });
    debounceFetchAddress(lat, lng);
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!searchInput.trim()) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        {
          address: searchInput,
          componentRestrictions: { country: countryRestriction },
        },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const place = results[0];
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setMarkerPosition({ lat, lng });
            setSearchInput(place.formatted_address);

            if (mapRef.current) {
              mapRef.current.panTo({ lat, lng });
              mapRef.current.setZoom(15);
            }

            if (onLocationSelect) {
              onLocationSelect({
                type: "point",
                coordinates: [lat, lng],
                address: place.formatted_address,
                name: place.address_components?.[0]?.long_name || "",
                details: extractAddressDetails(place),
              });
            }
          } else {
            toast({
              title: "Error",
              description: "Location not found.",
              variant: "destructive",
            });
          }
        }
      );
    }
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
    setSearchInput("Detecting your location…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerPosition({ lat, lng });
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
        fetchAddress(lat, lng);
      },
      (error) => {
        setIsLoading(false);
        setSearchInput("");

        toast({
          title: "Location error",
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

  const validateInput = (e) => {
    const val = e.target.value;
    if (val.length > 100) {
      return;
    }

    setSearchInput(val);
  };

  if (loadError)
    return <p className="text-red-600">Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 w-full">
        <input
          id="location-input"
          ref={inputRef}
          type="text"
          className="flex-grow min-w-0 bg-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Search for a location"
          onKeyDown={onInputKeyDown}
          disabled={isLoading}
          autoComplete="off"
          spellCheck={false}
          value={searchInput}
          onChange={validateInput}
        />
        <button
          type="button"
          className={cn(
            "px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed",
            isLoading && "cursor-wait"
          )}
          onClick={onCurrentLocationClick}
          disabled={isLoading}
          title="Use Current Location"
        >
          <FaLocationCrosshairs className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {(searchInput || isLoading) && (
        <p className="text-sm text-gray-600 flex gap-2 items-center bg-gray-100 px-3 py-2 rounded-md">
          <span>📍</span>
          <span>{isLoading ? "Detecting your location…" : searchInput}</span>
        </p>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={zoomLevel}
        onLoad={(map) => {
          mapRef.current = map;

          const indiaBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(6.4627, 68.1097),
            new window.google.maps.LatLng(35.5133, 97.3953)
          );

          map.setOptions({
            restriction: {
              latLngBounds: indiaBounds,
              strictBounds: true,
            },
          });

          mapRef.current.indiaBounds = indiaBounds;
        }}
        options={{ streetViewControl: false }}
      >
        <Marker
          position={markerPosition}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
        />
      </GoogleMap>
    </div>
  );
};

export default SetLocationWithMap;
