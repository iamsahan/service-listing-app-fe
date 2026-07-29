"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarPlus,
  SquareArrowOutUpRight,
  ChevronLeft,
  GalleryVerticalEnd,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function ProfileHeader() {
  const path = usePathname();
  const router = useRouter();

  const handleBack = () => {
    // Skip payment pages
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
    <div className="w-[93vw] bg-[#5f60b9]/10 border h-[4.5rem] top-5 backdrop-blur-sm border-[#5f60b9]/10 rounded-xl mt-5 mb-4 lg:border-none lg:my-0 lg:w-full md:max-w-5xl flex items-center justify-between sticky self-start lg:top-0 lg:h-20 px-5 z-20 lg:bg-white mx-auto">
      <div className="flex items-center">
        {showBackButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2 [&_svg]:size-6"
          >
            <ChevronLeft />
          </Button>
        )}

        {pageTitle === "Overview" && (
          <GalleryVerticalEnd className="size-6 mr-3 ml-2 opacity-0 lg:opacity-100" />
        )}
        <span className="text-xl md:text-2xl font-bold hidden sm:block">
          {pageTitle}
        </span>
      </div>

      <div className="items-center gap-3 flex">
        <Link href="/services">
          <Button
            type="button"
            className="bg-[#5f60b9] hover:bg-[#5f60b9]/90 h-9 px-3 lg:px-4 lg:h-10"
          >
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Explore Services</span>
            <span className="sm:hidden">Services</span>
          </Button>
        </Link>

        <Link href="/">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 lg:px-4 lg:h-10"
          >
            <SquareArrowOutUpRight />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
