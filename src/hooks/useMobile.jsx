import { useEffect, useState } from "react";

// Default breakpoint
const MOBILE_QUERY = "(max-width: 768px)";

export function useMobile(query = MOBILE_QUERY) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event) => {
      setIsMobile(event.matches);
    };

    // Browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      // Fallback for old
      mediaQuery.addListener(handler);
    }

    setIsMobile(mediaQuery.matches);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return isMobile;
}
