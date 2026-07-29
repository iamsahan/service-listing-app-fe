"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { useBodyScrollLock } from "@/src/hooks/useScrollLock";
import { useAuth } from "@src/context/AuthContext";
import { Clipboard, HelpCircle, LifeBuoy } from "lucide-react";
import { LanguagePicker } from "../LanguagePicker";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import UserProfileMenu from "./UserProfile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = ["Home", "About", "Services", "Contact"];

// Desktop
const DesktopNav = memo(({ active }) => (
  <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
    {NAV_LINKS.map((item) => (
      <Link
        key={item}
        href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
        className={cn(
          "font-semibold hover:text-[var(--color-primary)] transition-all",
          {
            "text-[var(--color-primary)] bg-neutral-100 py-2 px-3.5 rounded-full":
              active === item.toLowerCase(),
          }
        )}
      >
        {item}
      </Link>
    ))}
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
            className="border text-primary/90 py-2 px-5 rounded-full font-medium hover:border-[var(--color-primary)] hover:bg-[#000000]/5 transition-all"
          >
            Register as Professional
          </Link>
        )}

        {path !== "/login/user" && (
          <Link href="/login/user">
            <button className="bg-gradient-to-br to-[var(--color-primary)] from-[var(--color-primary-gradient)] text-white py-2 px-5 rounded-full font-medium hover:bg-neutral-800 transition-all shadow-sm">
              Login
            </button>
          </Link>
        )}

        <LanguagePicker />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-6 font-medium text-sm">
      {user?.role === "customer" && (
        <Link
          href="/profile/customer/bookings"
          className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors"
        >
          <Clipboard className="size-4 text-[var(--color-primary)]" />
          My bookings
        </Link>
      )}

      <Link
        href="/support"
        className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors"
      >
        <HelpCircle className="size-4 text-[var(--color-primary)]" />
        Help
      </Link>

      <LanguagePicker text="sm" />
      <UserProfileMenu user={user} onLogout={onLogout} />
    </div>
  );
});

DesktopAuthButtons.displayName = "DesktopAuthButtons";

// Mobile
const MobileNav = ({ user, isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="lg:hidden bg-gradient-to-b from-white to-gray-50 absolute top-16 left-0 w-full shadow-lg border-b overflow-hidden z-20"
    >
      <div className="px-6 py-5">
        {/* Navigation Links */}
        <div className="space-y-0.5">
          {NAV_LINKS.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="block py-3 px-4 text-[15px] font-medium text-gray-700 hover:text-[var(--color-primary)] hover:bg-neutral-100 rounded-lg transition-all"
                onClick={onClose}
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Auth Section */}
        {!user ? (
          <div className="pt-5 mt-5 border-t border-gray-200">
            <Link
              href="/registration/provider"
              onClick={onClose}
              className="block text-center mb-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] py-3 px-4 rounded-xl text-[15px] font-semibold hover:bg-neutral-100 transition-all shadow-sm"
            >
              Register as Professional
            </Link>

            <Link href="/login/user" onClick={onClose}>
              <button className="w-full bg-gradient-to-br from-[var(--color-primary-gradient)] to-[var(--color-primary)] text-white py-3 px-4 rounded-xl text-[15px] font-semibold hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm">
                Login
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5 pt-4 mt-4 border-t border-gray-200">
            {user?.role === "customer" && (
              <Link
                href="/profile/customer/bookings"
                onClick={onClose}
                className="block py-3 px-4 text-[15px] font-medium text-gray-700 hover:text-[var(--color-primary)] hover:bg-neutral-100 rounded-lg transition-all"
              >
                My bookings
              </Link>
            )}
            <Link
              href="/support"
              onClick={onClose}
              className="block py-3 px-4 text-[15px] font-medium text-gray-700 hover:text-[var(--color-primary)] hover:bg-neutral-100 rounded-lg transition-all"
            >
              Help
            </Link>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-200">
              <UserProfileMenu
                user={user}
                onLogout={onLogout}
                onClose={onClose}
              />
              <LanguagePicker text="sm" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

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
    <nav className="bg-background border-b h-16 lg:h-20 py-4 pl-2 pr-6 md:px-10 fixed w-full z-20 flex justify-center">
      <div className="flex items-center justify-between w-full container">
        <div className="flex items-center gap-4">
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
            className="text-[var(--color-primary)] text-2xl"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
