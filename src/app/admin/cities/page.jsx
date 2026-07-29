"use client";

import React from "react";
import CityManagement from "@components/cityManager/CityManager";
import withAdminAuth from "@components/withAdminAuth";

const CitiesPage = () => {
  return (
    <div>
      <CityManagement />
    </div>
  );
};

export default withAdminAuth(CitiesPage, {
  module: "cities",
  action: "view",
});
