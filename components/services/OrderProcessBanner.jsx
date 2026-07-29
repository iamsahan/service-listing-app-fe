"use client";
import { motion } from "framer-motion";
import { Package, CreditCard, CalendarCheck, Truck } from "lucide-react";

export default function OrderProcessBanner() {
  const steps = [
    {
      icon: <Package size={22} />,
      title: "Select Services",
      desc: "Choose the services you need with ease.",
    },
    {
      icon: <CalendarCheck size={22} />,
      title: "Book Schedule",
      desc: "Pick a date and time that works best for you.",
    },
    {
      icon: <CreditCard size={22} />,
      title: "Secure Payment",
      desc: "Pay safely using our trusted payment system.",
    },
    {
      icon: <Truck size={22} />,
      title: "We Deliver Service",
      desc: "Our team arrives on time to get the job done.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 p-6 bg-muted/40 rounded-lg hidden sm:block"
    >
      <h3 className="text-[0.94rem] font-semibold text-muted-foreground mb-5">
        How We Handle Your Order
      </h3>
      <div className="flex flex-col gap-7">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="p-2 bg-[#5f60b9]/10 text-[#5f60b9] rounded-full shrink-0">
              {step.icon}
            </div>
            <div>
              <h4 className="text-sm font-medium">{step.title}</h4>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
