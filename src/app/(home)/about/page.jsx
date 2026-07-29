"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Building,
  Target,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import SectionBadge from "@/components/home/SectionBadge";

const Page = () => {
  const router = useRouter();

  const values = [
    {
      icon: <ShieldCheck className="size-6 text-emerald-600" />,
      title: "Rigorously Vetted",
      desc: "Every partner undergoes severe background screening, certifications audit, and live face verification before listing.",
    },
    {
      icon: <Zap className="size-6 text-amber-500 animate-pulse" />,
      title: "Instant Schedules",
      desc: "No back-and-forth negotiations. Check real-time availability calendar feeds and book slots in under 60 seconds.",
    },
    {
      icon: <TrendingUp className="size-6 text-emerald-600" />,
      title: "Escrow Protection",
      desc: "Funds are securely locked via Razorpay commission flow and disbursed to the provider only when you confirm complete satisfaction.",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Identifying the Gap",
      desc: "Started as a regional initiative in Hyderabad to bridge the divide between top-tier specialists and households.",
    },
    {
      year: "2025",
      title: "Building Safe Frameworks",
      desc: "Implemented our trademark provider escrow system and expanded verified booking structures to 5+ major metro areas.",
    },
    {
      year: "2026",
      title: "Rebranding to ProHive",
      desc: "Launched a complete visual and security overhaul, establishing our position as the market's most trusted home care hub.",
    },
  ];

  return (
    <div className="bg-white text-neutral-900 min-h-screen">
      <style>{`
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px),
                            linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
        }
        .hero-clip {
          clip-path: ellipse(140% 100% at 50% 0%);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-neutral-100 bg-gradient-to-b from-neutral-50 via-white to-white bg-grid-pattern hero-clip">
        {/* Glow Shapes */}
        <div className="absolute top-[-80px] right-[20%] w-[380px] h-[380px] bg-emerald-100/40 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-amber-100/30 rounded-full blur-[90px]" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold uppercase tracking-wider text-emerald-800 shadow-sm animate-pulse">
            Empowering Daily Living
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1]">
            We build local infrastructure <br className="hidden md:block" />
            for <span className="bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-500 bg-clip-text text-transparent">trusted services</span>
          </h1>

          <p className="text-neutral-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            ProHive is a premium technology platform that streamlines how households book verified trade, repair, and lifestyle professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push("/services")}
              className="w-full sm:w-auto px-7 py-3.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md"
            >
              Explore Services
              <ArrowUpRight className="size-4 text-emerald-400" />
            </button>
            <button
              onClick={() => router.push("/registration/provider")}
              className="w-full sm:w-auto px-7 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
            >
              Become a Provider
            </button>
          </div>
        </div>
      </section>

      {/* Core Values section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left detail Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <SectionBadge>Our Philosophy</SectionBadge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Rebuilding Trust in Home Services
              </h2>
              <p className="text-neutral-500 leading-relaxed text-sm sm:text-base">
                For too long, booking local help has meant dealing with unpredictable pricing, unreliable timings, and unverified credentials. ProHive was built to solve this by creating transparent safety checks for every project.
              </p>
              <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex items-start gap-3">
                <Target className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-neutral-800">Our Core Vision</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">To make home service bookings completely hassle-free, secure, and standardized across India.</p>
                </div>
              </div>
            </div>

            {/* Right values items Column */}
            <div className="lg:col-span-7 space-y-6">
              {values.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-neutral-50 border border-neutral-200/50 rounded-2xl flex flex-col sm:flex-row items-start gap-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="size-11 rounded-xl bg-white border border-neutral-150 flex items-center justify-center shrink-0 shadow-sm">
                    {item.icon}
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h3 className="font-extrabold text-base text-neutral-900">{item.title}</h3>
                    <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Growth Timeline */}
      <section className="py-24 bg-neutral-50 border-t border-b border-neutral-100">
        <div className="container mx-auto px-6 max-w-7xl text-center space-y-12">
          <div className="space-y-4">
            <SectionBadge>Timeline</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Our Journey</h2>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">
              How we scaled from a regional framework to a trusted marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12 text-left relative">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-8 bg-white border border-neutral-200 rounded-3xl space-y-4 hover:shadow-md transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-neutral-50 text-neutral-100 font-black text-6xl flex items-center justify-center select-none group-hover:text-emerald-50 transition-colors z-0">
                  {idx + 1}
                </div>
                <div className="relative z-10 space-y-3">
                  <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    {m.year}
                  </span>
                  <h3 className="text-lg font-extrabold text-neutral-900">{m.title}</h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Spotlight Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Image Panel */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-neutral-200 shadow-xl group">
                <Image
                  src="/assets/images/our-story.jpg"
                  alt="ProHive community"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Story Text details */}
            <div className="lg:col-span-7 text-left space-y-6">
              <SectionBadge>The Story</SectionBadge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Empowering Local Communities
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
                ProHive started with a simple belief: that everyone deserves fair employment and verified assistance. By enabling independent trade partners to build digital credentials, check customer logs, and receive secure payouts on time, we provide them with high-end tools to build their businesses.
                <br />
                <br />
                Today, ProHive empowers hundreds of certified specialists across India. We handle the bookings, validation, mapping, and insurance payouts, allowing you to relax while specialists carry out quality work with full convenience.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Corporate Call To Action Banner */}
      <section className="py-20 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="p-8 md:p-16 bg-neutral-900 rounded-[2.5rem] text-white text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
            
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight relative z-10 leading-tight">
              Ready to Settle Your <br /> Next Home Project?
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed relative z-10">
              Find premium home help, beauty, and maintenance professionals on-demand. Become a booking customer today.
            </p>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => router.push("/services")}
                className="w-full sm:w-auto bg-white text-black hover:bg-neutral-100 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105"
              >
                Browse Services
              </button>
              <button
                onClick={() => router.push("/registration/provider")}
                className="w-full sm:w-auto bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
