"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { useUserLocation } from "@/src/hooks/useUserLocation";
import { Button } from "@/components/ui/button";
import { serviceAPI } from "@/api/services";
import { cn } from "@/lib/utils";

export function LocationSwitcher() {
  const { city } = useUserLocation();
  const [cities, setCities] = useState(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    serviceAPI
      .getCities()
      .then((response) => {
        setCities(response.data.map((city) => city.name));
      })
      .catch((error) => {
        console.error("Error fetching cities:", error);
      });
  }, []);

  useEffect(() => {
    setValue(city);
  }, [city]);

  const handleSelect = (city) => {
    setValue(city);
    setOpen(false);

    document.cookie = `current-location=${encodeURIComponent(
      city
    )}; path=/; max-age=${30 * 24 * 60 * 60}`;

    router.push("/services");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left group py-[1.85rem] px-2.5 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br to-[var(--color-primary)] from-[var(--color-primary-gradient)] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 max-w-[140px] sm:max-w-[280px] truncate break-all">
                {value && cities?.includes(value)
                  ? `${value}, India`
                  : "Select your city"}
              </div>
              <div className="text-xs text-gray-500">Change location</div>
            </div>
          </div>
          <ChevronsUpDown className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" side="bottom" align="start">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandEmpty>No city found.</CommandEmpty>
          <CommandGroup>
            {cities?.map((city) => (
              <CommandItem key={city} onSelect={() => handleSelect(city)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === city ? "opacity-100" : "opacity-0"
                  )}
                />
                {city}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
