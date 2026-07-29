import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { profileAPI } from "@/api/profile";
import { cartService } from "@/api/cartService";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import BookingAddressValidator from "./BookingAdressValidator";
import { CircleAlert, MapPin, Plus } from "lucide-react";
import LocationFlow from "../maps/LocationFlow";
import AddressSelector from "./AddressSelector";
import { Button } from "../ui/button";

const BookingForm = forwardRef(
  (
    {
      onBookingSubmit,
      cityId,
      city,
      selectedItems,
      categorySlug,
      subCategorySlug,
    },
    ref,
  ) => {
    const { toast } = useToast();
    const router = useRouter();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({
      bookingDate: null,
      startTime: "",
      serviceAddress: "",
      coordinates: { type: "Point", coordinates: [0, 0] },
      customerNotes: "",
      paymentMethod: "card",
    });

    const [validationError, setValidationError] = useState("");
    const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    const [isCityMismatchDialogOpen, setIsCityMismatchDialogOpen] =
      useState(false);
    const [mismatchedCity, setMismatchedCity] = useState("");

    const isToday = (date) => {
      const now = new Date();
      return (
        date &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    };

    const filterPastTimeSlots = useCallback((slots, selectedDate) => {
      if (!isToday(selectedDate)) return slots;
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const cutoffMinutes = nowMinutes + 60; // 1-hour buffer

      // If cutoff exceeds end of day, no slots should be shown
      if (cutoffMinutes >= 24 * 60) return [];

      return slots.filter((slot) => {
        const [h, m] = slot.split(":").map(Number);
        return h * 60 + m > cutoffMinutes;
      });
    }, []);

    const fetchAvailableTimeSlots = useCallback(
      async (date) => {
        if (
          !date ||
          !selectedItems?.length ||
          !selectedItems.every(
            (item) =>
              item.id && ["service_item", "package_item"].includes(item.type),
          )
        ) {
          setAvailableTimeSlots([]);
          setFilteredTimeSlots([]);
          setBookingDetails((prev) => ({ ...prev, startTime: "" }));
          return;
        }

        setIsLoadingSlots(true);
        try {
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

          const payload = {
            items: selectedItems.map((item) => ({
              item_id: item.id,
              type: item.type,
            })),
            date: dateStr,
            city_id: cityId,
          };

          const res = await cartService.getAvailableTimeSlotes(payload);
          const data = res.data?.data || res.data || res;
          let slots = [];

          if (Array.isArray(data)) {
            slots = data
              .filter((s) => s.status === "available")
              .map((s) => s.time);
          } else if (Array.isArray(data.slots)) {
            slots = data.slots
              .filter((s) => s.status === "available")
              .map((s) => s.time);
          }

          setAvailableTimeSlots(slots);
          const filtered = filterPastTimeSlots(slots, date);
          setFilteredTimeSlots(filtered);

          if (!filtered.includes(bookingDetails.startTime)) {
            setBookingDetails((prev) => ({ ...prev, startTime: "" }));
          }
        } catch {
          toast({
            title: "Error",
            description: "Failed to fetch time slots. Please try again.",
            variant: "destructive",
          });
          setAvailableTimeSlots([]);
          setFilteredTimeSlots([]);
          setBookingDetails((prev) => ({ ...prev, startTime: "" }));
        } finally {
          setIsLoadingSlots(false);
        }
      },
      [selectedItems, bookingDetails.startTime, toast, filterPastTimeSlots],
    );

    const debouncedFetch = useCallback(debounce(fetchAvailableTimeSlots, 300), [
      fetchAvailableTimeSlots,
    ]);

    const handleInputChange = (field, value) => {
      const normalized =
        field === "bookingDate" && value
          ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
          : value;

      setBookingDetails((prev) => ({
        ...prev,
        [field]: normalized,
      }));

      setValidationError("");
      if (field === "bookingDate") debouncedFetch(normalized);
    };

    useEffect(() => {
      (async () => {
        try {
          const res = await profileAPI.getAddresses();
          setSavedAddresses(res.data);
        } catch {
          // silent
        }
      })();
    }, [city]);

    useEffect(() => {
      const filtered = filterPastTimeSlots(
        availableTimeSlots,
        bookingDetails.bookingDate,
      );
      setFilteredTimeSlots(filtered);
      if (!filtered.includes(bookingDetails.startTime)) {
        setBookingDetails((prev) => ({ ...prev, startTime: "" }));
      }
    }, [bookingDetails.bookingDate, availableTimeSlots, filterPastTimeSlots]);

    const handleSubmit = async (e) => {
      if (e?.preventDefault) e.preventDefault();

      const { bookingDate, startTime, serviceAddress, coordinates } =
        bookingDetails;

      if (!bookingDate) return setValidationError("Please select a date");
      if (isDateDisabled(bookingDate))
        return setValidationError("You can only book for next 7 days");
      if (!startTime) return setValidationError("Please select a time slot");
      if (!serviceAddress.trim())
        return setValidationError("Please select or enter a service address");
      if (coordinates.coordinates[0] === 0 && coordinates.coordinates[1] === 0)
        return setValidationError("Invalid location coordinates");

      try {
        const date = bookingDate;
        const dateStr = date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0",
            )}-${String(date.getDate()).padStart(2, "0")}`
          : "";

        const payload = {
          cityId: "CTY001",
          items: selectedItems.map((item) => ({
            itemId: item.id,
            duration_hours: item.duration_hours || 0,
            duration_minutes: item.duration_minutes || 0,
            itemType: item.type,
            quantity: item.quantity || 1,
          })),
          bookingDate: dateStr,
          startTime: bookingDetails.startTime,
          serviceAddress: bookingDetails.serviceAddress,
          serviceLocation: bookingDetails.coordinates,
          subCategorySlug: subCategorySlug,
          customerNotes: bookingDetails.customerNotes,
          paymentMethod: bookingDetails.paymentMethod,
        };

        await onBookingSubmit(payload);
      } catch {
        toast({
          title: "Error",
          description: "Booking failed.",
          variant: "destructive",
        });
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    const handleAddressSelect = (addr) => {
      if (!addr) return;
      if (addr.value === "__add_new_address__") {
        setIsAddAddressModalOpen(true);
      } else {
        const address = addr.value;
        let coords = addr.location || { type: "Point", coordinates: [0, 0] };
        if (!addr.location) {
          toast({
            title: "Custom Address",
            description: "Save address to proceed.",
            variant: "warning",
          });
          return setIsAddAddressModalOpen(true);
        }

        setBookingDetails((prev) => ({
          ...prev,
          serviceAddress: address,
          coordinates: coords,
          type: addr.type || "",
        }));

        const selectedCity = addr.city?.toLowerCase() || "";
        const currentCity = city?.toLowerCase() || "";
        if (selectedCity && selectedCity !== currentCity) {
          setMismatchedCity(addr.city);
          setIsCityMismatchDialogOpen(true);
        }
      }
      setIsAddressSelectorOpen(false);
    };

    const handleOnSave = (newAddress) => {
      if (!newAddress) return;

      setSavedAddresses((prev) => [...prev, newAddress]);
      setBookingDetails((prev) => ({
        ...prev,
        serviceAddress: `${newAddress.line1}, ${newAddress.line2 || ""}, ${
          newAddress.city
        }, ${newAddress.state} - ${newAddress.postal_code}`,
        coordinates: newAddress.location,
        type: newAddress.type || "Saved Address",
      }));

      const selectedCity = newAddress.city?.toLowerCase() || "";
      const currentCity = city?.toLowerCase() || "";
      if (selectedCity && selectedCity !== currentCity) {
        setMismatchedCity(newAddress.city);
        setIsCityMismatchDialogOpen(true);
      }

      setIsAddAddressModalOpen(false);
    };

    const handleCityMismatchConfirm = () => {
      router.push(
        `/services/${mismatchedCity
          .toLowerCase()
          .replace(/\s+/g, "-")}/${categorySlug}/${subCategorySlug}`,
      );
      setIsCityMismatchDialogOpen(false);
    };

    const handleCityMismatchCancel = () => {
      setBookingDetails((prev) => ({
        ...prev,
        serviceAddress: "",
        coordinates: { type: "Point", coordinates: [0, 0] },
      }));
      setIsCityMismatchDialogOpen(false);
    };

    const isDateDisabled = (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      // Only allow today and next 7 days
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 7);

      return date < today || date > maxDate;
    };

    // Generate array of next 8 days (today + 7 future days)
    // If past 7-30 PM, skip today
    const getAvailableDates = () => {
      const dates = [];
      const now = new Date();
      const cutoffHour = 19;
      const cutoffMinute = 30;

      // offset
      let startOffset = 0;
      if (
        now.getHours() > cutoffHour ||
        (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)
      ) {
        startOffset = 1; // skip today
      }

      // return 8 days
      for (let i = startOffset; i < startOffset + 8; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        dates.push(date);
      }

      return dates;
    };

    const availableDates = getAvailableDates();

    const formatDateLabel = (date) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      } else {
        return format(date, "EEE, MMM dd");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none bg-muted/75">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Booking Details
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Fill in the details below to schedule your service.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            {/* --- Error Display --- */}
            {validationError && (
              <Alert
                variant="destructive"
                className="border-none bg-destructive/5"
              >
                <AlertDescription className="flex gap-2 items-center">
                  <CircleAlert className="size-4" /> {validationError}
                </AlertDescription>
              </Alert>
            )}

            {/* --- Schedule Section --- */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Date</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableDates.map((date, index) => {
                    const isSelected =
                      bookingDetails.bookingDate &&
                      date.toDateString() ===
                        bookingDetails.bookingDate.toDateString();
                    const dateStr = date.toISOString().split("T")[0];

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleInputChange("bookingDate", date)}
                        className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                          isSelected
                            ? "bg-[#5f60b9]/5 text-[var(--color-primary)] border-[var(--color-primary)]"
                            : "bg-white border-gray-200 hover:border-[#5f60b9]/50 hover:bg-[#5f60b9]/5"
                        }`}
                      >
                        <div className="text-xs font-medium opacity-75 mb-1">
                          {formatDateLabel(date)}
                        </div>
                        <div className="text-lg font-bold notranslate">
                          {date.getDate()}
                        </div>
                        <div className="text-xs opacity-75">
                          {format(date, "MMM")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Time Slot</label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("startTime", value)
                  }
                  value={bookingDetails.startTime}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSlots ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : filteredTimeSlots.length > 0 ? (
                      filteredTimeSlots.map((time) => (
                        <SelectItem
                          key={time}
                          value={time}
                          className="notranslate"
                        >
                          {time}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No available slots
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* --- Address Input --- */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">
                Service Address
              </label>

              {/* Trigger */}
              <div
                onClick={() => setIsAddressSelectorOpen(true)}
                className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-[#5f60b9]/30 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50"
              >
                {bookingDetails.serviceAddress ? (
                  <div className="flex flex-col lg:flex-row items-start gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-[#5f60b9]/10 to-[#7c7ce6]/10 border border-[#5f60b9]/10 flex items-center justify-center group-hover:border-[#5f60b9]/20 group-hover:bg-gradient-to-br group-hover:from-[#5f60b9]/15 group-hover:to-[#7c7ce6]/15 transition-all duration-300">
                      <MapPin className="size-4 text-[#5f60b9]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1 capitalize">
                        {bookingDetails.type || "Selected Address"}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed break-words">
                        {bookingDetails.serviceAddress}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#5f60b9] hover:bg-[#5f60b9]/10"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  /* Empty State Placeholder */
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200/80 border border-gray-200/50 flex items-center justify-center group-hover:border-[#5f60b9]/20 group-hover:bg-gradient-to-br group-hover:from-[#5f60b9]/5 group-hover:to-[#7c7ce6]/5 transition-all duration-300">
                      <Plus className="size-4 text-gray-400 group-hover:text-[#5f60b9] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        Select address
                      </p>
                      <p className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors hidden sm:block">
                        Choose from saved addresses or add new
                      </p>
                    </div>
                    <div className="text-xs text-[#5f60b9] font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">
                      Choose →
                    </div>
                  </div>
                )}

                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#5f60b9]/0 via-[#5f60b9]/1 to-[#5f60b9]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* --- Notes Section --- */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Special Instructions
              </label>
              <Textarea
                placeholder="Any special instructions for the provider..."
                value={bookingDetails.customerNotes}
                onChange={(e) =>
                  handleInputChange("customerNotes", e.target.value)
                }
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <LocationFlow
          city={city}
          isOpen={isAddAddressModalOpen}
          onClose={() => setIsAddAddressModalOpen(false)}
          onSave={handleOnSave}
        />

        {/* --- Address Selection Dialog --- */}
        <AddressSelector
          isOpen={isAddressSelectorOpen}
          onClose={() => setIsAddressSelectorOpen(false)}
          addresses={savedAddresses}
          onSelect={handleAddressSelect}
        />
        <Dialog
          open={isCityMismatchDialogOpen}
          onOpenChange={(state) => {
            setIsCityMismatchDialogOpen(state);
            handleCityMismatchCancel();
          }}
        >
          <BookingAddressValidator
            city={city}
            mismatchedCity={mismatchedCity}
            handleCityMismatchCancel={handleCityMismatchCancel}
            handleCityMismatchConfirm={handleCityMismatchConfirm}
            category={categorySlug}
            subCategory={subCategorySlug}
          />
        </Dialog>
      </form>
    );
  },
);

BookingForm.displayName = "BookingForm";

export default BookingForm;
