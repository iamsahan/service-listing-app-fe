import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { adminBookingService } from "@/api/adminBookingService";

export function ProviderBookings({ open, providerId, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProviderBookings = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data =
        await adminBookingService.getAllBookingsForServiceProvider(id);
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch provider bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setBookings([]);
    setError(null);
  };

  useEffect(() => {
    if (open && providerId) {
      fetchProviderBookings(providerId);
    }
  }, [open, providerId]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg max-h-[70vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold">
          Provider Bookings
        </DialogTitle>

        {/* Loading */}
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Loading bookings…
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="py-4 px-3 rounded-md bg-red-50 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No bookings found for this provider.
          </div>
        )}

        {/* Booking list */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.booking_id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    Booking #{booking.booking_id}
                  </span>
                  <span className="capitalize text-xs px-2 py-1 rounded-full bg-gray-100">
                    {booking.status || "N/A"}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      ₹ {booking.BookingPayment?.total_amount || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Subcategory</p>
                    <p className="font-medium">
                      {booking.subCategory?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">
                      {booking.customer?.name || "N/A"}{" "}
                      {booking.customer?.u_id &&
                        `(ID: ${booking.customer.u_id})`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
