"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { LoginAPI } from "@/api/login";
import { providerAPI } from "@/api/provider";
import { useAuth } from "@src/context/AuthContext";
import { toast } from "@hooks/use-toast";
import { ShieldCheck, Mail, Lock, Sparkles, ArrowLeft } from "lucide-react";

const ServiceProviderLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "business_employee") {
        router.push("/profile/business-employee");
      } else {
        router.push("/profile/provider");
      }
    }
  }, [user]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await LoginAPI.providerLogin(email, password);
      if (response.data.success) {
        login({
          email: response.data.user.email,
          role: response.data.user.role,
          uId: response.data.user.id,
          providerId: response.data.user.provider,
        });

        if (response.data?.user?.role === "business_employee") {
          router.push("/profile/business-employee");
        } else {
          router.push("/profile/provider");
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials");
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setForgotLoading(true);
      await providerAPI.forgotPassword({ email: forgotEmail });

      toast({
        title: "Verification Sent",
        description: "Check your inbox for password reset instructions.",
        variant: "default",
      });

      setForgotEmail("");
      setForgotMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to send verification email.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white bg-grid-pattern px-6 py-12 relative overflow-hidden">
      <style>{`
        .bg-grid-pattern {
          background-size: 30px 30px;
          background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px),
                            linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
        }
      `}</style>

      {/* Background light glow drops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Unified form board */}
      <div className="bg-white/95 backdrop-blur-md border border-neutral-200 rounded-[2.5rem] w-full max-w-5xl shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* Left Side: Cover Illustration */}
        <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[580px] flex flex-col justify-end p-10 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/assets/images/reg_img.png"
              alt="Provider Login Cover Image"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-700 p-2"
              priority
            />
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
          </div>

          {/* Stats Overlay */}
          <div className="relative z-10 flex flex-col space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-emerald-400 rounded-full w-fit">
              <ShieldCheck className="size-3.5 text-amber-400" />
              Specialist Portal
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              Manage Orders <br />
              &amp; <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">Payouts</span>
            </h2>
            <p className="text-neutral-300 text-sm max-w-xs leading-relaxed">
              Login to view new customer bookings, manage business employee slots, or request commission releases.
            </p>
          </div>
        </div>

        {/* Right Side: Account credentials forms */}
        <div className="w-full lg:w-1/2 py-12 px-6 sm:px-12 lg:p-16 flex flex-col justify-center text-left">
          
          {error && !forgotMode && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-xs font-bold text-red-600 text-center">{error}</p>
            </div>
          )}

          {!forgotMode ? (
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Partner Access
                  </span>
                </div>
                <h3 className="text-3xl font-black text-neutral-900 mb-1.5">Specialist Login</h3>
                <p className="text-neutral-500 text-sm">
                  Enter your email credentials to access your dashboard.
                </p>
              </div>

              <div className="space-y-5">
                
                {/* Email address field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 size-4.5 text-neutral-400" />
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3.5 text-neutral-800 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold text-sm"
                      placeholder="e.g. partner@prohive.com"
                      value={email}
                      onChange={(e) => {
                        if (e.target.value?.length < 50) setEmail(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Secret Password
                    </label>
                    <button
                      onClick={() => setForgotMode(true)}
                      className="text-xs text-neutral-400 hover:text-emerald-600 font-bold transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 size-4.5 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-11 pr-12 py-3.5 text-neutral-800 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold text-sm"
                      placeholder="Enter password key"
                      value={password}
                      onChange={(e) => {
                        if (e.target.value?.length < 50) setPassword(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-3.5 text-neutral-400 hover:text-neutral-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash className="size-4.5" /> : <FaEye className="size-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Login buttons */}
                <button
                  className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50"
                  onClick={handleLogin}
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? "Logging in..." : "Login to Workspace"}
                </button>

                {/* Register prompt */}
                <div className="pt-2 text-center">
                  <Link
                    href="/registration/provider"
                    className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Don&apos;t have a specialist account? Apply here
                  </Link>
                </div>

              </div>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <h3 className="text-2xl font-black text-neutral-900 mb-1.5">Reset Password</h3>
                <p className="text-neutral-500 text-sm">
                  Enter your email to receive reset instructions.
                </p>
              </div>

              <div className="space-y-5">
                
                {/* Reset email field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                    Partner Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3.5 text-neutral-800 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold text-sm"
                    placeholder="Enter registered email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                {/* Send trigger */}
                <button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || !isValidEmail(forgotEmail)}
                >
                  {forgotLoading ? "Sending Key..." : "Send Reset Verification"}
                </button>

                {/* Back to login */}
                <button
                  className="w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-800 py-2 text-xs font-bold transition-colors uppercase tracking-wider"
                  onClick={() => setForgotMode(false)}
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-500" />
                  Back to workspace login
                </button>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ServiceProviderLogin;
