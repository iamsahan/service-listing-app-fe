"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  XCircle,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const PRIORITY_TABS = [
  { id: "", label: "All Priority", icon: AlertCircle, color: "gray" },
  { id: "1", label: "High", icon: AlertCircle, color: "red" },
  { id: "2", label: "Medium", icon: AlertCircle, color: "orange" },
  { id: "3", label: "Low", icon: AlertCircle, color: "blue" },
  { id: "4", label: "Lowest", icon: AlertCircle, color: "gray" },
];

const STATUS_TABS = [
  { id: "queued", label: "Queued", icon: Clock, count: 0, color: "blue" },
  {
    id: "assigned",
    label: "Assigned",
    icon: CheckCircle,
    count: 0,
    color: "green",
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle,
    count: 0,
    color: "gray",
  },
  { id: "", label: "All Status", icon: Filter, count: 0, color: "purple" },
];

const AdminAssignmentFilters = ({
  filters,
  searchInput,
  onFilterChange,
  onSearchChange,
  onClearSearch,
  onResetFilters,
  stats,
}) => {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
          Total: {stats.total ?? 0}
        </span>
        <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-semibold">
          Urgent: {stats.urgent_count ?? 0}
        </span>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
          Overdue: {stats.overdue_count ?? 0}
        </span>
      </div>

      {/* Advanced Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Status and Priority Filters - Same Line */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <div className="flex flex-wrap gap-1">
              {STATUS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = filters.status === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      onFilterChange({
                        target: { name: "status", value: tab.id },
                      })
                    }
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs transition-all duration-200 ${
                      isActive
                        ? `bg-${tab.color}-100 border-${tab.color}-300 text-${tab.color}-800 shadow-sm`
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="flex flex-wrap gap-1">
              {PRIORITY_TABS.map((tab) => {
                const isActive = filters.priority === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      onFilterChange({
                        target: { name: "priority", value: tab.id },
                      })
                    }
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs transition-all duration-200 ${
                      isActive
                        ? `bg-${tab.color}-100 border-${tab.color}-300 text-${tab.color}-800 shadow-sm`
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sorting and Search - All in Same Line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Bookings
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="search"
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search by ID, address, customer..."
                className="w-full pl-9 pr-9 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              {searchInput && (
                <button
                  onClick={onClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={onFilterChange}
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="priority">Priority</option>
              <option value="booking_date">Booking Date</option>
              <option value="booking_time">Booking Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <select
              name="sortOrder"
              value={filters.sortOrder}
              onChange={onFilterChange}
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignmentFilters;
