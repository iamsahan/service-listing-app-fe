"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CustomerBookingsSkeleton() {
  // Render multiple skeleton booking cards
  const placeholders = Array.from({ length: 3 });

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Booking List Placeholder */}
      <div className="space-y-4 sm:space-y-5">
        {placeholders.map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200/75 sm:border-none rounded-xl p-3"
          >
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              {/* Image Placeholder */}
              <Skeleton className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl" />

              {/* Text Details */}
              <div className="flex-1 min-w-0 space-y-5 sm:space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <div className="flex gap-2 mt-1">
                      <Skeleton className="h-4 w-16 rounded-md" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="w-4 h-4 rounded-full" />
                </div>

                {/* Date & Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 -ml-14 sm:ml-0">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
