"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const groupLabels = {
  upcoming: "Upcoming",
  pending: "Payment Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const statusGroups = {
  upcoming: ["accepted", "confirmed", "assigned"],
  pending: ["payment_pending"],
  in_progress: ["in_progress"],
  completed: ["completed"],
  cancelled: ["cancelled"],
  refunded: ["refunded"],
};

const BookingStatus = ({ selectedGroup, onGroupChange }) => {
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-2 lg:gap-x-3 lg:gap-y-3 max-w-full">
      {Object.entries(groupLabels).map(([groupKey, groupName]) => (
        <Badge
          key={groupKey}
          variant={selectedGroup === groupKey ? "secondary" : "outline"}
          onClick={() => onGroupChange(groupKey)}
          className={cn("py-1.5 px-4 cursor-pointer font-medium", {
            "bg-[#5f60b9]/10 text-[#5f60b9] outline outline-1 outline-[#5f60b9]/50":
              selectedGroup === groupKey,
          })}
        >
          {selectedGroup === groupKey && (
            <Check className="-ml-1 mr-1.5 size-3.5" />
          )}

          <span>{groupName}</span>
        </Badge>
      ))}
    </div>
  );
};

export default BookingStatus;
