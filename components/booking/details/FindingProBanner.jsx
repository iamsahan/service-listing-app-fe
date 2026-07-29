import { User } from "lucide-react";
import Image from "next/image";

export default function FindingProBanner() {
  return (
    <div className="border p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[#5f60b9]/10">
            <User className="size-5 text-[#5f60b9]" />
          </div>

          <div>
            <p className="font-semibold">Finding a Professional</p>
            <p className="text-sm text-gray-600">
              A service provider will be assigned to you shortly.
            </p>
          </div>
        </div>

        <Image
          src="/assets/images/provider-search.jpeg"
          alt="User Search"
          width={50}
          height={50}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
