"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarPlus,
  SquareArrowOutUpRight,
  ChevronLeft,
  LayoutDashboard,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function ProfileHeader() {
  const path = usePathname();
  const router = useRouter();

  const handleBack = () => {
    if (path.includes("/profile/customer/bookings/BKG")) {
      router.push("/profile/customer/bookings");
    } else {
      router.back();
    }
  };

  const currentPage = path.split("/").pop();

  const pageTitle =
    currentPage === "customer"
      ? "Overview"
      : currentPage === "bookings" || currentPage.startsWith("BKG")
      ? "Bookings"
      : currentPage === "notifications"
      ? "Notifications"
      : currentPage === "addresses"
      ? "My Locations"
      : "";

  const showBackButton = currentPage !== "customer";

  return (
    <div className="w-[93vw] bg-white border border-neutral-200/60 shadow-sm h-[4.5rem] top-5 backdrop-blur-md rounded-2xl mt-5 mb-4 lg:border-none lg:my-0 lg:w-full md:max-w-5xl flex items-center justify-between sticky self-start lg:top-0 lg:h-20 px-5 z-20 lg:bg-transparent mx-auto">
      <div className="flex items-center text-left">
        {showBackButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2 [&_svg]:size-5 hover:bg-neutral-100 rounded-xl"
          >
            <ChevronLeft />
          </Button>
        )}

        {pageTitle === "Overview" && (
          <LayoutDashboard className="size-5 mr-2.5 text-neutral-800 hidden lg:block" />
        )}
        <span className="text-lg md:text-xl font-black text-neutral-900 uppercase tracking-tight pl-1">
          {pageTitle}
        </span>
      </div>

      <div className="items-center gap-3 flex">
        <Link href="/services">
          <Button
            type="button"
            className="bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider h-10 px-4 shadow-sm flex items-center gap-1.5"
          >
            <CalendarPlus className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Explore Services</span>
            <span className="sm:hidden">Services</span>
          </Button>
        </Link>

        <Link href="/">
          <Button
            type="button"
            variant="outline"
            className="border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold uppercase tracking-wider h-10 px-4 flex items-center gap-1.5"
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
