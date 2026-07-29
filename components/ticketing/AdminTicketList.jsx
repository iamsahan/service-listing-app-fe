import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { useState } from "react";
import Pagination from "./Pagination";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function AdminTicketList({
  tickets,
  selectedId,
  onSelect,
  onFilterChange,
  filters,
  cityOptions,
  categoryOptions,
  page,
  totalPages,
  onPageChange,
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search_query || "");
  const [searchType, setSearchType] = useState(
    filters.query_type || "booking_id"
  );

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value === "__all__" ? null : value });
  };

  const handleSearch = () => {
    onFilterChange({
      ...filters,
      search_query: searchTerm,
      query_type: searchType,
    });
  };

  return (
    <div className="w-full md:w-1/3 h-full flex flex-col border-r bg-white">
      {/* Header + Filters */}
      <div className="p-4 border-b flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Tickets</h2>

        {/* Search Row */}
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Search..."
            className="flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking_id">Booking ID</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="provider">Provider</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch}>Search</Button>

          {(searchTerm.trim() !== "" || searchType !== "booking_id") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSearchType("booking_id");
                onFilterChange({
                  ...filters,
                  search_query: null,
                  query_type: "booking_id",
                });
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Other filters */}
        <div className="flex gap-2 items-center flex-wrap">
          <Select
            value={filters.status || "__all__"}
            onValueChange={(val) => handleFilterChange("status", val)}
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || "__all__"}
            onValueChange={(val) => handleFilterChange("category", val)}
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categoryOptions?.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.city || "__all__"}
            onValueChange={(val) => handleFilterChange("city", val)}
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Cities</SelectItem>
              {cityOptions?.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Ticket List */}
      <div className="flex-1 overflow-y-auto">
        {tickets && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              onClick={() => onSelect(ticket.ticket_id)}
              className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-50 ${
                selectedId === ticket.ticket_id ? "bg-[#5f60b9]/5" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm text-gray-800 truncate">
                  {ticket.creator_name} - {ticket.title}
                </div>
                <span className="text-xs text-gray-400 ml-4 shrink-0">
                  {formatTime(ticket.updated_at)}
                </span>
              </div>

              <div className="text-sm text-gray-500 mt-1">
                {ticket.status === "closed" ? (
                  <Badge className="bg-red-100 text-red-800">Closed</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">Open</Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center px-4 py-10 text-sm text-gray-500">
            No tickets found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
