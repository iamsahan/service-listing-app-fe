import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function SubCategoryCard({ icon_url, name, url }) {
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

  const rawImageSrc = icon_url ? process.env.NEXT_PUBLIC_API_ENDPOINT + icon_url : null;
  const safeImageSrc = isValidUrl(rawImageSrc) ? rawImageSrc : "/assets/images/card-1.jpg";

  return (
    <Link href={url}>
      <div className="size-40 lg:size-56 relative rounded-2xl overflow-hidden group cursor-pointer">
        <Image
          src={safeImageSrc}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          priority
          sizes="224px"
          unoptimized
          crossOrigin="anonymous"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Popular badge (optional - shows on hover) */}
        <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-primary)]/90 backdrop-blur-sm rounded-full">
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-semibold">Popular</span>
          </div>
        </div>

        {/* Service name */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <p className="text-white font-semibold text-[0.82rem] sm:text-sm leading-tight">
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
}
