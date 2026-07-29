import Image from "next/image";
import { Sparkles, Home, Shield } from "lucide-react";

export function ImagesSection() {
  return (
    <div className="w-full lg:w-4/6 hidden lg:grid grid-cols-2 grid-rows-2 gap-3 auto-rows-[minmax(200px,1fr)]">
      {/* Main large image - left side */}
      <div className="relative col-span-1 row-span-2 rounded-2xl overflow-hidden group">
        <Image
          src="/assets/images/ACTechnician-Banner.png"
          alt="hero_main"
          fill
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          priority
          sizes="(max-width: 1024px) 50vw, 30vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full mb-3">
            <Home className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">
              Service Experts
            </span>
          </div>
          <h3 className="text-white text-3xl font-bold mb-1">
            Your Home, Our Priority
          </h3>
          <p className="text-white/80 text-sm">
            Quality repairs and upgrades that last.
          </p>
        </div>
      </div>

      {/* Top right image */}
      <div className="relative col-span-1 row-span-1 rounded-2xl overflow-hidden group">
        <Image
          src="/assets/images/swiper-1.jpg"
          alt="hero_secondary_1"
          fill
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          priority
          sizes="(max-width: 1024px) 50vw, 30vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Content badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary)]/90 backdrop-blur-sm rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">
              Trusted by Thousands
            </span>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <p className="text-white font-semibold text-sm">
            Fast & Reliable Services
          </p>
        </div>
      </div>

      {/* Bottom right image */}
      <div className="relative col-span-1 row-span-1 rounded-2xl overflow-hidden group">
        <Image
          src="/assets/images/physio.png"
          alt="hero_secondary_2"
          fill
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          priority
          sizes="(max-width: 1024px) 50vw, 30vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Content badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">
              Reliable Professionals
            </span>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <p className="text-white font-semibold text-sm">
            Service You Can Count On
          </p>
        </div>
      </div>
    </div>
  );
}
