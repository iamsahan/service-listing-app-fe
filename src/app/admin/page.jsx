"use client";
import Overview from "@components/admin/Overview";
import { GA_MEASUREMENT_ID } from "@lib/gtag";
import React from "react";

const AdminDashboard = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn(
      "GA_MEASUREMENT_ID is not defined. Google Analytics will not be loaded."
    );
  }

  return (
    <div>
      <Overview />
    </div>
  );
};

export default AdminDashboard;
