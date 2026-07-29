import { ChevronLeft, SendHorizonal, Plus } from "lucide-react";
import BookingSelectorDialog from "./BookingSelectorDialog";
import formatTime12Hour from "./timeFormatter";
import { useState } from "react";
import api from "@/utils/api";

export default function CreateTicketForm({
  booking: initialBooking = null,
  providerId = null,
  onCreated,
  onBack,
}) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [booking, setBooking] = useState(initialBooking);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await api.post("/tickets", {
        title,
        message,
        provider_id: providerId,
        booking_id: booking?.booking_id,
      });

      setSuccess(true);
      setTitle("");
      setMessage("");
      if (onCreated) onCreated(res.data.ticket_id);
    } catch (err) {
      setError("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full lg:border lg:rounded-lg">
      <div className="p-4 border-b bg-neutral-50 text-neutral-800 flex items-center justify-between gap-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-neutral-500 hover:text-black p-1 rounded-lg transition hover:bg-neutral-200/50"
              aria-label="Back"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <span className="text-sm font-extrabold uppercase tracking-wider text-neutral-850">Create Support Ticket</span>
        </div>
      </div>

      <div className="p-2 overflow-auto flex flex-col">
        {booking || providerId ? (
          <div className="flex flex-wrap gap-3 p-4 mx-4 mt-4 bg-gray-100 rounded-md shadow-sm">
            {booking && (
              <div className="flex flex-col space-y-1 w-full max-w-xl text-sm text-gray-700">
                <h2 className="text-base font-semibold text-gray-900">
                  Booking Details
                </h2>
                <p className="font-medium text-gray-800">
                  Booking:{" "}
                  <span className="font-normal">{booking.booking_id}</span> –{" "}
                  <span className="font-normal">
                    {booking?.subCategory?.name}
                  </span>
                </p>
                <p>
                  Date:{" "}
                  <span className="font-normal">{booking.booking_date}</span>
                </p>
                <p>
                  Time:{" "}
                  <span className="font-normal">
                    {formatTime12Hour(booking.start_time)} –{" "}
                    {formatTime12Hour(booking.end_time)}
                  </span>
                </p>

                <button
                  onClick={() => setBooking(null)}
                  className="w-fit font-semibold pt-2 text-destructive hover:text-destructive/80 transition"
                >
                  Remove
                </button>
              </div>
            )}
            {providerId && (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full self-start">
                Provider ID: {providerId}
              </span>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div
              onClick={() => setShowDialog(true)}
              className="w-full border-2 border-dashed border-neutral-200 rounded-2xl p-5 text-sm text-neutral-500 hover:border-[#10b981] hover:bg-emerald-50/30 cursor-pointer transition-all flex items-center gap-3.5 select-none"
            >
              <Plus className="w-5 h-5 text-[#10b981]" />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-neutral-700 text-xs uppercase tracking-wide">
                  Assign a Booking ID
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  Select an existing order from your account history
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <form
            onSubmit={handleSubmit}
            className="h-full flex flex-col justify-between"
          >
            <div className="flex-1 space-y-6 p-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 mb-1.5 text-left">
                  Ticket Subject / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/25 focus:border-[#10b981] transition-all bg-neutral-50"
                  placeholder="e.g. Issue with payment"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 mb-1.5 text-left">
                  Detailed Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/25 focus:border-[#10b981] transition-all bg-neutral-50"
                  placeholder="Describe your issue..."
                />
              </div>

              {success && (
                <p className="text-green-600 text-sm font-medium">
                  Ticket created successfully!
                </p>
              )}
              {error && (
                <p className="text-red-600 text-sm font-medium">{error}</p>
              )}
            </div>

            <div className="px-4 py-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white px-5 py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                <SendHorizonal className="w-4 h-4 text-emerald-400" />
                Submit Support Ticket
              </button>
            </div>
          </form>
        </div>
      </div>

      <BookingSelectorDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSelect={(selectedBooking) => {
          setBooking(selectedBooking);
          setShowDialog(false);
        }}
      />
    </div>
  );
}
