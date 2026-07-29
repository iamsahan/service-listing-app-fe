import React from "react";
import {
  Clock,
  ShieldCheck,
  CreditCard,
  BarChart3,
  LifeBuoy,
  IndianRupee,
} from "lucide-react";

const features = [
  {
    title: "Unlimited Earnings",
    desc: "Start your earning from day one",
    icon: IndianRupee,
  },
  {
    title: "Flexible Work Hours",
    desc: "Enjoy the freedom to choose your working hours",
    icon: Clock,
  },
  {
    title: "100% Safety",
    desc: "A dedicated safety team is available to assist in unsafe situations",
    icon: ShieldCheck,
  },
  {
    title: "Transparent Payments",
    desc: "Receive timely and transparent payments for every service you provide",
    icon: CreditCard,
  },
  {
    title: "Growth Opportunities",
    desc: "Get access to training and upskilling programs to grow your career",
    icon: BarChart3,
  },
  {
    title: "Partner Support",
    desc: "Our team is available to help you when you need assistance",
    icon: LifeBuoy,
  },
];

export default function RegistrationSectionMain() {
  return (
    <section className="px-2 lg:p-10 lg:bg-gray-50 text-gray-800 rounded-xl">
      <div className="lg:px-6">
        <h2 className="text-xl sm:text-4xl font-bold mb-4">
          Why do Partners love{" "}
          <span className="text-[var(--color-primary)]">QProz?</span>
        </h2>

        <p className="text-gray-600 text-sm mb-12 max-w-2xl">
          At QProz, we respect our partners’ skills and efforts. We know you
          deserve the best, so we strive to give you the best.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center lg:bg-white lg:p-4 lg:rounded-xl"
              >
                <div className="size-14 lg:size-16 flex items-center justify-center bg-[var(--color-primary-light)] rounded-full mb-4 bg-gray-100">
                  <Icon className="w-7 h-7 text-[var(--color-primary)]" />
                </div>

                <h3 className="font-semibold text-base lg:text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs lg:text-sm">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
