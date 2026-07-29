import React from "react";

export default function PageLoader({ message = "Loading...", className = "" }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="h-8 w-8 text-white animate-spin" />
        <p className="text-white text-sm">{message}</p>
      </div>
    </div>
  );
}
export function Spinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
