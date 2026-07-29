"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@src/context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import UserProfileMenu from "../layout/UserProfile";
import Image from "next/image";

const HomeNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getUserInfo = () => {
    try {
      return JSON.parse(localStorage.getItem("user") ?? "null");
    } catch {
      return null;
    }
  };

  useEffect(() => {
    setIsLoggedInState(!!getUserInfo());
  }, []);

  useEffect(() => {
    const closeMenuOnRoute = () => setIsMobileMenuOpen(false);
    router.events?.on("routeChangeComplete", closeMenuOnRoute);
    return () => router.events?.off("routeChangeComplete", closeMenuOnRoute);
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={`${
        isScrolled || isMobileMenuOpen
          ? "bg-white/80 border-b border-neutral-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] backdrop-blur-lg text-neutral-900"
          : "bg-transparent text-white"
      } fixed top-0 left-0 w-full h-[5rem] z-30 transition-all duration-300 py-6 px-6 md:px-10 flex justify-center`}
    >
      {/* Animated Green/Yellow Top Border Indicator when scrolled */}
      {isScrolled && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 z-50 animate-pulse" />
      )}

      {/* Overlay for Hero Transparency */}
      {!isScrolled && !isMobileMenuOpen && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-0" />
      )}

      <div className="flex items-center justify-between w-full max-w-7xl z-10">
        
        {/* Left - Logo + Nav Links */}
        <div className="flex items-center gap-12">
          <div className="font-bold text-xl md:text-3xl -mt-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-sm hover:scale-105 transition-transform">
                <Image
                  src="/assets/images/prohive_logo.png"
                  alt="ProHive Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["Home", "About", "Services", "Contact"].map((item) => (
              <div key={item} className="relative group">
                <Link
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="font-bold text-sm tracking-wide py-2 transition-colors duration-200 hover:text-[#10b981]"
                >
                  {item}
                </Link>
                {/* Slidable animated underline indicator */}
                <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Right - CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/registration/provider"
            className={`border px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-sm ${
              isScrolled
                ? "border-neutral-200 text-neutral-800 hover:border-black hover:bg-neutral-50"
                : "border-white/30 text-white hover:border-white hover:bg-white/10"
            }`}
          >
            Register as Pro
          </Link>

          {!isLoggedInState ? (
            <Link href="/login/user">
              <button className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-[1.02] ${
                isScrolled
                  ? "bg-black text-white hover:bg-neutral-800 hover:shadow-md hover:shadow-emerald-500/10"
                  : "bg-white text-black hover:bg-neutral-100"
              }`}>
                Login
              </button>
            </Link>
          ) : (
            <UserProfileMenu user={getUserInfo()} onLogout={handleLogout} />
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className={`md:hidden text-2xl transition-colors ${
            isScrolled || isMobileMenuOpen ? "text-black" : "text-white"
          }`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute top-14 left-0 w-full p-6 flex flex-col gap-4 md:hidden bg-white/95 backdrop-blur-lg text-neutral-900 shadow-xl border-b border-neutral-100"
            >
              {["Home", "About", "Services", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="block py-2.5 font-bold border-b border-neutral-50 hover:text-emerald-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link
                  href="/registration/provider"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center text-black border border-black/80 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-50"
                >
                  Register as Pro
                </Link>
                {!isLoggedInState ? (
                  <Link href="/login/user" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-black text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-800">
                      Login
                    </button>
                  </Link>
                ) : (
                  <UserProfileMenu user={getUserInfo()} onLogout={handleLogout} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default HomeNavbar;
