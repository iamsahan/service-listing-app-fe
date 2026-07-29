"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import CitySelector from "@components/home/CitySelector";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Calendar,
  CircleCheckBig,
  Hammer,
  Layers,
  ListChecks,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  HelpCircle,
  Plus,
  Minus,
} from "lucide-react";
import ServiceCard from "@/components/home/ServiceCard";
import CountUp from "react-countup";
import { useToast } from "@/hooks/use-toast";
import { FaAppStore, FaGooglePlay } from "react-icons/fa";
import { serviceAPI } from "@/api/services";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import PageSection from "@/components/PageSection";
import AnimatedButton from "@/components/home/AnimatedButton";
import SectionBadge from "@/components/home/SectionBadge";
import { useUserLocation } from "@/src/hooks/useUserLocation";
import PopularCategoriesWheel from "./PopularCategoriesWheel";

// Import Lottie dynamically to avoid Next.js Server-Side Rendering (SSR) issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import animation1 from "../../public/assets/lotties/Animation - 1748414177431.json";

const Home = () => {
  const location = useUserLocation();
  const [categories, setCategories] = useState([]);
  const { toast } = useToast();

  // State for interactive FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);

  // Fetch categories
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

  const steps = [
    {
      title: "1. Select & Book",
      description: "Choose from our wide range of services available in your city.",
      icon: <Calendar size={28} className="text-emerald-600" />,
      theme: "from-emerald-500/5 to-transparent",
    },
    {
      title: "2. Confirm Details",
      description: "Pick a date and time that works best for you and your provider.",
      icon: <ListChecks size={28} className="text-amber-500" />,
      theme: "from-amber-500/5 to-transparent",
    },
    {
      title: "3. Enjoy & Relax",
      description: "Our certified professionals will handle everything with care.",
      icon: <ShieldCheck size={28} className="text-emerald-500" />,
      theme: "from-emerald-500/5 to-transparent",
    },
  ];

  const stats = [
    {
      icon: <Hammer className="size-5 md:size-6 text-emerald-600" />,
      count: <CountUp start={0} end={2400} duration={2.75} suffix=" +" />,
      label: "Projects Completed",
      accent: "hover:border-emerald-500/30",
    },
    {
      icon: <Users className="size-5 md:size-6 text-amber-500" />,
      count: <CountUp start={0} end={52} duration={3.75} suffix=" +" />,
      label: "Certified Professionals",
      accent: "hover:border-amber-500/30",
    },
    {
      icon: <Star className="size-5 md:size-6 text-emerald-600 animate-spin-slow" />,
      count: <CountUp start={0} end={96} duration={2.75} suffix=" %" />,
      label: "Satisfaction Rate",
      accent: "hover:border-emerald-500/30",
    },
    {
      icon: <Layers className="size-5 md:size-6 text-neutral-800" />,
      count: <CountUp start={0} end={32} duration={3.75} suffix=" +" />,
      label: "Service Offerings",
      accent: "hover:border-neutral-400/30",
    },
  ];

  const faqs = [
    {
      question: "How do I book a professional home service?",
      answer: "Select your location using our smart city search, pick a service category, choose a preferred schedule that works for you, and book a verified expert directly onto their schedule.",
    },
    {
      question: "Are the service providers background checked?",
      answer: "Yes. 100% of the professionals in the ProHive network undergo rigorous credentials check, identity validation, and past booking quality reviews before being authorized to accept bookings.",
    },
    {
      question: "What if I need to cancel or reschedule my service?",
      answer: "Rescheduling is simple. Navigate to your customer booking dashboard, select your order, and choose a new timing. Rescheduling is completely free if done outside the cancellation window.",
    },
    {
      question: "How do payout settlements work?",
      answer: "Payments are securely held via our escrow system. Payout settlements to the provider are only cleared once the customer confirms the project is completed to their total satisfaction.",
    },
  ];

  return (
    <div className="overflow-x-hidden mt-16 lg:mt-20 bg-white min-h-screen text-black">
      {/* Dynamic styles injected directly */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 6s ease infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .glow-emerald {
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.15);
        }
        .glow-amber {
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.15);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-6px);
        }
        .faq-accordion {
          transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px),
                            linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[38rem] py-16 md:py-24 lg:py-28 flex flex-col justify-center items-center overflow-hidden border-b border-neutral-100 bg-gradient-to-tr from-emerald-50/20 via-white to-amber-50/20 bg-grid-pattern">

        <div className="absolute top-[-50px] right-[10%] w-[450px] h-[450px] bg-emerald-100/50 rounded-full blur-[90px] opacity-40 pointer-events-none animate-pulse" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-[90px] opacity-35 pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-8 z-10 w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Column: Typography & Selector */}
            <div className="lg:col-span-7 text-left space-y-6 md:space-y-8">

              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-800 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
                Top-Tier Pro Network
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Professional Home Services, <br />
                <span className="bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-500 bg-clip-text text-transparent animate-gradient">
                  Simplified.
                </span>
              </h1>

              <p className="text-neutral-500 text-base sm:text-lg max-w-xl leading-relaxed">
                Stop wasting hours looking for verified support. Connect with vetted, elite home care professionals. Book cleaning, installations, repairs, and support tailored exactly to your schedule.
              </p>

              {/* City Selection Search Box */}
              <div className="w-full max-w-xl bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-200/80 shadow-lg hover:border-emerald-500/40 transition-all duration-300">
                <CitySelector />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link href="/services" passHref>
                  <button className="px-7 py-4 bg-black text-white font-semibold text-sm rounded-full hover:bg-neutral-800 transition duration-300 shadow-md flex items-center gap-2 group hover:shadow-lg">
                    Explore all services
                    <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform text-[#10b981]" />
                  </button>
                </Link>
                <Link href="/contact" className="text-sm font-semibold text-neutral-600 hover:text-black underline underline-offset-4 decoration-[#f59e0b] hover:decoration-[#10b981] transition-all">
                  Need Help? Contact support
                </Link>
              </div>
            </div>

            {/* Right Column: Lottie Animation, Real Service Images & Masonry Badges */}
            <div className="hidden lg:flex lg:col-span-5 relative h-[450px] w-full items-center justify-center">
              {/* Glowing Background Ring */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-amber-500/10 rounded-full blur-2xl animate-pulse" />

              {/* Main Service Image Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                transition={{ duration: 0.6 }}
                className="absolute top-4 left-6 w-64 h-[320px] bg-white p-3 rounded-[2.5rem] border border-neutral-200 shadow-2xl hover:rotate-0 transition-all duration-500 z-10"
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

              {/* Overlapping Floating Lottie Container */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="absolute bottom-8 right-6 w-48 h-48 bg-white/90 backdrop-blur-md rounded-[2rem] border border-neutral-200 shadow-xl p-4 flex items-center justify-center z-20 hover-lift hover:border-emerald-500/40"
              >
                <Lottie animationData={animation1} loop={true} className="w-full h-full object-contain" />
              </motion.div>

              {/* Floating Badge 1: Verified Expert */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: -40 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-12 left-0 bg-white/95 backdrop-blur-md border border-neutral-100 shadow-lg px-4 py-2.5 rounded-full z-30 flex items-center gap-2 transform rotate-[-3deg] hover:scale-105 transition-transform"
              >
                <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="size-3" />
                </div>
                <span className="text-xs font-bold text-neutral-800">Verified Pros</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>

              {/* Floating Badge 2: Super Fast Booking */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-4 right-0 bg-white/95 backdrop-blur-md border border-neutral-100 shadow-lg px-4 py-2.5 rounded-full z-30 flex items-center gap-2 transform rotate-[3deg] hover:scale-105 transition-transform"
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

      {/* Stats Counter Section */}
      <section className="relative w-full z-20 -mt-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full py-8 px-6 bg-white border border-neutral-200/80 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-150">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`flex flex-col items-center text-center p-3 md:first:pl-0 md:pl-8 border border-transparent rounded-2xl hover-lift ${stat.accent}`}
              >
                <div className="size-11 flex items-center justify-center bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 mb-3">
                  {stat.icon}
                </div>
                <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-neutral-900">
                  {stat.count}
                </span>
                <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Popular Categories Grid Select */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">

          <PopularCategoriesWheel categories={categories} location={location} />

        </div>
      </section>

      {/* Why ProHive Grid Section */}
      <section className="py-24 bg-neutral-50 border-t border-b border-neutral-200/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left section details */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <SectionBadge>Why Choose Us</SectionBadge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Designed for Trust, Built for Quality
              </h2>
              <p className="text-neutral-500 leading-relaxed max-w-md">
                We believe home care should be reliable and stress-free. Every provider in the ProHive network passes comprehensive testing to ensure a high-end service.
              </p>
              <div className="border-l-4 border-[#10b981] pl-4 space-y-2">
                <h4 className="font-bold text-neutral-800">100% Satisfaction Guaranteed</h4>
                <p className="text-xs text-neutral-500">Not satisfied with your booking? We will work to make it right immediately.</p>
              </div>
            </div>

            {/* Right section cards grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Card 1 */}
              <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow border-t-4 border-t-emerald-500 hover:scale-[1.02] hover-lift">
                <div className="size-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-[#10b981]">
                  <CheckCircle2 className="size-5 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">Vetted Professionals</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  We check credentials, identity checks, and past booking reviews of all providers before authorization.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow border-t-4 border-t-neutral-800 hover:scale-[1.02] hover-lift">
                <div className="size-10 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-800">
                  <TrendingUp className="size-5" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">Secure Payments</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Pay directly via secure commission logs. Your payment is held securely and settled only when the job is done.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow border-t-4 border-t-red-500 hover:scale-[1.02] hover-lift">
                <div className="size-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-[#ef4444]">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">24/7 Security Guarantee</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Rest easy. All bookings are covered by our customer guarantee policy to provide full peace of mind.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow border-t-4 border-t-amber-500 hover:scale-[1.02] hover-lift">
                <div className="size-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-[#f59e0b]">
                  <Zap className="size-5 animate-bounce" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">Instant Booking</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  No more waiting for quotes. Find available professionals instantly and book directly onto their schedule.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Numeric Steps How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <SectionBadge>Booking Guide</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Settle Your Project in 3 Easy Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">

            {/* Step Connector Line Background */}
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 z-0 border-dashed border-t-2 border-neutral-200" />

            {steps.map((step, idx) => {
              const ringColor = idx % 2 === 0 ? "border-emerald-500 hover:glow-emerald" : "border-amber-500 hover:glow-amber";

              return (
                <div key={idx} className={`relative p-8 bg-gradient-to-b ${step.theme} border border-neutral-100 rounded-3xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group z-10`}>
                  {/* Massive background card numbers */}
                  <div className="absolute right-4 bottom-[-10px] text-8xl font-black text-neutral-200/40 select-none group-hover:text-neutral-300/40 transition-colors">
                    0{idx + 1}
                  </div>

                  <div className="relative z-10 space-y-5">
                    <div className={`size-14 bg-white border-2 ${ringColor} rounded-2xl flex items-center justify-center shadow-sm transition-all`}>
                      {step.icon}
                    </div>
                    <h3 className="font-extrabold text-xl text-neutral-900">{step.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section className="py-24 bg-neutral-50 border-t border-b border-neutral-200/50">
        <div className="container mx-auto px-6 max-w-3xl text-left">
          <div className="text-center space-y-4 mb-16">
            <SectionBadge>Common Inquiries</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">
              Have questions about booking home services with ProHive? Find quick answers to help you navigate below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
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

      {/* Download CTA Section */}
      <section className="py-24 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="p-8 md:p-16 bg-neutral-900 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 justify-between shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />

            {/* Left elements */}
            <div className="flex-1 space-y-6 text-left z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider border border-white/5">
                Mobile Application
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                Everything you need, <br />
                right in your pocket.
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-md leading-relaxed">
                Download the ProHive application today. Settle bookings, trace orders, chat with professionals, and manage payouts instantly.
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

            {/* Right mock image frame */}
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
