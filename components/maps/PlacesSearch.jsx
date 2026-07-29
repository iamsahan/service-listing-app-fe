"use client";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Locate, MapPin, Search } from "lucide-react";
import { DialogTitle } from "../ui/dialog";

const PlacesSearch = ({
  onLocationFound,
  countryRestriction = "in",
  className,
  isLoaded,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Initialize Places services
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }
  }, [isLoaded]);

  // Extract address details helper
  const extractAddressDetails = (place) => {
    const comp = (type) =>
      place.address_components?.find((c) => c.types.includes(type))
        ?.long_name || "";
    return {
      street: comp("route") || "",
      city: comp("locality") || "",
      state: comp("administrative_area_level_1") || "",
      country: comp("country") || "",
      postalCode: comp("postal_code") || "",
    };
  };

  // Debounced search
  const handleSearch = (query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim() || !autocompleteService.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: countryRestriction },
          types: [],
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setSuggestions(predictions || []);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    }, 300);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    handleSearch(value);
  };

  const handleSuggestionClick = (placeId, description) => {
    if (!placesService.current) return;

    setIsLoading(true);
    setSearchInput(description);
    setShowSuggestions(false);

    placesService.current.getDetails(
      {
        placeId,
        fields: [
          "address_components",
          "geometry",
          "formatted_address",
          "name",
          "vicinity",
        ],
      },
      (place, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          const locationData = {
            coordinates: { lat, lng },
            address: place.formatted_address,
            name: place.name || description || place.vicinity,
            details: extractAddressDetails(place),
          };

          onLocationFound(locationData);
        } else {
          toast({
            title: "Error",
            description:
              "Could not get place details. Please try another location.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleCurrentLocation = () => {
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
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => {
            setIsLoading(false);
            if (data.results && data.results.length) {
              const place =
                data.results.find(
                  (r) =>
                    r.types.includes("street_address") ||
                    r.types.includes("premise")
                ) || data.results[0];

              const locationData = {
                coordinates: { lat, lng },
                address: place.formatted_address,
                details: extractAddressDetails(place),
              };

              setSearchInput(place.formatted_address);
              onLocationFound(locationData);
            } else {
              toast({
                title: "Error",
                description: "Could not determine your address.",
                variant: "destructive",
              });
              setSearchInput("");
            }
          })
          .catch(() => {
            setIsLoading(false);
            setSearchInput("");
            toast({
              title: "Error",
              description: "Failed to get your location address.",
              variant: "destructive",
            });
          });
      },
      (error) => {
        setIsLoading(false);
        setSearchInput("");
        toast({
          title: "Location error",
          description:
            error.code === error.PERMISSION_DENIED
              ? "Please allow location access to use this feature."
              : "Unable to retrieve your location. Please try searching manually.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(
        suggestions[0].place_id,
        suggestions[0].description
      );
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading search...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "transition-all duration-300",
          showSuggestions ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100"
        )}
      >
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-16 h-16 bg-[#5f60b9]/10 rounded-full flex items-center justify-center">
            <Search className="text-[#5f60b9] text-xl" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Find Your Location
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            Search for an address or use your current location
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <Input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for an address, landmark, or area..."
            disabled={isLoading}
            className="pl-10 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl w-full max-w-full"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Inline Suggestions */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden w-full max-w-full",
            showSuggestions
              ? "max-h-[60vh] mt-3 opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() =>
                handleSuggestionClick(
                  suggestion.place_id,
                  suggestion.description
                )
              }
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start space-x-3 transition-colors duration-150"
            >
              <MapPin className="text-gray-400 mt-1 text-sm flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 break-words whitespace-normal">
                  {suggestion.structured_formatting?.main_text ||
                    suggestion.description}
                </div>

                {suggestion.structured_formatting?.secondary_text && (
                  <div className="text-xs text-gray-500 break-words whitespace-normal mt-1">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* No results */}
          {showSuggestions &&
            suggestions.length === 0 &&
            searchInput.trim() &&
            !isLoading && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No locations found. Try a different search term.
              </div>
            )}
        </div>
      </div>

      {/* Current Location */}
      <div
        className={cn(
          "transition-all duration-300",
          showSuggestions ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100"
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">or</span>
          </div>
        </div>

        <Button
          onClick={handleCurrentLocation}
          disabled={isLoading}
          variant="outline"
          className="w-full mt-4 py-3 border-2 border-gray-200 hover:border-[#5f60b9] hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Locate
            className={cn("text-[#5f60b9]", isLoading && "animate-spin")}
          />
          <span className="text-gray-700">Use Current Location</span>
        </Button>
      </div>
    </div>
  );
};

export default PlacesSearch;
