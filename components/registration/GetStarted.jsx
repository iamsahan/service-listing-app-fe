"use client";

import Image from "next/image";
import React from "react";

export default function GetStartedSection() {
  const steps = [
    "Enter your details",
    "Share your documents",
    "Start working & earn more",
  ];

  const handleClick = () => {
    window?.scrollTo({ top: 0 });
  };

  return (
    <section className="bg-[#f3f6fb] rounded-xl p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Left side - image */}
      <div className="flex-1 flex justify-center w-full min-w-[250px]">
        <div className="relative w-full max-w-[400px] h-[300px] sm:h-[380px]">
          <Image
            src="/assets/images/card-1.jpg"
            alt="QProz Partners"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right side - steps */}
      <div className="flex-1 text-left">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">
          Get started in{" "}
          <span className="text-[var(--color-primary)]">3 easy steps</span>
        </h2>

        <ol className="relative space-y-6 mb-8">
          {/* Vertical line */}
          <span className="absolute left-4 top-4 bottom-4 w-[2px] bg-[var(--color-primary)] opacity-50" />

          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-4 relative z-10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[var(--color-primary)] bg-[#f3f6fb] text-[var(--color-primary)] font-semibold">
                {index + 1}
              </div>
              <p className="text-gray-700 text-base">{step}</p>
            </li>
          ))}
        </ol>

        <button
          onClick={handleClick}
          className="text-[var(--color-primary)] bg-[#5f60b9]/10 px-6 py-3 rounded-md font-medium hover:bg-[var(--color-primary)] hover:text-white transition"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
