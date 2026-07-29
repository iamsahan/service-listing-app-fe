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
import { X, LayoutGrid, CheckCircle } from "lucide-react";

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
        <DialogContent className="w-full h-full max-h-screen sm:h-auto sm:max-h-[90vh] sm:max-w-lg flex flex-col p-0 border-none sm:rounded-[2rem] overflow-hidden shadow-2xl bg-white">
          {active && (
            <>
              <div className="relative h-64 sm:h-56 shrink-0">
                <Image
                  src={getImageUrl(
                    active.image_variants?.small || active.icon_url
                  )}
                  alt={active.name}
                  fill
                  className="w-full h-full object-contain object-top p-4"
                  sizes="(max-width: 640px) 100vw, 400px"
                  unoptimized
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <DialogHeader className="absolute bottom-0 p-6 z-20 text-left">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <CheckCircle className="size-3.5 text-emerald-400" />
                    <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">
                      Verified Category
                    </span>
                  </div>
                  <DialogTitle className="text-white text-2xl font-black">
                    {active.name}
                  </DialogTitle>
                </DialogHeader>

                <DialogClose className="absolute top-4 right-4 sm:top-3 sm:right-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-1.5 transition-colors">
                  <X className="h-4 w-4 text-white" />
                </DialogClose>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {active.SubCategories?.length ? (
                  <div className="grid grid-cols-3 gap-4">
                    {active.SubCategories.sort(
                      (a, b) => a.display_order - b.display_order
                    ).map((sub, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSubCategoryClick(sub)}
                        className="group flex flex-col items-center cursor-pointer gap-2.5 text-center p-3 rounded-2xl hover:bg-emerald-50/50 transition-all duration-300"
                      >
                        <div className="rounded-xl w-16 h-16 sm:w-20 sm:h-20 overflow-hidden shadow-sm group-hover:shadow-md ring-2 ring-transparent group-hover:ring-emerald-100 transition-all bg-neutral-50 flex items-center justify-center">
                          <img
                            src={getImageUrl(sub.icon_url) || "/assets/images/card-1.jpg"}
                            alt={sub.name}
                            className="object-cover object-center w-full h-full"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <span className="text-xs font-bold text-neutral-700 group-hover:text-emerald-700 transition-colors">
                          {sub.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/50 flex items-center justify-center mb-3">
                      <LayoutGrid className="w-5 h-5 text-neutral-400" />
                    </div>
                    <span className="block text-center w-full px-5 text-xs text-neutral-400 font-bold">
                      No services configured for {active.name}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Categories listing grid in sidebar */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {categories.map((category) => (
          <button
            key={category.category_id}
            onClick={() => setActive(category)}
            className="flex items-center gap-3 p-3.5 bg-white border border-neutral-200/60 hover:border-emerald-500/30 hover:bg-emerald-50/20 rounded-2xl transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-neutral-50 ring-1 ring-neutral-100 group-hover:ring-emerald-100 transition-all flex items-center justify-center">
              <img
                src={getImageUrl(category.icon_url) || "/assets/images/card-1.jpg"}
                alt={category.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
