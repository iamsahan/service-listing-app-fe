"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, FileText, CreditCard } from "lucide-react";
import PayoutLogsTab from "@/components/admin/PayoutLogsTab";
import ProvidersTab from "@/components/admin/ProvidersTab";
import PayoutTransactionsTab from "@/components/admin/PayoutTransactionsTab";

// Tab constants
const TABS = {
  PAYOUT_LOGS: "payout-logs",
  PROVIDERS: "providers",
  TRANSACTIONS: "transactions",
};

const ProviderPayoutsPage = () => {
  const [activeTab, setActiveTab] = useState(TABS.PROVIDERS);

  const TabButton = ({ tab, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
        isActive
          ? "bg-white text-blue-600 border-b-2 border-blue-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Provider Payouts Management
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          <TabButton
            tab={TABS.PROVIDERS}
            icon={Users}
            label="Provider Balances"
            isActive={activeTab === TABS.PROVIDERS}
            onClick={() => setActiveTab(TABS.PROVIDERS)}
          />
          <TabButton
            tab={TABS.PAYOUT_LOGS}
            icon={FileText}
            label="Booking Based Payout Logs"
            isActive={activeTab === TABS.PAYOUT_LOGS}
            onClick={() => setActiveTab(TABS.PAYOUT_LOGS)}
          />
          <TabButton
            tab={TABS.TRANSACTIONS}
            icon={CreditCard}
            label="Payout Transaction History"
            isActive={activeTab === TABS.TRANSACTIONS}
            onClick={() => setActiveTab(TABS.TRANSACTIONS)}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow min-h-[600px]">
        {activeTab === TABS.PAYOUT_LOGS && <PayoutLogsTab />}
        {activeTab === TABS.PROVIDERS && <ProvidersTab />}
        {activeTab === TABS.TRANSACTIONS && <PayoutTransactionsTab />}
      </div>
    </div>
  );
};

export default ProviderPayoutsPage;
