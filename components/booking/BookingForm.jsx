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
import { CircleAlert, MapPin, Plus, Calendar, Clock } from "lucide-react";
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

    const _fetchAvailableTimeSlots = fetchAvailableTimeSlots;
    const debouncedFetch = useCallback(debounce(_fetchAvailableTimeSlots, 300), [
      _fetchAvailableTimeSlots,
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

      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 7);

      return date < today || date > maxDate;
    };

    const getAvailableDates = () => {
      const dates = [];
      const now = new Date();
      const cutoffHour = 19;
      const cutoffMinute = 30;

      let startOffset = 0;
      if (
        now.getHours() > cutoffHour ||
        (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)
      ) {
        startOffset = 1;
      }

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
        return format(date, "EEE");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-neutral-200/60 shadow-sm rounded-[2rem] bg-white overflow-hidden text-left">
          <CardHeader className="border-b border-neutral-100 p-6">
            <CardTitle className="text-xl font-black text-neutral-900 uppercase tracking-tight">
              Booking Details
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-1">
              Select date, time slot, and saved address to finalize scheduling.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Error alerts */}
            {validationError && (
              <Alert
                variant="destructive"
                className="border-none bg-red-50 text-red-800 rounded-2xl"
              >
                <AlertDescription className="flex gap-2 items-center text-xs font-bold">
                  <CircleAlert className="size-4 text-red-600 shrink-0" />
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            {/* Date selection grid */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 pl-1 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-emerald-500" />
                Select Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableDates.map((date) => {
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
                      className={`p-3.5 rounded-2xl border text-center transition-all duration-250 flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-emerald-50/50 text-emerald-800 border-emerald-500 ring-1 ring-emerald-400"
                          : "bg-white border-neutral-200/70 hover:border-emerald-300 hover:bg-emerald-50/10 text-neutral-700"
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide opacity-80 mb-1">
                        {formatDateLabel(date)}
                      </div>
                      <div className="text-xl font-black tracking-tight notranslate">
                        {date.getDate()}
                      </div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">
                        {format(date, "MMM")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot select */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 pl-1 flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-500" />
                Select Time Slot
              </label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("startTime", value)
                }
                value={bookingDetails.startTime}
              >
                <SelectTrigger className="h-12 rounded-xl border-neutral-200/80 focus:ring-emerald-500/20 text-xs font-bold text-neutral-800">
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-lg border border-neutral-200/50">
                  {isLoadingSlots ? (
                    <SelectItem value="loading" disabled className="text-xs font-bold">
                      Loading...
                    </SelectItem>
                  ) : filteredTimeSlots.length > 0 ? (
                    filteredTimeSlots.map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className="notranslate text-xs font-bold"
                      >
                        {time}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled className="text-xs font-bold">
                      No available slots
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Service Address trigger panel */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 pl-1 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-emerald-500" />
                Service Address
              </label>

              <div
                onClick={() => setIsAddressSelectorOpen(true)}
                className="group relative overflow-hidden rounded-2xl bg-white border border-neutral-200/80 hover:border-emerald-500/30 p-4 cursor-pointer transition-all duration-300 hover:shadow-md"
              >
                {bookingDetails.serviceAddress ? (
                  <div className="flex flex-col lg:flex-row items-start gap-3 relative z-10">
                    <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <MapPin className="size-4.5 text-emerald-500" />
                    </div>

                    <div className="flex-1 min-w-0 pr-12 text-left">
                      <p className="font-extrabold text-neutral-900 text-xs uppercase tracking-wide mb-1 capitalize">
                        {bookingDetails.type || "Selected Address"}
                      </p>
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                        {bookingDetails.serviceAddress}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg px-2.5 h-8"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="size-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                      <Plus className="size-4.5 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-extrabold text-xs text-neutral-700 group-hover:text-neutral-900 transition-colors uppercase tracking-wider">
                        Select address
                      </p>
                      <p className="text-[10px] text-neutral-400 font-bold group-hover:text-neutral-500 transition-colors hidden sm:block">
                        Choose from saved addresses or add new location
                      </p>
                    </div>
                    <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-200">
                      Choose &rarr;
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions text area */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 pl-1">
                Special Instructions
              </label>
              <Textarea
                placeholder="Any specific requests or directions for the service expert..."
                value={bookingDetails.customerNotes}
                onChange={(e) =>
                  handleInputChange("customerNotes", e.target.value)
                }
                rows={5}
                className="rounded-xl border-neutral-200/80 text-xs font-medium focus:ring-emerald-500/20"
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
