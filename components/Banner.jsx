"use client";
import React, { useState, useEffect } from "react";
import { bannerAPI } from "@/api/bannerService";
import { useMobile } from "@/src/hooks/useMobile";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const basePath = process.env.NEXT_PUBLIC_API_ENDPOINT;

// aspect ratios (mobile / desktop)
const aspectRatios = {
  service_page_top: "aspect-[1.8/1] md:aspect-[2.4/1]",
  category_page_top: "aspect-[1.5/1] md:aspect-[4/1]",
  category_page_middle: "aspect-[1.5/1] md:aspect-[4/1]",
  booking_details: "aspect-[1.5/1] md:aspect-[2.5/1]",
};

export default function Banner({ cityId, subCategory, position, className }) {
  const isMobile = useMobile();
  const [banner, setBanner] = useState(null);

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
      }
    };
    fetchBanner();
  }, [cityId, subCategory, position]);

  const containerAspect =
    aspectRatios[position] || "aspect-[2/1] md:aspect-[3/1]";

  return (
    <div
      className={cn(
        `relative w-full ${containerAspect} overflow-hidden rounded-md mb-10`,
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
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
