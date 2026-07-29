import { statusGroups } from "@/components/booking/BookingStatus";
import { Circle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const BookingProgressBar = ({ currentStatus }) => {
  const steps = [
    { key: "upcoming", label: "Booked", icon: Circle },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "completed", label: "Completed", icon: CheckCircle },
  ];

  const getCurrentStep = () => {
    for (const [group, statuses] of Object.entries(statusGroups)) {
      if (statuses.includes(currentStatus)) return group;
    }
    return "upcoming";
  };

  const currentStep = getCurrentStep();
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  if (["cancelled", "refunded"].includes(currentStatus)) {
    return null;
  }

  return (
    <div className="w-full px-2 sm:px-6">
      <div className="flex items-center justify-between relative">
        {/* Line */}
        <div className="absolute top-4 sm:top-3.5 left-5 right-5 h-2 sm:h-3 bg-gray-200">
          <div
            className="h-full bg-[#5f60b9] transition-all duration-500 ease-in-out"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 bg-white border-2",
                  {
                    "border-[#5f60b9] bg-[#5f60b9] text-white":
                      isCompleted || isCurrent,
                    "border-gray-300 bg-white text-gray-400": isUpcoming,
                  }
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  {
                    "text-[#5f60b9]": isCompleted || isCurrent,
                    "text-gray-400": isUpcoming,
                  }
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
