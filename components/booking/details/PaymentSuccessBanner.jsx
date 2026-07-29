"use client";

import { X, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function PaymentSuccessBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full z-50">
      <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Payment Successful</h3>
            <p className="text-sm text-green-700">
              Your payment has been received successfully!
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
