"use client";

import AdminTicketMessenger from "@/components/ticketing/AdminTicketMessenger";
import withAdminAuth from "@components/withAdminAuth";
import React from "react";

function TicketsPage() {
  return (
    <div className="p-3">
      <AdminTicketMessenger />
    </div>
  );
}

export default withAdminAuth(TicketsPage, {
  module: "tickets",
  action: "view",
});
