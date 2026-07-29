"use client";

import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import Image from "next/image";
import { serviceAPI } from "@/api/services";
import { locationAPI } from "@/api/locationService";

// Cookie helper
export function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; SameSite=Lax`;
}

export default function LocationInitializer() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval = null;
    let timeout = null;

    // Fallback function for reverse geocoding when backend mapping fails
    const fallbackToReverseGeocoding = async (latitude, longitude) => {
      try {
        const res = await fetch(
          `/next-api/location?latitude=${latitude}&longitude=${longitude}`
        );

        if (!res.ok) {
          handleFailure("Failed to fetch city from server.");
          return;
        }

        const data = await res.json();
        const city = data.city || "Unknown";

        // Try to validate the city name against database to ensure proper casing
        try {
          const citiesResponse = await serviceAPI.getCities();
          const matchedCity = citiesResponse.data.find(
            (dbCity) => dbCity.name.toLowerCase() === city.toLowerCase()
          );

          if (matchedCity) {
            console.log(
              `Fallback - City validated: ${city} -> ${matchedCity.name}`
            );
            handleSuccess(matchedCity.name);
          } else {
            console.log(
              `Fallback - City not found in database: ${city}, using original`
            );
            handleSuccess(city);
          }
        } catch (dbError) {
          console.warn("Fallback - City database validation failed:", dbError);
          handleSuccess(city);
        }
      } catch (error) {
        console.error("Fallback reverse geocoding failed:", error);
        handleFailure("Unable to determine your location. Please try again.");
      }
    };

    const detectCity = async () => {
      console.log("LocationInitializer: Starting location detection...");
      
      if (!navigator.geolocation) {
        console.error("LocationInitializer: Geolocation not supported");
        handleFailure("Geolocation is not supported by your browser.");
        return;
      }

      console.log("LocationInitializer: Geolocation is supported, requesting position...");

      // Progress animation while detecting
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 100);

      // Timeout safeguard
      timeout = setTimeout(() => {
        console.warn("Location detection timed out.");
        handleFailure("Location detection timed out.");
      }, 15000);

      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            console.log("LocationInitializer: Geolocation position received:", position);
            
            const { latitude, longitude } = position.coords;

            console.log(`LocationInitializer: Extracted coordinates - lat=${latitude}, lng=${longitude}`);

            if (!latitude || !longitude) {
              console.error("LocationInitializer: Invalid coordinates received");
              handleFailure("Invalid coordinates received.");
              return;
            }

            try {
              // Send coordinates to backend for city mapping
              console.log(`LocationInitializer: Sending coordinates to backend: lat=${latitude}, lng=${longitude}`);
              const data = await locationAPI.mapUserToCity(latitude, longitude);
              console.log("LocationInitializer: Backend response:", data);

              if (data.success && data.data?.mappedCity) {
                // Successfully mapped to a city
                console.log(`Location mapped to city: ${data.data.mappedCity}`);
                handleSuccess(data.data.mappedCity);
              } else if (data.data?.nearestCity) {
                // No exact mapping found, but nearest city available
                console.log(
                  `No exact mapping found. Nearest city: ${data.data.nearestCity}`
                );
                handleSuccess(data.data.nearestCity);
              } else {
                // Fallback to reverse geocoding if backend mapping fails
                console.warn(
                  "Backend city mapping failed, falling back to reverse geocoding"
                );
                await fallbackToReverseGeocoding(latitude, longitude);
              }
            } catch (error) {
              console.error("Backend city mapping error:", error);
              console.error("Error details:", error.message);
              // Fallback to reverse geocoding on API error
              await fallbackToReverseGeocoding(latitude, longitude);
            }
          },
          (geoError) => {
            let message = "Geolocation error.";
            switch (geoError.code) {
              case geoError.PERMISSION_DENIED:
                message =
                  "Location permission denied. Please allow location access in your browser settings.";
                break;
              case geoError.POSITION_UNAVAILABLE:
                message =
                  "Location information is unavailable. Try moving to a different location or check your device settings.";
                break;
              case geoError.TIMEOUT:
                message =
                  "Location request timed out. Please try again or ensure your device has a stable GPS signal.";
                break;
              default:
                message = "An unknown geolocation error occurred.";
            }
            console.warn("Geolocation failed:", geoError.message);
            handleFailure(message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } catch (err) {
        console.error("Unexpected error:", err);
        handleFailure("Unexpected error occurred. Please try again later.");
      }
    };

    const handleSuccess = (city) => {
      cleanup();
      setCookie("current-location", city);
      setProgress(100);
      setTimeout(() => (window.location.href = "/services"), 500);
    };

    const handleFailure = (reason) => {
      console.error("Location detection failed:", reason);
      cleanup();
      setCookie("current-location", "Unknown");
      setProgress(100);
      // Reload so the layout or page can handle the Unknown location state
      setTimeout(() => window.location.reload(), 500);
    };

    const cleanup = () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };

    detectCity();

    return () => cleanup();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f8fafc] z-[9999] overflow-hidden text-center px-4">
      <Image
        src="/assets/images/prohive_logo.png"
        alt="ProHive Logo"
        width={150}
        height={150}
        className="mb-6 animate-pulse"
        priority
      />

      <Progress value={progress} className="w-64 h-1.5 bg-gray-200" />

      {/* On failure we immediately reload; no error UI */}
    </div>
  );
}
