"use client";

import { useAuth } from "@/src/context/AuthContext";
import AdminTicketList from "./AdminTicketList";
import { serviceAPI } from "@/api/services";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import TicketChat from "./TicketChat";
import api from "@/utils/api";

export default function AdminTicketMessenger() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, totalPages: 0 });

  const [filters, setFilters] = useState({
    search_query: null,
    query_type: "booking_id",
    status: null,
    category: null,
    city: null,
  });

  const fetchTickets = async (overrides = {}) => {
    try {
      const res = await api.get("/tickets", {
        params: { ...filters, ...overrides, page: pageData.page },
      });
      setTickets(res.data.tickets);
      setPageData((prev) => ({
        ...prev,
        totalPages: res.data.totalPages,
      }));
    } catch (e) {
      console.error("Failed to fetch tickets", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityOptions = async () => {
    try {
      const res = await serviceAPI.getCities();
      const cityOptions = res.data.map((city) => ({
        value: city.city_id,
        label: city.name,
      }));
      setCityOptions(cityOptions);
    } catch (e) {
      console.error("Failed to fetch cities", e);
    }
  };

  const fetchCategoryOptions = async () => {
    try {
      const res = await serviceAPI.getAllCategories();
      const categoryOptions = res.data.map((category) => ({
        value: category.category_id,
        label: category.name,
      }));
      setCategoryOptions(categoryOptions);
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  useEffect(() => {
    let intervalId;

    // Fetch initially
    fetchTickets();

    // Poll every 5 minutes
    intervalId = setInterval(() => {
      fetchTickets();
    }, 300000);

    return () => {
      clearInterval(intervalId);
    };
  }, [pageData.page]);

  useEffect(() => {
    if (!cityOptions.length) fetchCityOptions();
    if (!categoryOptions.length) fetchCategoryOptions();
  }, []);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleCloseTicket = async () => {
    try {
      await api.patch(`/tickets/${selectedId}/close`);
      await fetchTickets();
      toast({
        title: "Ticket closed",
        description: "Ticket has been closed successfully",
      });
    } catch (e) {
      console.error("Failed to close ticket");
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPageData((prev) => ({ ...prev, page: 1 }));
    fetchTickets({ ...newFilters, page: 1 });
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] border rounded overflow-hidden">
      <AdminTicketList
        tickets={tickets}
        selectedId={selectedId}
        filters={filters}
        onSelect={handleSelect}
        onFilterChange={handleFilterChange}
        cityOptions={cityOptions}
        categoryOptions={categoryOptions}
        page={pageData.page}
        totalPages={pageData.totalPages}
        onPageChange={(page) => setPageData({ ...pageData, page })}
      />

      <TicketChat
        ticketId={selectedId}
        currentUserId={user.uId}
        onCloseTicket={handleCloseTicket}
      />
    </div>
  );
}
