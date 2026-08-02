"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { LoginAPI } from "@/api/login";
import { locationAPI } from "@/api/locationService";
import { useAuth } from "@src/context/AuthContext";
import { InputOtp } from "@heroui/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { FaWhatsapp } from "react-icons/fa";
import { MessageCircle, ChevronDown, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CustomerLogin = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(120);
  const [selectedMethod, setSelectedMethod] = useState("mobile");

  const { login, user } = useAuth();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/services";

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      window.location.href = returnUrl;
    }
  }, [user, returnUrl]);

  useEffect(() => {
    let countdown;
    if (step === 2 && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setError("OTP expired. Please resend OTP.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [step, timer]);

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await LoginAPI.customerLoginSendOTP(
        mobile,
        selectedMethod
      );
      if (response.data.success) {
        setStep(2);
        setTimer(120); // Reset timer
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      let cityId = null;

      // Get user location and map to city
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error("Location request timed out"));
            }, 15000);

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                clearTimeout(timeoutId);
                resolve(pos);
              },
              (error) => {
                clearTimeout(timeoutId);
                reject(error);
              },
              {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 300000,
              }
            );
          });

          const { latitude, longitude } = position.coords;
          console.log("User location:", { latitude, longitude });

          try {
            const locationResult = await locationAPI.mapUserToCity(
              latitude,
              longitude
            );
            cityId = locationResult.data?.cityId;
            console.log("City ID from location service:", cityId);
          } catch (locationError) {
            console.warn("Location mapping error:", locationError.message);
          }
        } catch (locationError) {
          console.warn("Location fetch error:", locationError.message);
        }
      } else {
        console.warn("Geolocation not supported by browser");
      }

      const response = await LoginAPI.customerLoginVerifyOTP(
        mobile,
        otp,
        cityId
      );

      if (response.data.success) {
        login(
          {
            role: "customer",
            uId: response.data.user.id,
          },
          returnUrl
        );
      } else {
        setError("Invalid OTP");
        setIsLoading(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6 py-12 relative overflow-hidden">
      {/* Dynamic blob light */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass card panel */}
      <div className="bg-white backdrop-blur-md border border-white/10 rounded-[2.5rem] w-full max-w-5xl shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* Left Side: Illustration Panel */}
        <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[600px] flex flex-col justify-end p-10 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/assets/images/login.jpg"
              alt="Login banner image"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-700"
              priority
            />
            {/* Soft gradient screens */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </div>

          {/* Overlay info badges */}
          <div className="relative z-10 flex flex-col space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-emerald-400 rounded-full w-fit">
              <ShieldCheck className="size-3.5 text-amber-400" />
              Secure OTP Portal
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              Welcome Back <br />
              to <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">ProHive</span>
            </h2>
            <p className="text-neutral-300 text-sm max-w-xs leading-relaxed">
              Login to access active schedules, message your provider, or book new custom home repairs.
            </p>
          </div>
        </div>

        {/* Right Side: Action Forms Section */}
        <div className="w-full lg:w-1/2 py-12 px-6 sm:px-12 lg:p-16 flex flex-col justify-center text-left">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-xs font-bold text-red-600 text-center">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              
              {/* Heading */}
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Customer Entrance
                  </span>
                </div>
                <h3 className="text-3xl font-black text-neutral-900 mb-1.5">Sign In</h3>
                <p className="text-neutral-500 text-sm">
                  Enter your mobile coordinates to receive a secure login code.
                </p>
              </div>

              <div className="space-y-5">
                
                {/* Mobile Entry field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-neutral-400 font-extrabold text-sm border-r border-neutral-200 pr-3">
                        +91
                      </span>
                    </div>
                    <input
                      type="tel"
                      className="w-full pl-16 pr-4 py-3.5 text-neutral-800 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold text-sm"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile.slice(2)}
                      onChange={(e) => {
                        const input = e.target.value.replace(/\D/g, "");
                        if (input.length <= 10) {
                          setMobile("91" + input);
                        }
                      }}
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Delivery Selector block */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                    Delivery Method
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-between w-full bg-white border-neutral-200 hover:bg-neutral-50 h-12 rounded-2xl px-4 text-sm font-semibold text-neutral-700 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          {selectedMethod === "mobile" ? (
                            <>
                              <MessageCircle className="w-4 h-4 text-emerald-500" />
                              <span>SMS Text Message</span>
                            </>
                          ) : (
                            <>
                              <FaWhatsapp className="w-4 h-4 text-emerald-500" />
                              <span>WhatsApp Message</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl p-1.5"
                    >
                      <DropdownMenuItem
                        onClick={() => setSelectedMethod("mobile")}
                        className="flex items-center gap-2.5 cursor-pointer rounded-xl font-semibold text-xs py-2.5 text-neutral-700"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-500" />
                        SMS Text Message
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setSelectedMethod("whatsapp")}
                        className="flex items-center gap-2.5 cursor-pointer rounded-xl font-semibold text-xs py-2.5 text-neutral-700"
                      >
                        <FaWhatsapp className="w-4 h-4 text-emerald-500" />
                        WhatsApp Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Submission button */}
                <button
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50"
                  onClick={handleSendOtp}
                  disabled={isLoading || !(mobile.length === 12)}
                >
                  {isLoading ? "Sending Code..." : "Send Verification Code"}
                </button>

                {/* Legal rules */}
                <p className="text-[11px] text-neutral-400 text-center px-4 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link href="/terms-and-conditions" className="text-emerald-600 font-extrabold hover:underline">
                    Terms & Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-emerald-600 font-extrabold hover:underline">
                    Privacy Rules
                  </Link>.
                </p>

              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Heading */}
              <div>
                <h3 className="text-2xl font-black text-neutral-900 mb-1.5">Verify Code</h3>
                <p className="text-neutral-500 text-sm">
                  Input the 6-digit confirmation pin sent to <span className="font-bold text-neutral-800">+{mobile}</span>
                </p>
              </div>

              <div className="space-y-6">
                
                {/* OTP grids */}
                <div className="flex justify-center">
                  <InputOtp
                    length={6}
                    value={otp}
                    onValueChange={setOtp}
                    variant="faded"
                  />
                </div>

                {/* Expiration warning timer */}
                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-xs text-neutral-500">
                      Code expires in{" "}
                      <span className="font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-full ml-1">
                        {Math.floor(timer / 60)}:
                        {String(timer % 60).padStart(2, "0")}
                      </span>
                    </p>
                  ) : (
                    <button
                      className="text-xs text-emerald-600 font-bold hover:underline"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                    >
                      {isLoading ? "Resending..." : "Resend Verification Code"}
                    </button>
                  )}
                </div>

                {/* Verify clicker */}
                <button
                  type="button"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? "Verifying Pin..." : "Confirm & Login"}
                </button>

                {/* Go back */}
                <button
                  className="w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-800 py-2 text-xs font-bold transition-colors uppercase tracking-wider"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                  }}
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-500" />
                  Change Mobile Number
                </button>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CustomerLogin;
