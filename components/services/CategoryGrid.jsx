"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Sparkles } from "lucide-react";

export function ExpandableCategory({ categories, cityName }) {
  const [active, setActive] = useState(null);
  const router = useRouter();

  const handleSubCategoryClick = (subCategory) => {
    if (!active) return;
    setActive(null);
    router.push(`/services/${cityName}/${active.slug}/${subCategory.slug}`);
  };

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}${image}`;
  };

  return (
    <>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="w-full h-full max-h-screen sm:h-auto sm:max-h-[90vh] sm:max-w-lg flex flex-col p-0 border-none sm:rounded-2xl overflow-hidden shadow-2xl">
          {active && (
            <>
              <div className="relative h-64 sm:h-56 shrink-0">
                <Image
                  src={getImageUrl(
                    active.image_variants?.small || active.icon_url
                  )}
                  alt={active.name}
                  fill
                  className="w-full h-full object-contain object-top"
                  sizes="(max-width: 640px) 100vw, 400px"
                  unoptimized
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <DialogHeader className="absolute bottom-0 p-6 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="text-white/90 text-sm font-medium">
                      Popular Service
                    </span>
                  </div>
                  <DialogTitle className="text-white text-2xl">
                    {active.name}
                  </DialogTitle>
                </DialogHeader>

                <DialogClose className="absolute top-4 right-4 sm:top-3 sm:right-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-1 transition-colors">
                  <X className="h-4 w-4 text-white" />
                </DialogClose>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {active.SubCategories?.length ? (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {active.SubCategories.sort(
                      (a, b) => a.display_order - b.display_order
                    ).map((sub, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSubCategoryClick(sub)}
                        className="group flex flex-col items-center cursor-pointer gap-3 text-center p-3 rounded-xl hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 transition-all duration-300 hover:scale-105"
                      >
                        <div className="rounded-xl w-16 h-16 sm:w-20 sm:h-20 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow ring-2 ring-transparent group-hover:ring-violet-200">
                          <img
                            src={getImageUrl(sub.icon_url)}
                            alt={sub.name}
                            className="object-cover object-center w-full h-full"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-violet-600 transition-colors">
                          {sub.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <span className="block text-center w-full px-5 text-sm text-muted-foreground">
                      No services available for {active.name}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ul className="max-w-2xl w-full h-full grid grid-cols-3 gap-8 py-4">
        {categories.map((card) => (
          <li key={card.name} className="list-none">
            <div
              className="group w-full cursor-pointer text-xs flex flex-col items-center gap-3 text-center"
              onClick={() => setActive(card)}
            >
              <div className="relative w-full flex justify-center">
                <div className="relative w-[60px] h-[60px] overflow-hidden rounded-lg ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all duration-300">
                  <Image
                    src={getImageUrl(
                      card.image_variants?.thumbnail ||
                        card.image_variants?.original ||
                        card.icon_url
                    )}
                    alt={card.name}
                    fill
                    className="object-cover object-center"
                    sizes="60px"
                    unoptimized
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-[var(--color-primary)] transition-colors">
                {card.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
