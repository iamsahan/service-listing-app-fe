"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Globe,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const LINK_COLUMNS = [
  {
    title: "Services",
    items: [
      { name: "Explore Services", url: "/services" },
      { name: "Become a Partner", url: "/registration/provider" },
      { name: "Customer Portal", url: "/login/user" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About ProHive", url: "/about" },
      { name: "Support Desk", url: "/contact" },
      { name: "Home", url: "/" },
    ],
  },
  {
    title: "Legal",
    items: [
      { name: "Terms & Service", url: "/terms-and-conditions" },
      { name: "Privacy Policy", url: "/privacy-policy" },
      { name: "Cancellation Rules", url: "/cancellation-policy" },
    ],
  },
];

const SOCIAL_LINKS = [
  { Icon: Facebook, url: "#", label: "Facebook" },
  { Icon: Instagram, url: "#", label: "Instagram" },
  { Icon: Twitter, url: "#", label: "Twitter" },
  { Icon: Linkedin, url: "#", label: "LinkedIn" },
  { Icon: Globe, url: "#", label: "Website" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-neutral-950 mt-auto text-white relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* CTA banner */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-6 max-w-7xl py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to get your home sorted?
            </h2>
            <p className="text-neutral-400 text-sm max-w-md">
              Book a vetted professional in minutes and get back to your day.
            </p>
          </div>
          <Link
            href="/services"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-neutral-950 hover:bg-emerald-400 font-bold text-sm px-7 py-4 rounded-full transition-colors group"
          >
            Book a service now
            <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 lg:py-20 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <Link href="/" className="inline-block">
              <div className="relative w-28 h-12 bg-white/5 border border-white/10 rounded-2xl p-1.5 hover:border-emerald-500/30 transition-colors">
                <Image
                  src="/assets/images/prohive_logo.png"
                  alt="ProHive Logo"
                  fill
                  className="object-contain p-0.5"
                  sizes="112px"
                />
              </div>
            </Link>

            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-xs">
              Connecting verified home maintenance, repair, and lifestyle professionals directly
              to your schedule with secure escrow protection.
            </p>

            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2.5">
                <Phone className="size-3.5 text-emerald-500" />
                <span>+91 63016 14932</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-3.5 text-amber-500" />
                <span>contact@prohive.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="size-3.5 text-neutral-500" />
                <span>Kondapur, Hyderabad, TS</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 text-left">
            {LINK_COLUMNS.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.url}
                        className="text-neutral-400 text-xs sm:text-sm hover:text-emerald-400 hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter + socials */}
          <div className="lg:col-span-3 space-y-5 text-left">
            <div className="space-y-3">
              <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
                Stay Connected
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Get notified about new cities, offers, and support updates.
              </p>

              <form onSubmit={handleSubscribe} className="relative flex items-center pt-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-1 size-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </form>

              <AnimatePresence>
                {subscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400"
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Thanks for subscribing!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {SOCIAL_LINKS.map(({ Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  aria-label={label}
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:border-emerald-500/50 hover:bg-emerald-500 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-xs">
          <p>&copy; {new Date().getFullYear()} ProHive. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
