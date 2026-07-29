import React from "react";
import {
  Clock,
  ShieldCheck,
  CreditCard,
  BarChart3,
  LifeBuoy,
  IndianRupee,
  Sparkles,
} from "lucide-react";
import SectionBadge from "@/components/home/SectionBadge";

const features = [
  {
    title: "Unlimited Earnings",
    desc: "Start your earning from day one with automatic job allocations.",
    icon: IndianRupee,
    accent: "text-emerald-500 bg-emerald-50 border-emerald-100/50",
  },
  {
    title: "Flexible Work Hours",
    desc: "Enjoy the freedom to toggle availability and choose your working slots.",
    icon: Clock,
    accent: "text-amber-500 bg-amber-50 border-amber-100/50",
  },
  {
    title: "100% Safety Support",
    desc: "A dedicated regional safety team is available for real-time order audits.",
    icon: ShieldCheck,
    accent: "text-emerald-500 bg-emerald-50 border-emerald-100/50",
  },
  {
    title: "Secure Commission Logs",
    desc: "Transparent escrow payouts completed immediately after customer satisfaction.",
    icon: CreditCard,
    accent: "text-neutral-700 bg-neutral-100 border-neutral-200/50",
  },
  {
    title: "Growth Opportunities",
    desc: "Get access to training and upskilling programs to scale your business.",
    icon: BarChart3,
    accent: "text-[#10b981] bg-emerald-50 border-emerald-100/50",
  },
  {
    title: "Elite Partner Desk",
    desc: "Direct helpdesk lines to resolve registration or payout inquiries.",
    icon: LifeBuoy,
    accent: "text-amber-500 bg-amber-50 border-amber-100/50",
  },
];

export default function RegistrationSectionMain() {
  return (
    <section className="px-6 py-16 bg-neutral-50 border border-neutral-200/50 rounded-[2.5rem] text-neutral-900 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <SectionBadge>Partner Perks</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Why Specialists Love ProHive
          </h2>
          <p className="text-neutral-500 text-sm max-w-xl leading-relaxed">
            At ProHive, we respect your skills, timings, and efforts. We build transparent digital infrastructure allowing you to scale your business seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-white border border-neutral-200/60 rounded-3xl space-y-4 hover:shadow-sm transition-all hover:-translate-y-0.5"
              >
                <div className={`size-11 flex items-center justify-center border rounded-xl shrink-0 ${feature.accent}`}>
                  <Icon className="size-5" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
