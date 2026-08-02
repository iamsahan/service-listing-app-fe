"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Hammer,
  ListChecks,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Zap,
  HelpCircle,
  Plus,
  Minus,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import CountUp from "react-countup";
import { FaAppStore, FaGooglePlay } from "react-icons/fa";
import { serviceAPI } from "@/api/services";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/src/hooks/useUserLocation";
import CitySelector from "@components/home/CitySelector";
import SectionBadge from "@/components/home/SectionBadge";
import CategoriesGrid from "./CategoriesGrid";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import animation1 from "../../public/assets/lotties/Animation - 1748414177431.json";

const STATS = [
  {
    icon: Hammer,
    end: 2400,
    suffix: " +",
    label: "Projects Completed",
  },
  {
    icon: Users,
    end: 52,
    suffix: " +",
    label: "Certified Professionals",
  },
  {
    icon: Star,
    end: 96,
    suffix: " %",
    label: "Satisfaction Rate",
  },
  {
    icon: BadgeCheck,
    end: 32,
    suffix: " +",
    label: "Service Offerings",
  },
];

const FEATURES = [
  {
    icon: CheckCircle2,
    title: "Vetted Professionals",
    description:
      "Every provider clears identity checks, credential review, and a quality history audit before accepting bookings.",
    accent: "emerald",
    big: true,
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description: "Funds are held in escrow and only released once your job is confirmed complete.",
    accent: "amber",
  },
  {
    icon: ShieldCheck,
    title: "24/7 Guarantee",
    description: "Every booking is protected by our round-the-clock customer guarantee policy.",
    accent: "rose",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Skip the quote chase — see live availability and book directly onto a schedule.",
    accent: "sky",
  },
];

const STEPS = [
  {
    icon: Calendar,
    title: "Select & Book",
    description: "Choose from our wide range of services available in your city.",
  },
  {
    icon: ListChecks,
    title: "Confirm Details",
    description: "Pick a date and time that works best for you and your provider.",
  },
  {
    icon: ShieldCheck,
    title: "Enjoy & Relax",
    description: "Our certified professionals handle everything with care, start to finish.",
  },
];

const FAQS = [
  {
    question: "How do I book a professional home service?",
    answer:
      "Select your location using our smart city search, pick a service category, choose a preferred schedule that works for you, and book a verified expert directly onto their schedule.",
  },
  {
    question: "Are the service providers background checked?",
    answer:
      "Yes. 100% of the professionals in the ProHive network undergo rigorous credentials checks, identity validation, and past booking quality reviews before being authorized to accept bookings.",
  },
  {
    question: "What if I need to cancel or reschedule my service?",
    answer:
      "Rescheduling is simple. Navigate to your customer booking dashboard, select your order, and choose a new timing. Rescheduling is completely free if done outside the cancellation window.",
  },
  {
    question: "How do payout settlements work?",
    answer:
      "Payments are securely held via our escrow system. Payout settlements to the provider are only cleared once the customer confirms the project is completed to their total satisfaction.",
  },
];

const ACCENT_MAP = {
  emerald: {
    ring: "border-t-emerald-500",
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  amber: {
    ring: "border-t-amber-500",
    icon: "bg-amber-50 text-amber-600 border-amber-100",
  },
  rose: {
    ring: "border-t-rose-500",
    icon: "bg-rose-50 text-rose-600 border-rose-100",
  },
  sky: {
    ring: "border-t-sky-500",
    icon: "bg-sky-50 text-sky-600 border-sky-100",
  },
};

const Home = () => {
  const location = useUserLocation();
  const [categories, setCategories] = useState([]);
  const { toast } = useToast();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await serviceAPI.getAllCategories();
        const sortedCategories = [...categoriesResponse.data].sort(
          (a, b) => a.display_order - b.display_order
        );
        setCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  return (
    <div className="overflow-x-hidden mt-16 lg:mt-20 bg-white min-h-screen text-neutral-900">
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 7s ease infinite;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-6px);
        }
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px);
          background-size: 22px 22px;
        }
      `}</style>

      {/* ===================== HERO ===================== */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        <div className="absolute -top-40 -right-24 w-[520px] h-[520px] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 w-[480px] h-[480px] bg-amber-500/15 rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-6 lg:px-8 max-w-7xl pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-7 space-y-7 text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[11px] font-bold uppercase tracking-widest text-white/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Top-Tier Pro Network
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[3.4rem] font-black leading-[1.08] tracking-tight">
                Home services,
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent animate-gradient">
                  handled properly.
                </span>
              </h1>

              <p className="text-white/60 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
                Connect with vetted, elite home care professionals in minutes. Cleaning,
                repairs, installations and more — booked around your schedule, not theirs.
              </p>

              <div className="w-full max-w-xl bg-white p-3 rounded-2xl shadow-2xl">
                <CitySelector />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <Link href="/services" passHref>
                  <button className="px-7 py-4 bg-white text-neutral-950 font-bold text-sm rounded-full hover:bg-emerald-400 transition duration-300 shadow-lg flex items-center gap-2 group">
                    Explore all services
                    <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-semibold text-white/70 hover:text-white underline underline-offset-4 decoration-amber-400/60 transition-colors"
                >
                  Need help? Contact support
                </Link>
              </div>
            </div>

            {/* Right column visual */}
            <div className="hidden lg:flex lg:col-span-5 relative h-[440px] w-full items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 to-amber-500/10 rounded-full blur-2xl" />

              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                transition={{ duration: 0.6 }}
                className="absolute top-2 left-6 w-64 h-[320px] bg-white p-3 rounded-[2.5rem] shadow-2xl hover:rotate-0 transition-all duration-500 z-10"
              >
                <div className="relative w-full h-full rounded-[1.8rem] overflow-hidden">
                  <Image
                    src="/assets/images/card-1.jpg"
                    alt="Professional at work"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="absolute bottom-6 right-2 w-48 h-48 bg-white rounded-[2rem] shadow-xl p-4 flex items-center justify-center z-20 hover-lift"
              >
                <Lottie animationData={animation1} loop className="w-full h-full object-contain" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30, y: -40 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-10 left-0 bg-white shadow-lg px-4 py-2.5 rounded-full z-30 flex items-center gap-2 -rotate-3 hover:scale-105 transition-transform"
              >
                <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="size-3" />
                </div>
                <span className="text-xs font-bold text-neutral-800">Verified Pros</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40, y: 50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-2 right-8 bg-white shadow-lg px-4 py-2.5 rounded-full z-30 flex items-center gap-2 rotate-3 hover:scale-105 transition-transform"
              >
                <div className="size-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  <Zap className="size-3" />
                </div>
                <span className="text-xs font-bold text-neutral-800">Fast Match</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full py-8 px-6 bg-white border border-neutral-200/80 rounded-3xl shadow-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-150">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center p-3 md:first:pl-0 md:pl-8"
                >
                  <div className="size-11 flex items-center justify-center bg-neutral-950 rounded-xl text-white mb-3">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-black text-2xl md:text-3xl tracking-tight text-neutral-900">
                    <CountUp start={0} end={stat.end} duration={2.5} suffix={stat.suffix} />
                  </span>
                  <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <CategoriesGrid categories={categories} location={location} />
        </div>
      </section>

      {/* ===================== FEATURES (BENTO) ===================== */}
      <section className="py-24 bg-neutral-50 border-t border-b border-neutral-200/60">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
            <SectionBadge>Why Choose Us</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Designed for trust, built for quality
            </h2>
            <p className="text-neutral-500 leading-relaxed">
              We believe home care should be reliable and stress-free. Every provider in the
              ProHive network passes comprehensive testing to ensure a high-end service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const accent = ACCENT_MAP[feature.accent];
              return (
                <div
                  key={feature.title}
                  className={`p-7 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:shadow-lg transition-all duration-300 border-t-4 ${accent.ring} hover-lift ${
                    feature.big ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className={`size-11 border rounded-xl flex items-center justify-center ${accent.icon}`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-bold text-lg text-neutral-900">{feature.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <SectionBadge>Booking Guide</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Settle your project in 3 easy steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[3.6rem] left-[16%] right-[16%] h-px bg-neutral-200" />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative z-10 p-8 rounded-3xl bg-neutral-950 text-white overflow-hidden group hover-lift">
                  <div className="absolute right-5 bottom-[-14px] text-[6.5rem] font-black text-white/5 select-none leading-none">
                    0{idx + 1}
                  </div>
                  <div className="relative space-y-5">
                    <div className="size-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center">
                      <Icon className="size-6 text-emerald-400" />
                    </div>
                    <h3 className="font-extrabold text-xl">{step.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed max-w-xs">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="py-24 bg-neutral-50 border-t border-b border-neutral-200/60">
        <div className="container mx-auto px-6 max-w-3xl text-left">
          <div className="text-center space-y-4 mb-16">
            <SectionBadge>Common Inquiries</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">
              Frequently asked questions
            </h2>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">
              Have questions about booking home services with ProHive? Find quick answers below.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-neutral-800 hover:text-black transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="size-4 text-emerald-500 shrink-0" />
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus className="size-4 text-amber-500 shrink-0" />
                    ) : (
                      <Plus className="size-4 text-neutral-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-sm text-neutral-500 leading-relaxed border-t border-neutral-100 pt-4 bg-neutral-50/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== DOWNLOAD CTA ===================== */}
      <section className="py-24 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="p-8 md:p-16 bg-neutral-950 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 justify-between shadow-2xl">
            <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />

            <div className="flex-1 space-y-6 text-left z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider border border-white/10">
                Mobile Application
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
                Everything you need, <br />
                right in your pocket.
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-md leading-relaxed">
                Download the ProHive application today. Track bookings, chat with professionals,
                and manage payouts instantly.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.qproz.customer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-neutral-100 text-black px-6 py-3 rounded-full flex items-center gap-3 transition duration-300 font-semibold text-sm shadow-md hover:shadow-lg"
                >
                  <FaGooglePlay size={18} className="text-emerald-600" />
                  Google Play
                </Link>
                <Link
                  href="https://apps.apple.com/br/app/qproz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-6 py-3 rounded-full flex items-center gap-3 transition duration-300 font-semibold text-sm shadow-md hover:shadow-lg"
                >
                  <FaAppStore size={18} className="text-amber-500" />
                  App Store
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[420px] flex justify-center z-10">
              <div className="relative w-full h-[280px] sm:h-[350px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 hover:border-emerald-500/40 transition-colors duration-500">
                <Image
                  src="/assets/images/qpp-bg.png"
                  alt="App Mockup Preview"
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
