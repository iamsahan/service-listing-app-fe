import { Skeleton } from "@/components/ui/skeleton";

export function CustomerBookingDetailsSkeleton() {
  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto space-y-4">
      {/* MOBILE HEADER */}
      <div className="space-y-4 bg-gray-50 rounded-xl px-2 py-3 sm:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* STATUS BANNER */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>

      {/* PROVIDER INFO */}
      <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <Skeleton className="h-3 w-56" />
      </div>

      {/* BOOKING DETAILS */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* BOOKING ITEMS */}
      <div className="space-y-4 bg-muted/50 p-5 rounded-lg border">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <hr />
        <div className="space-y-3">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 text-muted-foreground"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
          <hr />
          <div className="space-y-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
