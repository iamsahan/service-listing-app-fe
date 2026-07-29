"use client";
import React, { useState } from "react";
import TicketMessenger from "@/components/ticketing/TicketMessenger";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import SectionBadge from "@/components/home/SectionBadge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LifeBuoy, 
  Clock, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  ChevronDown, 
  ShieldCheck,
  MessageSquare
} from "lucide-react";

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);

  if (!user) return router.push("/login/user?return_url=/support");

  const faqs = [
    {
      q: "How do I reschedule a booking?",
      a: "Go to your Profile dashboard, navigate to Bookings, select the active card and click the 'Reschedule' button. Choose your new slot up to 24 hours prior to service."
    },
    {
      q: "What is your refund policy?",
      a: "Cancellations made 24+ hours before the service get a 100% refund. Within 24 hours, a small booking cancellation penalty may apply depending on provider dispatch status."
    },
    {
      q: "How do I submit verification papers?",
      a: "If you are a service professional, upload your license and IDs directly in Profile > Verification. Our compliance team verifies documents within 48 business hours."
    },
    {
      q: "Are the home services insured?",
      a: "Yes! Every standard service booked through ProHive is protected under our ProShield damage protection program, covering up to $5,000 in unintended damage."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 mt-16 space-y-12">
        
        {/* Support Portal Header Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12 bg-neutral-900 rounded-[2rem] text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10 justify-between shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
        >
          <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex-1 space-y-4 text-left z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-black uppercase tracking-wider border border-white/5">
              <LifeBuoy className="size-3.5 text-emerald-400 animate-spin" />
              ProHive Helpdesk
            </span>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
              How Can We Help You?
            </h1>
            
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
              Submit support tickets, chat directly with active service operators, or review booking resolution paths. We are here to keep your home operations running smoothly.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl z-10 shrink-0 select-none">
            <div className="size-11 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
              <Clock className="size-5.5 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest leading-none">Response Time</span>
              <span className="block text-base font-black text-white mt-1">Under 5 Minutes</span>
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active Operators Online
              </span>
            </div>
          </div>
        </motion.div>

        {/* 12-Column Split Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Chat Messenger Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[550px]"
          >
            <TicketMessenger bookingId={bookingId} />
          </motion.div>

          {/* Right Resource Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Line Cards */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="p-6 bg-white border border-neutral-200/80 rounded-3xl space-y-5 shadow-sm text-left"
            >
              <div className="space-y-1">
                <SectionBadge>Fast Contact</SectionBadge>
                <h3 className="font-extrabold text-sm text-neutral-800">Need Immediate Help?</h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl hover:border-black transition-all group cursor-pointer">
                  <div className="size-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                    <PhoneCall className="size-4.5" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest">Call Priority Line</span>
                    <span className="block text-xs font-extrabold text-neutral-700 mt-0.5 group-hover:text-black transition-colors">+1 (800) PRO-HIVE</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl hover:border-black transition-all group cursor-pointer">
                  <div className="size-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                    <Mail className="size-4.5" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest">Email Helpdesk</span>
                    <span className="block text-xs font-extrabold text-neutral-700 mt-0.5 group-hover:text-black transition-colors">support@prohive.com</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-800 leading-relaxed font-semibold">
                  All chats and messages are secured using SSL. Our support staff will never ask for your account password or payment PIN.
                </p>
              </div>
            </motion.div>

            {/* Quick Accordion FAQs */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="p-6 bg-white border border-neutral-200/80 rounded-3xl space-y-4 shadow-sm text-left"
            >
              <div className="space-y-1">
                <SectionBadge>FAQs</SectionBadge>
                <h3 className="font-extrabold text-sm text-neutral-800">Common Questions</h3>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index} 
                      className="border border-neutral-100 rounded-xl overflow-hidden bg-neutral-50/50"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                        className="w-full p-3.5 flex items-center justify-between gap-2 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <span className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-wide">{faq.q}</span>
                        <ChevronDown className={`size-3.5 text-neutral-400 transition-transform duration-350 shrink-0 ${isOpen ? "rotate-180 text-black" : ""}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="p-3.5 pt-0 text-[10px] text-neutral-500 leading-relaxed font-medium border-t border-neutral-100 bg-white">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </div>

      </main>
    </div>
  );
}
