import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cartService } from "@/api/cartService";
import formatTime12Hour from "./timeFormatter";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function BookingSelectorDialog({
  open,
  onOpenChange,
  onSelect,
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchBookings = async () => {
      await cartService.getCustomerBookings().then((res) => {
        setBookings(res);
        setLoading(false);
      });
    };

    fetchBookings();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>Select a Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] w-full overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-gray-500">No bookings available.</p>
          ) : (
            [...bookings]
              .sort(
                (a, b) => new Date(b.booking_date) - new Date(a.booking_date)
              )
              .map((booking) => {
                const name = booking.subCategory?.name;
                const imageUrl = booking.subCategory?.icon_url
                  ? apiUrl + booking.subCategory.icon_url
                  : null;

                return (
                  <button
                    key={booking.booking_id}
                    onClick={() => onSelect(booking)}
                    className="w-full flex items-center gap-4 text-left p-2 rounded-md hover:bg-gray-100 transition"
                  >
                    {imageUrl ? (
                      <div className="relative w-14 h-14 rounded overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={name || "Service"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-800">
                        #{booking.booking_id} – {name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.booking_date}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime12Hour(booking.start_time)} –{" "}
                        {formatTime12Hour(booking.end_time)}
                      </p>
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
