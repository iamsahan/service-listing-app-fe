import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, MessageSquare } from "lucide-react";
import Pagination from "./Pagination";
import { cn } from "@/lib/utils";
import { useMobile } from "@/src/hooks/useMobile";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function TicketList({
  tickets,
  selectedId,
  onSelect,
  page,
  totalPages,
  onPageChange,
}) {
  const isMobile = useMobile();
  const activeTickets = tickets?.filter((t) => t.status !== "closed") || [];
  const closedTickets = tickets?.filter((t) => t.status === "closed") || [];

  const renderTicket = (ticket, index, total) => {
    const lastMessage = ticket.last_message || "No messages yet";
    const time = formatTime(ticket.last_message_at || ticket.updatedAt);
    const isLast = index === total - 1;

    return (
      <div
        key={ticket.ticket_id}
        onClick={() => onSelect(ticket.ticket_id)}
        className={`cursor-pointer px-4 py-3 transition-colors rounded-md hover:bg-gray-50 ${
          selectedId === ticket.ticket_id ? "bg-[#5f60b9]/10" : ""
        } ${!isLast ? "border-b border-gray-200" : ""}`}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/assets/images/def_pro.webp" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-gray-800 truncate">
                {ticket.title}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {time}
              </span>
            </div>

            <div
              className={`text-sm truncate ${
                lastMessage === "No messages yet"
                  ? "text-gray-400 italic"
                  : "text-gray-600"
              }`}
            >
              {lastMessage}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col gap-0 bg-white shadow-sm lg:rounded-lg overflow-hidden lg:border",
        {
          "pt-16 pb-20": isMobile,
        }
      )}
    >
      <div
        className={cn(
          "p-4 text-lg font-semibold bg-muted flex items-center gap-2",
          {
            "fixed top-16 w-full shadow z-10": isMobile,
          }
        )}
      >
        <MessageSquare className="text-[#5f60b9] stroke-2" />
        <h2 className="text-gray-800">Contact Support</h2>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {tickets && tickets.length > 0 ? (
          <>
            <div className="pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
                Active Chats
              </h3>
              {activeTickets.length > 0 ? (
                activeTickets.map((ticket, i) =>
                  renderTicket(ticket, i, activeTickets.length)
                )
              ) : (
                <div className="px-4 py-2 text-sm text-gray-400">
                  No active chats.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
                Closed Chats
              </h3>
              {closedTickets.length > 0 ? (
                closedTickets.map((ticket, i) =>
                  renderTicket(ticket, i, closedTickets.length)
                )
              ) : (
                <div className="px-4 py-2 text-sm text-gray-400">
                  No closed chats.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="px-4 py-10 text-sm text-gray-500 text-center">
            You don&apos;t have any chats yet.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="border-t">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <div
        className={cn("p-4 border-t bg-white", {
          "fixed bottom-0 w-full": isMobile,
        })}
      >
        <button
          onClick={() => onSelect("new")}
          className="w-full flex gap-2 items-center justify-center text-sm font-medium py-3 bg-[#5f60b9] text-white rounded-md hover:bg-[#4a4bb0] transition-colors"
        >
          <Edit className="size-5" />
          New Chat
        </button>
      </div>
    </div>
  );
}
