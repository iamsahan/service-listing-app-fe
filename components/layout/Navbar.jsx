"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { useBodyScrollLock } from "@/src/hooks/useScrollLock";
import { useAuth } from "@src/context/AuthContext";
import { Clipboard, HelpCircle, ArrowRight, ArrowUpRight } from "lucide-react";
import { LanguagePicker } from "../LanguagePicker";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import UserProfileMenu from "./UserProfile";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = ["Home", "About", "Services", "Contact"];

// Desktop
const DesktopNav = memo(({ active }) => (
  <div className="hidden lg:flex items-center gap-1 bg-neutral-100/70 border border-neutral-200/70 rounded-full p-1 text-sm">
    {NAV_LINKS.map((item) => {
      const isActive = active === item.toLowerCase();
      return (
        <Link
          key={item}
          href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
          className={cn(
            "font-bold px-4 py-2 rounded-full transition-all duration-200",
            isActive
              ? "bg-neutral-950 text-white shadow-sm"
              : "text-neutral-600 hover:text-neutral-950"
          )}
        >
          {item}
        </Link>
      );
    })}
  </div>
));

DesktopNav.displayName = "DesktopNav";

// Desktop Auth Buttons
const DesktopAuthButtons = memo(({ user, onLogout, path }) => {
  if (!user) {
    return (
      <div className="hidden lg:flex items-center gap-3 text-sm">
        {path !== "/registration/provider" && (
          <Link
            href="/registration/provider"
            className="border border-neutral-200 text-neutral-700 py-2.5 px-5 rounded-full font-bold hover:border-neutral-950 hover:text-neutral-950 transition-all"
          >
            Become a Pro
          </Link>
        )}

        {path !== "/login/user" && (
          <Link href="/login/user">
            <button className="bg-neutral-950 text-white py-2.5 px-5 rounded-full font-bold hover:bg-emerald-500 hover:text-neutral-950 transition-all shadow-sm flex items-center gap-1.5 group">
              Login
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        )}

        <LanguagePicker />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2 font-bold text-sm">
      {user?.role === "customer" && (
        <Link
          href="/profile/customer/bookings"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <span className="size-7 rounded-full bg-emerald-50 flex items-center justify-center">
            <Clipboard className="size-3.5 text-emerald-600" />
          </span>
          My bookings
        </Link>
      )}

      <Link
        href="/support"
        className="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-neutral-100 transition-colors"
      >
        <span className="size-7 rounded-full bg-amber-50 flex items-center justify-center">
          <HelpCircle className="size-3.5 text-amber-600" />
        </span>
        Help
      </Link>

      <LanguagePicker text="sm" />
      <UserProfileMenu user={user} onLogout={onLogout} />
    </div>
  );
});

DesktopAuthButtons.displayName = "DesktopAuthButtons";

// Mobile
const MobileNav = ({ user, isOpen, onClose, onLogout }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="lg:hidden fixed inset-0 top-16 bg-neutral-950 text-white z-30 overflow-y-auto"
      >
        <div className="px-6 py-8">
          <div className="space-y-1">
            {NAV_LINKS.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="flex items-center justify-between py-4 px-4 text-lg font-bold border-b border-white/10 hover:text-emerald-400 transition-colors"
                  onClick={onClose}
                >
                  {item}
                  <ArrowUpRight className="size-4 text-white/40" />
                </Link>
              </motion.div>
            ))}
          </div>

          {!user ? (
            <div className="pt-8 mt-4 space-y-3">
              <Link
                href="/registration/provider"
                onClick={onClose}
                className="block text-center border border-white/15 text-white py-3.5 px-4 rounded-full text-sm font-bold hover:border-emerald-400 hover:text-emerald-400 transition-all"
              >
                Become a Professional
              </Link>

              <Link href="/login/user" onClick={onClose}>
                <button className="w-full bg-emerald-500 text-neutral-950 py-3.5 px-4 rounded-full text-sm font-bold hover:bg-emerald-400 transition-all">
                  Login
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1 pt-6 mt-4 border-t border-white/10">
              {user?.role === "customer" && (
                <Link
                  href="/profile/customer/bookings"
                  onClick={onClose}
                  className="block py-3.5 px-4 text-sm font-bold text-white/80 hover:text-emerald-400 transition-all"
                >
                  My bookings
                </Link>
              )}
              <Link
                href="/support"
                onClick={onClose}
                className="block py-3.5 px-4 text-sm font-bold text-white/80 hover:text-emerald-400 transition-all"
              >
                Help
              </Link>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10 px-4">
                <UserProfileMenu user={user} onLogout={onLogout} onClose={onClose} />
                <LanguagePicker text="sm" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Navbar
const Navbar = () => {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useBodyScrollLock(isMobileMenuOpen);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [path]);

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-neutral-200/70 h-16 lg:h-20 py-4 pl-2 pr-6 md:px-10 fixed w-full z-40 flex justify-center">
      <div className="flex items-center justify-between w-full container">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 -mt-1">
            <div className="relative h-12 w-28 lg:h-20 lg:w-32 lg:-ml-4 shrink-0">
              <Image
                src="/assets/images/prohive_logo.png"
                alt="ProHive Logo"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 112px, 128px"
              />
            </div>
          </Link>

          {/* Desktop */}
          <DesktopNav active={path === "/" ? "home" : path.split("/")[1]} />
        </div>

        {/* Desktop Auth */}
        <DesktopAuthButtons user={user} onLogout={handleLogout} path={path} />

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          <LanguagePicker />
          <button
            className="size-9 flex items-center justify-center rounded-full bg-neutral-950 text-white text-lg"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <MobileNav
          user={user}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />
      </div>
    </nav>
  );
};

export default Navbar;
