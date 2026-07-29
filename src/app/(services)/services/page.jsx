"use client";

import { useUserLocation } from "@/src/hooks/useUserLocation";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const ServicePage = () => {
  const router = useRouter();
  const { city, loading } = useUserLocation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (city && !loading && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;

      // Temporarily pause Google Translate before redirect
      const googleTranslateCombo = document.querySelector(".goog-te-combo");
      const savedLang = localStorage.getItem("selectedLang");

      if (googleTranslateCombo && savedLang && savedLang !== "en") {
        // Reset to English before navigation
        googleTranslateCombo.value = "en";
        googleTranslateCombo.dispatchEvent(
          new Event("change", { bubbles: true })
        );

        // Small delay to let Google Translate reset, then navigate
        setTimeout(() => {
          router.replace(`/services/${city}`);
        }, 50);
      } else {
        // No translation active, navigate immediately
        router.replace(`/services/${city}`);
      }
    }
  }, [loading, city, router]);

  return (
    <div className="notranslate" translate="no">
      {/* Prevent Google Translate from touching this page */}
    </div>
  );
};

export default ServicePage;
