import { useMobile } from "@/src/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
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
      const headerOffset = 200;
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

  const getImageUrl = (path) => {
    return path && path.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`
      : null;
  };

  return (
    <div className="xl:col-span-3 xl:sticky xl:top-28 xl:self-start flex flex-col bg-white w-full transition-all duration-300">
      <div
        className={cn({
          "bg-white fixed w-full -ml-6 pl-6 top-16 z-10 pt-2 pb-4": isMobile,
        })}
      >
        {/* Back button */}
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent hover:text-muted-foreground flex items-center justify-start gap-1"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Title */}
        <h1 className="text-2xl font-bold">{subCategory?.name}</h1>
      </div>

      <div className="mt-24 md:mt-5">
        {isMobile && (
          <Banner
            cityId={cityId}
            subCategory={subCategory}
            position="service_page_top"
            className="mb-8"
          />
        )}

        {/* Navigation Grid */}
        <ul className="grid grid-cols-3 gap-4 md:gap-8 bg-gray-50 rounded-lg p-5">
          {serviceTypes?.map((type, index) => {
            const id = type.name.toLowerCase().replace(/\s+/g, "-");
            const isActive = activeId === id;
            return (
              <li key={index} className="list-none">
                <a
                  href={`#${id}`}
                  onClick={handleClick(id)}
                  className="flex group flex-col items-center gap-2 md:gap-3"
                >
                  <div className="relative">
                    {type.icon_url && (
                      <Image
                        src={getImageUrl(type.icon_url)}
                        alt={type.name}
                        className="object-cover object-center aspect-square rounded-lg group-hover:ring-gray-200 transition-all duration-300 ring-2 ring-gray-100"
                        width={60}
                        height={60}
                      />
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-xs md:text-sm text-center font-medium text-muted-foreground line-clamp-2 transition-colors duration-200",
                      "md:hover:text-primary",
                      isActive &&
                        "underline underline-offset-2 md:underline-offset-4"
                    )}
                  >
                    {type.name}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
