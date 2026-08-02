"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight, Hammer } from "lucide-react";
import SectionBadge from "./SectionBadge";

const THEMES = {
  "salon-for-women": {
    text: "text-rose-600",
    iconBg: "bg-rose-50 border-rose-100",
    hoverBorder: "hover:border-rose-300",
    dot: "bg-rose-500",
  },
  "salon-for-men": {
    text: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-100",
    hoverBorder: "hover:border-amber-300",
    dot: "bg-amber-500",
  },
  "ac-appliance-repair": {
    text: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-100",
    hoverBorder: "hover:border-blue-300",
    dot: "bg-blue-500",
  },
  "cleaning-pest-control": {
    text: "text-teal-600",
    iconBg: "bg-teal-50 border-teal-100",
    hoverBorder: "hover:border-teal-300",
    dot: "bg-teal-500",
  },
  "painters-plumbers": {
    text: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-100",
    hoverBorder: "hover:border-indigo-300",
    dot: "bg-indigo-500",
  },
  "home-renovation": {
    text: "text-orange-600",
    iconBg: "bg-orange-50 border-orange-100",
    hoverBorder: "hover:border-orange-300",
    dot: "bg-orange-500",
  },
};

const DEFAULT_THEME = {
  text: "text-emerald-600",
  iconBg: "bg-emerald-50 border-emerald-100",
  hoverBorder: "hover:border-emerald-300",
  dot: "bg-emerald-500",
};

const DESCRIPTIONS = {
  "salon-for-women": "Waxing, facials, manicures & at-home massages by certified stylists.",
  "salon-for-men": "Haircuts, beard styling & facial care, delivered to your door.",
  "ac-appliance-repair": "Fast fixes for ACs, fridges, washers & microwaves.",
  "cleaning-pest-control": "Deep cleaning, sofa washing & pest treatment for a spotless home.",
  "painters-plumbers": "Painters, pipe leak repairs & plumbing installs with safety checks.",
  "home-renovation": "Carpenters, gypsum work & tile fitting for full interior makeovers.",
};

const getTheme = (slug) => THEMES[slug] || DEFAULT_THEME;

const getDescription = (slug, name) =>
  DESCRIPTIONS[slug] || `Vetted ${name} experts available on demand, near you.`;

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

export default function CategoriesGrid({ categories, location }) {
  const city = location?.city || "city";
  const gridCategories = categories.slice(0, 8);

  if (gridCategories.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div className="space-y-3 text-left">
          <SectionBadge>Top Categories</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">
            Browse popular services
          </h2>
        </div>
        <Link
          href={`/services/${city}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-black group shrink-0"
        >
          View all categories
          <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {gridCategories.map((category, index) => {
          const theme = getTheme(category.slug);
          const iconSrc = getIconSrc(category.icon_url);

          return (
            <Link
              key={category.slug || index}
              href={`/services/${city}/${category.slug}`}
              className={`group relative flex flex-col p-6 bg-white border border-neutral-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${theme.hoverBorder}`}
            >
              <span className={`absolute top-4 right-4 size-2 rounded-full ${theme.dot} opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className={`size-12 border rounded-xl flex items-center justify-center mb-5 ${theme.iconBg}`}>
                {iconSrc ? (
                  <img src={iconSrc} alt="" className="size-6 object-contain" />
                ) : (
                  <Hammer className={`size-5 ${theme.text}`} />
                )}
              </div>

              <h3 className="font-extrabold text-base text-neutral-900 mb-1.5">
                {category.name}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                {getDescription(category.slug, category.name)}
              </p>

              <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-4 ${theme.text}`}>
                Explore
                <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
