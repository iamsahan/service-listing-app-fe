import { useLayoutEffect } from "react";

export const useBodyScrollLock = (lock) => {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (lock) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%"; // Important for mobile
      document.documentElement.style.overflow = "hidden"; // for html tag
      document.documentElement.style.height = "100%";
    } else {
      document.body.style.overflow = originalStyle;
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [lock]);
};
