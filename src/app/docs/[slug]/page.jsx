"use client";

import PolicyPage from "@/components/docs/PolicyPage";
import { useParams } from "next/navigation";

const titles = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cancellation: "Cancellation Policy",
  "provider-terms": "Provider Terms of Service",
};

export default function DocsPage() {
  const params = useParams();

  return (
    <PolicyPage
      mobileMode
      doc={`${params.slug}.docx`}
      title={titles[params.slug] || "Policy"}
    />
  );
}
