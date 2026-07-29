"use client";
import React, { useState, useEffect } from "react";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { serviceAPI } from "../../api/services";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronRight, Sparkles, Navigation } from "lucide-react";

const CitySelector = () => {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

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
      
      {/* Unified Input Wrapper */}
      <div 
        className={`flex items-center bg-white border rounded-2xl p-1.5 transition-all duration-300 ${
          isFocused 
            ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-md" 
            : "border-neutral-200 hover:border-neutral-300 shadow-sm"
        }`}
      >
        <Search 
          className={`size-5 ml-3 shrink-0 transition-colors duration-300 ${
            isFocused ? "text-emerald-500 animate-pulse" : "text-neutral-400"
          }`} 
        />

        <input
          type="text"
          className="w-full bg-transparent py-2.5 lg:py-3.5 pl-3 pr-4 text-neutral-800 focus:outline-none placeholder:text-neutral-400 text-sm sm:text-base font-semibold"
          placeholder="Select your location..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => {
            setIsFocused(true);
            if (searchTerm.trim() === "") {
              setFilteredCities(cities);
            }
            setShowDropdown(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />

        {/* Integrated GPS detector */}
        <button
          onClick={handleGetLocation}
          className="p-3 lg:p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all shadow-sm shrink-0 flex items-center justify-center group relative overflow-hidden"
          title="Detect location"
        >
          <span className="absolute inset-0 rounded-xl bg-emerald-400 opacity-20 animate-ping group-hover:block hidden" />
          <Navigation size={15} className="group-hover:rotate-45 transition-transform duration-500 relative z-10" />
        </button>
      </div>

      {/* Popular cities pill shortcuts */}
      <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-left">
        <span className="text-neutral-400 font-extrabold uppercase text-[9px] tracking-wider pl-1.5 flex items-center gap-1">
          Popular Hubs:
        </span>
        {["Mumbai", "Delhi", "Bangalore", "Hyderabad"].map((cityName) => (
          <button
            key={cityName}
            onMouseDown={(e) => {
              e.preventDefault();
              handleCitySelect(cityName);
            }}
            className="px-3.5 py-1.5 rounded-full bg-neutral-50 hover:bg-emerald-50 border border-neutral-200/50 hover:border-emerald-300 hover:text-emerald-700 font-bold transition-all duration-200 shadow-sm text-[11px]"
          >
            {cityName}
          </button>
        ))}
      </div>

      {/* Smart popup suggest menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bg-white/95 backdrop-blur-md border border-neutral-200 w-full mt-2.5 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5"
          >
            {/* Quick detect cell */}
            {searchTerm.trim() === "" && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleGetLocation();
                }}
                className="w-full p-3 border-b border-neutral-100 flex items-center justify-between text-left hover:bg-neutral-50 rounded-xl transition-colors group mb-1.5"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
                    <FaLocationCrosshairs size={13} className="animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold text-neutral-800">Detect current location</p>
                    <p className="text-[10px] text-neutral-400">Identify location automatically</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

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
                    className={`px-4 py-3.5 cursor-pointer transition-all duration-200 border-b border-neutral-50 last:border-b-0 flex items-center justify-between rounded-xl ${
                      hoveredIndex === index
                        ? "bg-emerald-50 text-emerald-800 border-l-4 border-l-emerald-500 pl-3 font-semibold"
                        : "bg-white text-neutral-700"
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
                        className={`size-4 ${
                          hoveredIndex === index
                            ? "text-[#10b981]"
                            : "text-neutral-400"
                        } transition-colors duration-150`}
                      />
                      <span className="text-xs font-bold">{city.name}</span>
                    </div>
                    <ChevronRight className={`size-3.5 ${
                      hoveredIndex === index ? "text-emerald-500 translate-x-0.5" : "text-neutral-300"
                    } transition-all`} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-6 text-center bg-amber-50/50 border border-amber-100 rounded-xl m-1.5 animate-pulse"
                >
                  <div className="text-amber-500 text-2xl mb-1.5">🏙️</div>
                  <div className="text-amber-800 font-bold text-sm">
                    We Will Be Available Soon...
                  </div>
                  <div className="text-amber-600/80 text-xs mt-1">
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
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f5;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #10b981, #f59e0b);
          border-radius: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #059669, #d97706);
        }
      `}</style>
    </div>
  );
};

export default CitySelector;
