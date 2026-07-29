"use client";
import Image from "next/image";
import React from "react";
import SectionBadge from "@/components/home/SectionBadge";
import { Sparkles, ArrowRight } from "lucide-react";

export default function GetStartedSection() {
  const steps = [
    {
      title: "Input Credentials",
      desc: "Choose individual or business registration track and fill in your basic coordinates.",
    },
    {
      title: "Verify Certificates",
      desc: "Share business licensing, identity checks, and work experience documents securely.",
    },
    {
      title: "Go Live & Earn",
      desc: "Toggle active availability on, accept automated schedules, and clear secure payouts.",
    },
  ];

  const handleClick = () => {
    window?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-white border border-neutral-200/60 rounded-[2.5rem] p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 text-left">
      
      {/* Left side - image */}
      <div className="flex-1 flex justify-center w-full min-w-[250px]">
        <div className="relative w-full max-w-[400px] h-[300px] sm:h-[350px] rounded-3xl overflow-hidden shadow-lg border border-neutral-200">
          <Image
            src="/assets/images/card-1.jpg"
            alt="ProHive Partners"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right side - steps */}
      <div className="flex-1 space-y-8 w-full">
        <div className="space-y-3">
          <SectionBadge>Simple Onboarding</SectionBadge>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Register in 3 Simple Steps
          </h2>
        </div>

        <ol className="relative space-y-6">
          {/* Vertical connecting tracker track */}
          <span className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-500 to-amber-400 opacity-60 z-0" />

          {steps.map((step, index) => {
            const indexColor = index % 2 === 0 ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-amber-500 text-amber-600 bg-amber-50";
            return (
              <li key={index} className="flex items-start gap-4 relative z-10 group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-xs shrink-0 shadow-sm ${indexColor}`}>
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-neutral-900">{step.title}</h4>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-sm">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <button
          onClick={handleClick}
          className="px-6 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition duration-300 shadow-md flex items-center gap-2 group hover:shadow-lg w-fit"
        >
          Begin Application
          <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform text-emerald-400" />
        </button>
      </div>
    </section>
  );
}
