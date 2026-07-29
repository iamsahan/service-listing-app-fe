"use client";

import { AlertTriangle } from "lucide-react";

const AlertBanner = () => {
  return (
    <div
      className="bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-5 lg:py-6 flex items-start"
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 mr-3 text-red-600 flex-shrink-0" />
      <p className="text-sm font-medium">
        Your provider account has been sanctioned. Please settle your pending
        payments to restore your account.
      </p>
    </div>
  );
};

export default AlertBanner;
