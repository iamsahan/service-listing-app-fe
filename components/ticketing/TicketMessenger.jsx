"use client";

import { useAuth } from "@/src/context/AuthContext";
import { cartService } from "@/api/cartService";
import { useEffect, useState } from "react";
import CreateTicketForm from "./TicketForm";
import TicketList from "./TicketList";
import TicketChat from "./TicketChat";
import api from "@/utils/api";

export default function TicketMessenger({ bookingId, providerId }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [initializedFromBooking, setInitializedFromBooking] = useState(false);
  const [pageData, setPageData] = useState({
    page: 1,
    totalPages: 0,
  });

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets", {
        params: { page: pageData.page, limit: 60 },
      });

      setTickets(res.data.tickets);
      setPageData((prev) => ({
        ...prev,
        totalPages: res.data.totalPages,
      }));
    } catch (e) {
      console.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [pageData.page]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId) {
        await cartService.getBookingDataById(bookingId).then((res) => {
          setBooking(res.booking);
        });
      }
    };

    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (bookingId && !loading && !initializedFromBooking) {
      const existingTicket = tickets.find(
        (ticket) => ticket.booking_id === bookingId
      );

      if (existingTicket) {
        setSelectedId(existingTicket.ticket_id);
        setIsCreating(false);
      } else {
        setSelectedId(null);
        setIsCreating(true);
      }

      // Only run once
      setInitializedFromBooking(true);
    }
  }, [bookingId, tickets, loading, initializedFromBooking]);

  const handleTicketCreated = (newTicketId) => {
    setSelectedId(newTicketId);
    setIsCreating(false);
    api.get("/tickets").then((res) => {
      setTickets(res.data.tickets);
      setPageData((prev) => ({
        ...prev,
        totalPages: res.data.totalPages,
      }));
    });
  };

  const handleSelect = (id) => {
    if (id === "new") {
      setIsCreating(true);
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    setSelectedId(null);
    setIsCreating(false);
    fetchTickets();
  };

  useEffect(() => {
    if (!loading && tickets.length === 0 && !bookingId) {
      setIsCreating(true);
      setSelectedId(null);
    }
  }, [loading, tickets, bookingId]);

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="flex-1 overflow-hidden lg:shadow-lg lg:max-h-[calc(100vh-150px)]">
      {!selectedId && !isCreating && (
        <TicketList
          tickets={tickets}
          selectedId={selectedId}
          onSelect={(id) => handleSelect(id)}
          page={pageData.page}
          totalPages={pageData.totalPages}
          onPageChange={(page) => setPageData({ ...pageData, page })}
        />
      )}

      {isCreating && (
        <CreateTicketForm
          booking={booking}
          providerId={providerId}
          onCreated={handleTicketCreated}
          onBack={handleBack}
        />
      )}

      {selectedId && !isCreating && (
        <TicketChat
          ticketId={selectedId}
          currentUserId={user.uId}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
