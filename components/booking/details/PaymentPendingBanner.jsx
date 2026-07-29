import { Button } from "@/components/ui/button";
import { CreditCard, XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentPendingBanner({ id }) {
  return (
    <div className="border p-4 rounded-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-red-100/50">
            <XCircle className="size-5 text-red-500" />
          </div>

          <div>
            <p className="font-semibold text-gray-800">Payment Pending</p>
            <p className="text-sm text-gray-600">
              Complete the payment to confirm the booking.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-[#5f60b9]/10 text-[#5f60b9] bg-[#5f60b9]/5 hover:bg-[#5f60b9]/10 hover:border-[#5f60b9] hover:text-[#5f60b9] transition-colors text-xs md:text-sm"
        >
          <Link href={`/payment/${id}`}>
            <CreditCard />
            Pay Now
          </Link>
        </Button>
      </div>
    </div>
  );
}
