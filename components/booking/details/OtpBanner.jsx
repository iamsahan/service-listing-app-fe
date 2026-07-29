import { Clock } from "lucide-react";

export default function OtpBanner({ otp, status }) {
  return (
    <div className="bg-gradient-to-r from-[#5f60b9]/10 to-[#5f60b9]/5 border border-[#5f60b9]/20 p-4 rounded-xl">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-full bg-[#5f60b9]/20 flex-shrink-0">
          <Clock className="size-4 text-[#5f60b9]" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            Your service OTP is {otp}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Please share this OTP with the provider to{" "}
            {status === "in_progress" ? "complete" : "start"} the booking.
          </p>
        </div>
      </div>
    </div>
  );
}
