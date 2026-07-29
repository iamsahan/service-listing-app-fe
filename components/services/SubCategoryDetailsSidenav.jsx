"use client";
import { useMobile } from "@/src/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, Grid } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Banner from "../Banner";

export default function SubCategoryDetailsSidenav({
  serviceTypes,
  subCategory,
  handleBack,
  cityId,
}) {
  const isMobile = useMobile();
  const [activeId, setActiveId] = useState(null);
  const [isManualScroll, setIsManualScroll] = useState(false);

  useEffect(() => {
    if (isManualScroll) return;
    if (!serviceTypes?.length) return;

    const firstId = serviceTypes[0].name.toLowerCase().replace(/\s+/g, "-");
    setActiveId(firstId);

    const handleIntersect = () => {
      const offsets = serviceTypes
        .map((type) => {
          const id = type.name.toLowerCase().replace(/\s+/g, "-");
          const el = document.getElementById(id);
          if (!el) return null;

          const rect = el.getBoundingClientRect();
          return { id, top: rect.top };
        })
        .filter(Boolean);

      const closest = offsets
        .filter((o) => o.top >= 0)
        .sort((a, b) => a.top - b.top)[0];

      if (closest) {
        setActiveId(closest.id);
      } else {
        setActiveId(firstId);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-300px 0px -70% 0px",
      threshold: 0,
    });

    serviceTypes.forEach((type) => {
      const el = document.getElementById(
        type.name.toLowerCase().replace(/\s+/g, "-")
      );
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [serviceTypes, isManualScroll]);

  const handleClick = (id) => (e) => {
    e.preventDefault();
    setActiveId(id);
    setIsManualScroll(true);

    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 180;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      setIsManualScroll(false);
    }, 800);
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

  const getImageUrl = (path) => {
    const raw = path && path.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`
      : null;
    return isValidUrl(raw) ? raw : null;
  };

  return (
    <div className="xl:col-span-3 xl:sticky xl:top-24 xl:self-start flex flex-col bg-white w-full transition-all duration-300">
      <div
        className={cn("bg-white border-b border-neutral-100 pb-4 text-left", {
          "fixed w-full top-16 z-10 pt-2 px-6 -ml-6 shadow-sm": isMobile,
        })}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent text-neutral-500 hover:text-neutral-800 flex items-center justify-start gap-1 text-xs font-bold uppercase tracking-wider transition-colors mb-2"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to list
        </Button>

        {/* Title & Count */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 leading-tight">
            {subCategory?.name}
          </h1>
          <p className="text-neutral-500 text-xs font-semibold">
            {serviceTypes?.length || 0} sub-categories available
          </p>
        </div>
      </div>

      <div className={cn("mt-6", { "mt-32 px-1": isMobile })}>
        {isMobile && (
          <Banner
            cityId={cityId}
            subCategory={subCategory}
            position="service_page_top"
            className="mb-6"
          />
        )}

        {/* Navigation list (Vertical Index on Desktop, Horizontal Scroll Bar on Mobile) */}
        <div className="xl:bg-neutral-50 xl:border xl:border-neutral-200/50 xl:p-5 xl:rounded-[2rem] shadow-sm">
          <div className="hidden xl:flex items-center gap-2 pl-1 mb-4">
            <Grid className="size-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800">
              Service Sub-categories
            </span>
          </div>

          <ul className="flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-x-visible pb-3 xl:pb-0 scrollbar-none scroll-snap-x">
            {serviceTypes?.map((type, index) => {
              const id = type.name.toLowerCase().replace(/\s+/g, "-");
              const isActive = activeId === id;
              const imgUrl = getImageUrl(type.icon_url);

              return (
                <li key={index} className="list-none shrink-0 scroll-snap-start">
                  <a
                    href={`#${id}`}
                    onClick={handleClick(id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200/80 rounded-2xl transition-all text-left w-fit xl:w-full",
                      isActive
                        ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 ring-1 ring-emerald-400"
                        : "hover:border-neutral-350 hover:bg-neutral-50/50 text-neutral-700"
                    )}
                  >
                    {imgUrl ? (
                      <div className="relative size-8 rounded-lg overflow-hidden shrink-0 border border-neutral-100 bg-neutral-50">
                        <Image
                          src={imgUrl}
                          alt={type.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="size-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
                        <Grid className="size-4 text-neutral-400" />
                      </div>
                    )}

                    <span className="text-xs font-extrabold tracking-wide uppercase line-clamp-1">
                      {type.name}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
