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
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

const sections = [
  {
    title: "Services Hub",
    items: [
      { name: "Explore Services", url: "/services" },
      { name: "Become A Partner", url: "/registration/provider" },
      { name: "Customer Portal", url: "/login/user" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { name: "Home Dashboard", url: "/" },
      { name: "About ProHive", url: "/about" },
      { name: "Support Desk", url: "/contact" },
    ],
  },
  {
    title: "Security & Legal",
    items: [
      { name: "Terms & Service", url: "/terms-and-conditions" },
      { name: "Privacy Policies", url: "/privacy-policy" },
      { name: "Cancellation Rules", url: "/cancellation-policy" },
    ],
  },
];

const socialLinks = [
  { Icon: Facebook, url: "#", label: "Facebook" },
  { Icon: Linkedin, url: "#", label: "LinkedIn" },
  { Icon: Instagram, url: "#", label: "Instagram" },
  { Icon: Twitter, url: "#", label: "Twitter" },
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
    <footer className="bg-[#09090b] border-t border-neutral-900 mt-auto text-white relative overflow-hidden">
      {/* Decorative vector bg */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 py-16 lg:py-20 max-w-7xl relative z-10">
        
        {/* Top Section: Brand + Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand Info & Contact Column */}
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
              Connecting verified home maintenance, repair, and lifestyle professionals directly to your schedule with secure escrow protection.
            </p>

            {/* Micro Contact details */}
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

            {/* Social Channels */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map(({ Icon, url, label }, index) => (
                <a
                  key={index}
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

          {/* Links Column Grid */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 text-left">
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.items.map((item, i) => (
                    <li key={i}>
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

          {/* Newsletter subscription form */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Stay Connected
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Subscribe to get notified about new cities, booking offers, and support updates.
            </p>
            
            <form onSubmit={handleSubscribe} className="relative flex items-center pt-2">
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

        </div>

        {/* Bottom copyright details */}
        <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-xs">
          <p>&copy; {new Date().getFullYear()} ProHive. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Rules
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
