"use client";

import AdminBookingPayments from "@/components/booking/AdminBookingPayments";
import withAdminAuth from "@components/withAdminAuth";
import React from "react";

const page = () => {
  return (
    <div>
      <AdminBookingPayments />
    </div>
  );
};

export default withAdminAuth(page, {
  module: "transactions",
  action: "view",
});
