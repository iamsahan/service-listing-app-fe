"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

const SHOW_AFTER = 300;
const ALLOWED_PATHS = ["/", "/about", "/contact"];
const SERVICES_PATH = "/services";

export default function ScrollToTopButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const allowed =
    ALLOWED_PATHS.includes(pathname) ||
    pathname.startsWith(SERVICES_PATH + "/");

  const onScroll = useCallback(() => {
    setVisible(window.scrollY > SHOW_AFTER);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    onScroll();

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [allowed, onScroll]);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!allowed) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
      className={`fixed bottom-6 right-6 z-50 flex size-11 sm:size-12 items-center justify-center 
        rounded-full bg-[#5f60b9] text-white shadow-lg transition
        hover:bg-[#5f60b9]/90 focus:outline-none focus:ring-2 focus:ring-[#5f60b9]/90
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-4"
        }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-5 sm:size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
