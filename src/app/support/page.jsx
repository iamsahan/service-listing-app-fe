"use client";

import TicketMessenger from "@/components/ticketing/TicketMessenger";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import Navbar from "@/components/layout/Navbar";

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  if (!user) return router.push("/login/user?return_url=/support");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100/20">
      <Navbar />

      <div className="flex-1 w-full max-w-2xl lg:py-10 mx-auto mt-16 flex">
        <TicketMessenger bookingId={bookingId} />
      </div>
    </div>
  );
}
