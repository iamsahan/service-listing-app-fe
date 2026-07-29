"use client";
import React, { useState, useEffect } from "react";
import { bannerAPI } from "@/api/bannerService";
import { useMobile } from "@/src/hooks/useMobile";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ShieldCheck, Calendar, Star, ArrowRight } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_API_ENDPOINT;

// aspect ratios (mobile / desktop)
const aspectRatios = {
  service_page_top: "aspect-[1.8/1] md:aspect-[2.4/1]",
  category_page_top: "aspect-[1.5/1] md:aspect-[4.1]",
  category_page_middle: "aspect-[1.5/1] md:aspect-[4.1]",
  booking_details: "aspect-[1.5/1] md:aspect-[2.5/1]",
};

export default function Banner({ cityId, subCategory, position, className }) {
  const isMobile = useMobile();
  const [banner, setBanner] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      if (!cityId || !position) return;
      try {
        const res = await bannerAPI.getByPosition({
          city_id: cityId,
          audience: "all",
          position,
          subcategory_id: subCategory ? subCategory.sub_category_id : null,
        });
        setBanner(res.data.banner || null);
      } catch (error) {
        console.error("Error fetching banner:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchBanner();
  }, [cityId, subCategory, position]);

  const containerAspect =
    aspectRatios[position] || "aspect-[2/1] md:aspect-[3/1]";

  if (!isLoaded) {
    return <div className={cn(`w-full ${containerAspect} bg-neutral-100 animate-pulse rounded-3xl mb-10`, className)} />;
  }

  return (
    <div
      className={cn(
        `relative w-full ${containerAspect} overflow-hidden rounded-[2rem] border border-neutral-200/50 mb-10 shadow-sm`,
        className
      )}
    >
      {banner ? (
        <Link href={banner.link_url || "#"} className="block w-full h-full">
          <Image
            src={
              isMobile
                ? basePath +
                  (banner.image_variants?.mobile_image?.image_url || "")
                : basePath + (banner.image_variants?.web_image?.image_url || "")
            }
            alt={banner.title || "Banner"}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            unoptimized
            crossOrigin="anonymous"
          />
        </Link>
      ) : (
        /* Premium Fallback Guarantee Card if no active banner is configured in DB */
        <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 p-6 md:p-10 flex flex-col justify-center text-left relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />
          
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="size-3.5 text-amber-400" />
              ProHive Escrow Guarantee
            </div>
            
            <h3 className="text-white text-lg sm:text-2xl font-black leading-tight">
              Rigorous Checks, Protected Payouts
            </h3>
            
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Every job is covered by our safety auditing team. Payouts remain in escrow until you approve the technician&apos;s work.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
