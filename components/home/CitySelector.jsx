"use client";
import React, { useState, useEffect } from "react";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { serviceAPI } from "../../api/services";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "@mui/icons-material";
import { MapPin } from "lucide-react";

const CitySelector = () => {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await serviceAPI.getCities();
      setCities(response.data || []);
      setFilteredCities(response.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredCities(cities);
      setShowDropdown(true);
      return;
    }

    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredCities(filtered);
    setShowDropdown(true);
  };

  const handleCitySelect = (cityName) => {
    setSearchTerm(cityName);
    setFilteredCities([]);
    setShowDropdown(false);
    router.push(`/services/${cityName.toLowerCase()}`);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );

            const data = await response.json();
            const results = data.results;

            const cityComponent = results[0]?.address_components.find(
              (component) => component.types.includes("locality")
            );

            const cityName = cityComponent?.long_name;

            if (cityName) {
              handleCitySelect(cityName);
            } else {
              alert("Unable to detect your city.");
            }
          } catch (error) {
            console.error("Error with geocoding:", error);
            alert("Failed to retrieve location.");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Permission denied or error in fetching location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-4 top-[1.8rem] lg:top-[2.05rem] transform -translate-y-1/2 text-black size-6 lg:size-8" />

          <input
            type="text"
            className="p-3 pl-12 lg:pl-[3.7rem] w-full h-14 lg:h-16 border placeholder:text-black placeholder:text-base lg:placeholder:text-xl text-xl text-black focus:placeholder:text-transparent placeholder:font-medium border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-all duration-300"
            placeholder={"Select your location..."}
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => {
              if (searchTerm.trim() === "") {
                setFilteredCities(cities);
              }
              setShowDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
        </div>

        <button
          onClick={handleGetLocation}
          className="flex items-center justify-center size-14 aspect-square lg:size-16 bg-indigo-500 text-white rounded-xl hover:bg-blue-600 transition ml-4 shadow-md hover:shadow-lg"
        >
          <FaLocationCrosshairs size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bg-white border mt-1 border-gray-200 w-[calc(100%-5rem)] rounded-lg shadow-lg overflow-hidden z-20"
            style={{
              boxShadow:
                "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="overflow-y-auto max-h-[180px] md:max-h-[220px] custom-scrollbar">
              {filteredCities.length > 0 ? (
                filteredCities.map((city, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.15,
                      delay: index * 0.02,
                      ease: "easeOut",
                    }}
                    className={`px-4 py-2.5 cursor-pointer transition-all duration-150 border-b border-gray-50 last:border-b-0 ${
                      hoveredIndex === index
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCitySelect(city.name);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin
                        className={`size-3.5 ${
                          hoveredIndex === index
                            ? "text-indigo-500"
                            : "text-gray-400"
                        } transition-colors duration-150`}
                      />
                      <span className="font-medium text-sm">{city.name}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-6 text-center"
                >
                  <div className="text-gray-400 text-lg mb-1.5">🏙️</div>
                  <div className="text-gray-600 font-medium text-sm">
                    We Will Be Available Soon...
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Stay tuned for more locations
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #3b82f6);
          border-radius: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #2563eb);
        }
      `}</style>
    </div>
  );
};

export default CitySelector;
