"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Hammer, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SectionBadge from "./SectionBadge";

export default function PopularCategoriesWheel({ categories, location }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const city = location?.city || "city";

  // Use top 8 categories for the circular visualizer
  const wheelCategories = categories.slice(0, 8);
  const count = wheelCategories.length;

  if (count === 0) return null;

  const activeCategory = wheelCategories[activeIndex];

  // Dynamic Theme mapping based on category slug
  const getTheme = (slug) => {
    const themes = {
      "salon-for-women": {
        glow: "from-rose-500/20 via-rose-500/5 to-transparent",
        text: "text-rose-600",
        border: "border-rose-450",
        ringBorder: "border-rose-100",
        activeShadow: "shadow-[0_0_25px_rgba(244,63,94,0.3)]",
        iconBg: "bg-rose-50",
        badgeBg: "bg-rose-50 text-rose-800 border-rose-100",
        badgeGlow: "bg-rose-500",
      },
      "salon-for-men": {
        glow: "from-amber-500/20 via-amber-500/5 to-transparent",
        text: "text-amber-600",
        border: "border-amber-450",
        ringBorder: "border-amber-100",
        activeShadow: "shadow-[0_0_25px_rgba(245,158,11,0.3)]",
        iconBg: "bg-amber-50",
        badgeBg: "bg-amber-50 text-amber-800 border-amber-100",
        badgeGlow: "bg-amber-500",
      },
      "ac-appliance-repair": {
        glow: "from-blue-500/20 via-blue-500/5 to-transparent",
        text: "text-blue-600",
        border: "border-blue-450",
        ringBorder: "border-blue-100",
        activeShadow: "shadow-[0_0_25px_rgba(59,130,246,0.3)]",
        iconBg: "bg-blue-50",
        badgeBg: "bg-blue-50 text-blue-800 border-blue-100",
        badgeGlow: "bg-blue-500",
      },
      "cleaning-pest-control": {
        glow: "from-teal-500/20 via-teal-500/5 to-transparent",
        text: "text-teal-600",
        border: "border-teal-450",
        ringBorder: "border-teal-100",
        activeShadow: "shadow-[0_0_25px_rgba(20,184,166,0.3)]",
        iconBg: "bg-teal-50",
        badgeBg: "bg-teal-50 text-teal-800 border-teal-100",
        badgeGlow: "bg-teal-500",
      },
      "painters-plumbers": {
        glow: "from-indigo-500/20 via-indigo-500/5 to-transparent",
        text: "text-indigo-600",
        border: "border-indigo-450",
        ringBorder: "border-indigo-100",
        activeShadow: "shadow-[0_0_25px_rgba(99,102,241,0.3)]",
        iconBg: "bg-indigo-50",
        badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-100",
        badgeGlow: "bg-indigo-500",
      },
      "home-renovation": {
        glow: "from-orange-500/20 via-orange-500/5 to-transparent",
        text: "text-orange-600",
        border: "border-orange-450",
        ringBorder: "border-orange-100",
        activeShadow: "shadow-[0_0_25px_rgba(249,115,22,0.3)]",
        iconBg: "bg-orange-50",
        badgeBg: "bg-orange-50 text-orange-850 border-orange-100",
        badgeGlow: "bg-orange-500",
      },
    };
    return themes[slug] || {
      glow: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      text: "text-emerald-600",
      border: "border-emerald-450",
      ringBorder: "border-emerald-100",
      activeShadow: "shadow-[0_0_25px_rgba(16,185,129,0.3)]",
      iconBg: "bg-emerald-50",
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-100",
      badgeGlow: "bg-emerald-500",
    };
  };

  const currentTheme = getTheme(activeCategory.slug);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % count);
    setRotation((prev) => prev - (360 / count));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
    setRotation((prev) => prev + (360 / count));
  };

  const handleNodeClick = (index) => {
    const diff = index - activeIndex;
    if (diff === 0) return;

    let steps = diff;
    if (steps > count / 2) steps -= count;
    if (steps < -count / 2) steps += count;

    setActiveIndex(index);
    setRotation((prev) => prev - (steps * (360 / count)));
  };

  const isValidUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("/") || url.startsWith("data:")) return true;
    try {
      if (url.startsWith("undefined")) return false;
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getIconSrc = (path) => {
    const raw = path ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}` : null;
    return isValidUrl(raw) ? raw : null;
  };

  const getCategoryDescription = (slug, name) => {
    const desc = {
      "salon-for-women": "Indulge in premium beauty services at home. Vetted salon experts for waxing, facials, manicures, and massages.",
      "salon-for-men": "Grooming & styling packages designed for men. Get professional haircuts, beard styling, and facial care in your space.",
      "ac-appliance-repair": "Quick-turn support for air conditioners, refrigerators, washing machines, and microwave ovens by certified techs.",
      "cleaning-pest-control": "Comprehensive sanitization, deep cleaning, sofa washing, and pest treatment for a hygienic, clean home.",
      "painters-plumbers": "Expert house painters, pipe leak repairs, plumbing installations, and electrical fixes with safety checks.",
      "home-renovation": "Transform your interiors with professional carpenters, gypsum board work, tile fittings, and renovation packages.",
    };
    return desc[slug] || `Premium ${name} services customized for your local area. Vetted service experts available on demand with complete safety guarantees.`;
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-12 gap-10 items-center min-h-[500px]">

        {/* Left Side details */}
        <div className="col-span-5 text-left space-y-6">
          <SectionBadge>Top Categories</SectionBadge>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-none uppercase">
                {activeCategory.name}
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                {getCategoryDescription(activeCategory.slug, activeCategory.name)}
              </p>

              <div className="pt-3">
                <Link
                  href={`/services/${city}/${activeCategory.slug}`}
                  className="inline-flex px-5 items-center gap-2 bg-black text-white hover:bg-neutral-800 text-xs font-black uppercase tracking-wider px-6.5 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group active:scale-95"
                >
                  Explore Services
                  <ArrowRight className="size-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation keys */}
          <div className="flex items-center gap-3 pt-6 border-t border-neutral-100 w-fit">
            <button
              onClick={handlePrev}
              type="button"
              className="size-11 rounded-xl border border-neutral-200 hover:border-black flex items-center justify-center transition-all bg-white hover:bg-neutral-50 active:scale-90 shadow-sm"
              aria-label="Previous Category"
            >
              <ArrowLeft className="size-4 text-neutral-800" />
            </button>
            <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-2 select-none">
              {activeIndex + 1} / {count}
            </div>
            <button
              onClick={handleNext}
              type="button"
              className="size-11 rounded-xl border border-neutral-200 hover:border-black flex items-center justify-center transition-all bg-white hover:bg-neutral-50 active:scale-90 shadow-sm"
              aria-label="Next Category"
            >
              <ArrowRight className="size-4 text-neutral-800" />
            </button>
          </div>
        </div>

        {/* Right Side: Visual Dial */}
        <div className="col-span-7 flex justify-center items-center relative select-none">
          <div className="relative size-[430px] flex items-center justify-center">

            {/* Outer Decorative Circles */}
            <div className="absolute inset-0 rounded-full border border-dashed border-neutral-200/80 animate-[spin_160s_linear_infinite]" />

            {/* Color Gradient Ring */}
            <div className="absolute inset-4 rounded-full border border-neutral-100/50 bg-gradient-to-tr from-emerald-500/5 via-rose-500/5 to-amber-500/5 animate-[spin_40s_linear_infinite_reverse]" />

            {/* Dynamic Center Radial Glow */}
            <div className={`absolute size-[280px] rounded-full bg-gradient-to-b ${currentTheme.glow} transition-all duration-700 ease-in-out filter blur-2xl opacity-60`} />

            {/* Central Info Hub */}
            <div className="absolute size-48 rounded-full bg-white border border-neutral-200/80 shadow-2xl flex flex-col items-center justify-center p-5 text-center z-20">
              <div className="absolute inset-2.5 rounded-full border border-dashed border-neutral-100" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className={`size-14 ${currentTheme.iconBg} border ${currentTheme.ringBorder} rounded-xl flex items-center justify-center mb-2.5 transition-all duration-500 shadow-sm`}>
                    {getIconSrc(activeCategory.icon_url) ? (
                      <img
                        src={getIconSrc(activeCategory.icon_url)}
                        alt=""
                        className="size-7.5 object-contain"
                      />
                    ) : (
                      <Hammer className={`size-5.5 ${currentTheme.text} transition-colors duration-500`} />
                    )}
                  </div>

                  <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-neutral-800 max-w-[130px] leading-tight truncate">
                    {activeCategory.name}
                  </h3>

                  <span className={`text-[8px] font-black uppercase tracking-widest mt-2 flex items-center gap-1 ${currentTheme.text}`}>
                    <Compass className="size-3 animate-[spin_6s_linear_infinite]" />
                    Featured
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rotating Category Ring Nodes */}
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out z-10"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {wheelCategories.map((serv, index) => {
                const angle = (index * 360) / count;
                const isCurrent = index === activeIndex;
                const nodeTheme = getTheme(serv.slug);

                // Calculate fixed radial offset coordinates relative to center (0, 0)
                const radius = 145;
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;

                return (
                  <div
                    key={`${serv.slug || "category"}-${index}`}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${-angle - rotation}deg)`,
                      transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleNodeClick(index)}
                      className={`size-12 sm:size-13 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${isCurrent
                          ? `bg-white border-2 ${nodeTheme.border} ${nodeTheme.activeShadow} scale-120 z-30`
                          : "bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-md hover:scale-110 z-10"
                        }`}
                    >
                      {isCurrent && (
                        <span className={`absolute -top-1 -right-1 size-3 rounded-full ${nodeTheme.badgeGlow} border-2 border-white shadow-sm flex items-center justify-center animate-ping`} />
                      )}

                      {getIconSrc(serv.icon_url) ? (
                        <img
                          src={getIconSrc(serv.icon_url)}
                          alt=""
                          className={`size-5.5 object-contain transition-all ${isCurrent ? "grayscale-0 scale-105" : "grayscale opacity-60 group-hover:opacity-100"
                            }`}
                        />
                      ) : (
                        <Hammer className={`size-4.5 transition-all ${isCurrent ? nodeTheme.text : "text-neutral-400"}`} />
                      )}
                    </button>

                    {/* Hover title tags */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 -bottom-7.5 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border shadow-sm transition-all duration-350 ${isCurrent
                          ? `opacity-100 translate-y-0 ${nodeTheme.badgeBg}`
                          : "opacity-0 translate-y-1 pointer-events-none text-neutral-400 border-neutral-200 bg-white"
                        }`}
                    >
                      {serv.name}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Responsive Grid View */}
      <div className="lg:hidden space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {wheelCategories.map((serv, index) => {
            const nodeTheme = getTheme(serv.slug);

            return (
              <Link
                key={`${serv.slug || "category"}-${index}`}
                href={`/services/${city}/${serv.slug}`}
                className={`group flex flex-col items-center justify-center p-5 bg-neutral-50 border border-neutral-200/50 hover:border-neutral-400 rounded-2xl transition-all duration-300 hover:shadow-md hover:bg-white`}
              >
                <div className={`size-11 bg-white border border-neutral-200 rounded-xl flex items-center justify-center transition-all mb-3 relative shadow-sm group-hover:scale-105 duration-350`}>
                  <span className={`absolute top-0 right-0 w-2 h-2 rounded-full ${nodeTheme.badgeGlow} scale-0 group-hover:scale-100 transition-transform`} />

                  {getIconSrc(serv.icon_url) ? (
                    <img
                      src={getIconSrc(serv.icon_url)}
                      alt={serv.name}
                      className="size-5 object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <Hammer className={`size-4.5 text-neutral-500 group-hover:${nodeTheme.text} transition-transform group-hover:scale-105`} />
                  )}
                </div>
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-neutral-700 text-center group-hover:text-black leading-tight truncate w-full px-1">
                  {serv.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
