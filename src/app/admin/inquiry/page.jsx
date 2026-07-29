"use client";

import InquiryManager from "@components/inquiryManager/InquiryManager";
import withAdminAuth from "@components/withAdminAuth";
import React from "react";

const InquiryPage = () => {
  return (
    <div className="p-4">
      <h1 className="font-bold mb-4" style={{ fontSize: "28px" }}>
        Inquiry Management
      </h1>
      <hr />
      <InquiryManager />
    </div>
  );
};

export default withAdminAuth(InquiryPage, {
  module: "inquiries",
  action: "view",
});
