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
      <div className="p-4 border-b bg-gray-50 text-gray-700 flex items-center justify-between gap-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 p-1 rounded transition"
              aria-label="Back"
            >
              <ChevronLeft />
            </button>
          )}
          <span className="text-lg font-semibold">New Chat</span>
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
              className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-sm text-gray-500 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition flex items-center gap-3 select-none"
            >
              <Plus className="w-5 h-5 text-blue-500" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">
                  Assign a Booking
                </span>
                <span className="text-xs text-gray-400">
                  Click to choose from list
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                  placeholder="e.g. Issue with payment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
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
                className="w-full bg-[#5f60b9] text-white px-5 py-3 rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <SendHorizonal className="w-5 h-5" />
                Submit Ticket
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
