"use client";

import Image from "next/image";

export default function QprozLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#ffffff] z-[9999] overflow-hidden">
      <Image
        src="/assets/images/prohive_logo.png"
        alt="ProHive Logo"
        width={150}
        height={150}
        className="mb-6 animate-pulse"
        priority
      />

      <div className="relative w-64 h-1.5 bg-gray-200 overflow-hidden rounded">
        <div className="absolute top-0 left-0 h-full bg-[#10b981] animate-[progress_1.2s_ease-in-out_forwards]" />
      </div>
    </div>
  );
}
