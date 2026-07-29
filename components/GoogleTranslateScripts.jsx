"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function GoogleTranslateScripts() {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const translationTimeoutRef = useRef(null);

  useEffect(() => {
    const currentLang = localStorage.getItem("selectedLang");
    const isServicesRedirect = pathname === "/services";

    // Don't translate the redirect page
    if (isServicesRedirect) {
      return;
    }

    // If translation is active and we navigated to a new page
    if (
      currentLang &&
      currentLang !== "en" &&
      previousPathRef.current !== pathname
    ) {
      // Clear any pending translations
      clearTimeout(translationTimeoutRef.current);

      // Wait for page to fully render before applying translation
      translationTimeoutRef.current = setTimeout(() => {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = currentLang;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, 200);
    }

    previousPathRef.current = pathname;

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (window.googleTranslateInitialized) return;

    window.googleTranslateInitialized = true;

    // Patch insertBefore to handle Google Translate conflicts gracefully
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      try {
        // Check if referenceNode is actually a child of this node
        if (referenceNode && !this.contains(referenceNode)) {
          // Silently append instead when reference is invalid
          return this.appendChild(newNode);
        }
        return originalInsertBefore.call(this, newNode, referenceNode);
      } catch (error) {
        // Suppress Google Translate DOM errors during navigation
        if (
          error.name === "NotFoundError" ||
          error.name === "HierarchyRequestError"
        ) {
          try {
            return this.appendChild(newNode);
          } catch {
            return newNode;
          }
        }
        throw error;
      }
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ta,te,hi",
          autoDisplay: false,
        },
        "google_translate_element"
      );

      // Apply saved language
      const selectedLang = localStorage.getItem("selectedLang");
      if (selectedLang && selectedLang !== "en") {
        setTimeout(() => {
          const select = document.querySelector(".goog-te-combo");
          if (select) {
            select.value = selectedLang;
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }, 500);
      }
    };
  }, []);

  return (
    <Script
      id="google-translate-script"
      src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      strategy="afterInteractive"
    />
  );
}
