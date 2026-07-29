"use client";

import ProviderManager from "@components/ProviderManager/ProviderManager";
import withAdminAuth from "@components/withAdminAuth";
import React from "react";

const InquiryPage = () => {
  return (
    <div className="p-4">
      <h1 className="font-bold mb-4" style={{ fontSize: "28px" }}>
        Service Providers Management
      </h1>
      <hr />
      <ProviderManager />
    </div>
  );
};

export default withAdminAuth(InquiryPage, {
  module: "service_providers",
  action: "view",
});
