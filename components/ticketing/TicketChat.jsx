import { useSocketNotifications } from "@/src/context/SocketNotificationContext";
import { ChevronLeft, SendHorizonal } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import TicketCloseDialog from "./TicketCloseDialog";
import { useMobile } from "@/src/hooks/useMobile";
import { Badge } from "../ui/badge";
import api from "@/utils/api";
import { cn } from "@/lib/utils";

function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

function groupMessagesByDate(messages) {
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return sortedMessages.reduce((groups, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});
}

export default function TicketChat({
  ticketId,
  currentUserId,
  onCloseTicket,
  onBack,
}) {
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = useMobile();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { ticketReplyEvent } = useSocketNotifications();

  const fetchTicket = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      setTicket(res.data);
    } catch (e) {
      console.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (ticketReplyEvent?.ticketId === ticketId) {
      const newMessage = ticketReplyEvent.message;
      if (!newMessage) return;

      setTicket((prevTicket) => {
        if (!prevTicket) return prevTicket; // safeguard
        return {
          ...prevTicket,
          messages: [...(prevTicket.messages || []), newMessage],
        };
      });
    }
  }, [ticketReplyEvent?.eventId, ticketId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!message.trim() || !ticket) return;
    try {
      setSending(true);
      await api.post(`/tickets/${ticket.ticket_id}/reply`, { message });
      const updated = await api.get(`/tickets/${ticket.ticket_id}`);
      setTicket(updated.data);
      setMessage("");
      inputRef.current?.focus({ preventScroll: true });
      scrollToBottom();
    } catch (err) {
      console.error("Send failed");
    } finally {
      setSending(false);
    }
  };

  if (!ticketId)
    return (
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
        Select a conversation
      </div>
    );

  if (loading) return <div className="flex-1 p-4">Loading...</div>;

  const groupedMessages = groupMessagesByDate(ticket.messages);

  return (
    <div
      className={cn(
        "flex flex-col flex-1 h-full min-h-0 overflow-hidden lg:border lg:rounded-lg",
        { "py-[4.2rem]": isMobile, "pt-[13rem]": isMobile && ticket.booking }
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b font-semibold text-gray-700 flex items-center justify-between gap-4",
          { "fixed top-16 bg-white w-full z-10": isMobile }
        )}
      >
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
          <span className="text-sm font-extrabold uppercase tracking-wider text-neutral-800">{ticket.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {ticket.status === "closed" ? (
            <Badge className="bg-red-100 text-red-800">Closed</Badge>
          ) : onCloseTicket ? (
            <TicketCloseDialog onCloseTicket={onCloseTicket} />
          ) : (
            <Badge className="bg-green-100 text-green-800">Open</Badge>
          )}
        </div>
      </div>

      {/* Booking Details */}
      {ticket.booking && (
        <div
          className={cn("bg-white border-b px-4 py-3 text-sm text-gray-700", {
            "fixed top-[8.05rem] w-full z-10": isMobile,
          })}
        >
          <div className="font-medium text-gray-800 mb-1">Booking Details</div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="space-y-1">
              <p>
                <span className="font-semibold">Customer:</span>{" "}
                {ticket.creator?.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Service:</span>{" "}
                {ticket.booking?.BookingItems[0]?.serviceItem?.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(ticket.booking.booking_date).toLocaleString()}
              </p>
            </div>
            <div className="text-gray-500 text-xs mt-auto">
              Booking ID:{" "}
              <span className="font-mono">{ticket.booking.booking_id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4"
      >
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="flex flex-col gap-3">
            <div className="flex justify-center py-2 items-center">
              <span className="text-gray-500 text-xs font-medium mx-3 bg-gray-200/50 rounded-md px-4 py-1">
                {formatDate(date)}
              </span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.message_id}
                  className={cn(
                    "max-w-xs md:max-w-sm px-4 py-3 rounded-2xl shadow-sm text-xs leading-relaxed",
                    {
                      "bg-emerald-50 text-emerald-950 border border-emerald-100/50 self-end text-left rounded-tr-none": isUser,
                      "bg-white border border-neutral-200 self-start text-left rounded-tl-none": !isUser,
                    }
                  )}
                >
                  <p className="font-semibold">{msg.message}</p>
                  <div className="text-[10px] text-neutral-400 mt-1.5 text-right font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {/* Invisible element at the end to scroll into view */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {ticket.status !== "closed" ? (
        <div
          className={cn("p-4 border-t flex gap-2 bg-white", {
            "fixed bottom-0 w-full z-10": isMobile,
          })}
        >
          <input
            ref={inputRef}
            type="text"
            className="flex-1 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/25 focus:border-[#10b981] min-w-0 bg-neutral-50"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            className="bg-black text-white hover:bg-neutral-800 px-5 py-3 rounded-xl flex gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md text-xs font-black uppercase tracking-wider active:scale-95"
            disabled={sending}
          >
            <span className="hidden md:inline">Send</span>
            <SendHorizonal className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      ) : (
        <div className="p-4 border-t bg-gray-100 text-center text-gray-500 text-sm italic">
          You cannot reply to a closed ticket.
        </div>
      )}
    </div>
  );
}
