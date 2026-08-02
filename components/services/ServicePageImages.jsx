import Image from "next/image";
import { CheckCircle, Home, Shield } from "lucide-react";

export function ImagesSection() {
  return (
    <div className="w-full hidden lg:grid grid-cols-2 grid-rows-2 gap-3 h-[420px]">
      {/* Main large image - left side */}
      <div className="relative col-span-1 row-span-2 rounded-[2rem] overflow-hidden group border border-neutral-200">
        <Image
          src="/assets/images/ACTechnician-Banner.png"
          alt="hero_main"
          fill
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 50vw, 30vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full mb-3">
            <Home className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              Service Experts
            </span>
          </div>
          <h3 className="text-white text-2xl font-black mb-1">
            Your Home, Our Priority
          </h3>
          <p className="text-neutral-300 text-xs">
            Quality repairs and upgrades that last.
          </p>
        </div>
      </div>

      {/* Top right image */}
      <div className="relative col-span-1 row-span-1 rounded-[2rem] overflow-hidden group border border-neutral-200">
        <Image
          src="/assets/images/swiper-1.jpg"
          alt="hero_secondary_1"
          fill
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 50vw, 30vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Content badge */}
        <div className="absolute top-4 left-4 z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">
              Trusted by Thousands
            </span>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
          <p className="text-white font-extrabold text-sm uppercase tracking-wide">
            Fast &amp; Reliable Services
          </p>
        </div>
      </div>

      {/* Bottom right image */}
      <div className="relative col-span-1 row-span-1 rounded-[2rem] overflow-hidden group border border-neutral-200">
        <Image
          src="/assets/images/physio.png"
          alt="hero_secondary_2"
          fill
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 50vw, 30vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Content badge */}
        <div className="absolute top-4 left-4 z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-md border border-white/10 rounded-full">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">
              Reliable Professionals
            </span>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
          <p className="text-white font-extrabold text-sm uppercase tracking-wide">
            Service You Can Count On
          </p>
        </div>
      </div>
    </div>
  );
}
