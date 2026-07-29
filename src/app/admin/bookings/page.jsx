"use client";

import React from "react";
import AdminBookings from "@components/booking/AdminBookings";
import withAdminAuth from "@components/withAdminAuth";

const ConstAdminBookings = () => {
  return (
    <div>
      <AdminBookings />
    </div>
  );
};

export default withAdminAuth(ConstAdminBookings, {
  module: "bookings",
  action: "view",
});
