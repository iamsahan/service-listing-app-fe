"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, FileText, RefreshCw } from "lucide-react";

// Import the new components
import CancelledBookingsTab from "@/components/admin/bookings/CancelledBookingsTab";
import RefundRequestsTab from "@/components/admin/bookings/RefundRequestsTab";
import CompletedRefundRequestsTab from "@/components/admin/bookings/CompletedRefundRequestsTab";

const BookingManagementPage = () => {
  const [activeTab, setActiveTab] = useState("cancelled");

  const tabs = [
    {
      id: "cancelled",
      label: "Cancelled Bookings",
      icon: <Calendar className="h-4 w-4" />,
      description: "View and manage cancelled bookings",
    },
    {
      id: "refunds",
      label: "Pending Refunds",
      icon: <CreditCard className="h-4 w-4" />,
      description: "Process pending refund requests",
    },
    {
      id: "completed-refunds",
      label: "Completed Refunds",
      icon: <FileText className="h-4 w-4" />,
      description: "View completed refund requests",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Booking Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage cancelled bookings and refund requests
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Description */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "cancelled" && <CancelledBookingsTab />}
        {activeTab === "refunds" && <RefundRequestsTab />}
        {activeTab === "completed-refunds" && <CompletedRefundRequestsTab />}
      </div>
    </div>
  );
};

export default BookingManagementPage;
