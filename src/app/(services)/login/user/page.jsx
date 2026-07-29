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
import { MessageCircle, ChevronDown, ArrowLeft } from "lucide-react";
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
        selectedMethod,
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
                enableHighAccuracy: false, // Faster, uses network/wifi location
                timeout: 15000, // Increased timeout to 15 seconds
                maximumAge: 300000, // Accept cached positions up to 5 minutes old
              },
            );
          });

          const { latitude, longitude } = position.coords;
          console.log("User location:", { latitude, longitude });

          // Map coordinates to city using backend LocationService
          try {
            const locationResult = await locationAPI.mapUserToCity(
              latitude,
              longitude,
            );
            cityId = locationResult.data?.cityId;
            console.log("City ID from location service:", cityId);
          } catch (locationError) {
            console.warn("Location mapping error:", locationError.message);
          }
        } catch (locationError) {
          console.warn("Location fetch error:", locationError.message);
          // Continue without city mapping - user can select city later
        }
      } else {
        console.warn("Geolocation not supported by browser");
      }

      const response = await LoginAPI.customerLoginVerifyOTP(
        mobile,
        otp,
        cityId,
      );

      if (response.data.success) {
        login(
          {
            role: "customer",
            uId: response.data.user.id,
          },
          returnUrl,
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
    <div className="min-h-screen flex items-center justify-center lg:bg-gray-50 px-4">
      <div className="lg:bg-white -mt-20 flex flex-col lg:flex-row lg:rounded-2xl lg:border w-full max-w-5xl overflow-hidden">
        {/* Mobile Banner */}
        <div className="relative h-48 w-full lg:hidden rounded-2xl overflow-hidden">
          <Image
            src="/assets/images/login.jpg"
            alt="Login"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/60" />
          <div className="absolute inset-0 flex flex-col justify-end text-white p-6">
            <h2 className="text-2xl font-semibold">Welcome Back!</h2>
            <p className="text-white/80 text-sm">
              Login to access your bookings
            </p>
          </div>
        </div>

        {/* Desktop Image */}
        <div className="hidden lg:block relative w-1/2 min-h-[600px] overflow-hidden">
          <Image
            src="/assets/images/login.jpg"
            alt="Login"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/70" />
          <div className="relative z-10 flex flex-col justify-end h-full text-white p-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-1 leading-tight">
              Welcome Back!
            </h2>
            <p className="text-white/80 text-base">
              Login to access your bookings and services
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 py-8 px-3 lg:p-12 flex flex-col">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="mb-4 md:mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Login</h3>
                <p className="text-gray-600 text-sm hidden md:block">
                  Enter your mobile number to receive OTP
                </p>
              </div>

              <div className="space-y-5">
                {/* Mobile Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center bg-gray-50 px-4 rounded-l-lg border border-r-0 border-gray-300">
                      <span className="text-gray-700 font-medium text-sm notranslate">
                        +91
                      </span>
                    </div>
                    <input
                      type="tel"
                      className="w-full pl-16 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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

                {/* Method Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Method
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-between w-full bg-white border-gray-300 hover:bg-gray-50 h-12 px-4"
                      >
                        <div className="flex items-center gap-2">
                          {selectedMethod === "mobile" ? (
                            <>
                              <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
                              <span className="text-gray-900">SMS</span>
                            </>
                          ) : (
                            <>
                              <FaWhatsapp className="w-4 h-4 text-green-500" />
                              <span className="text-gray-900">WhatsApp</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuItem
                        onClick={() => setSelectedMethod("mobile")}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
                        SMS
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setSelectedMethod("whatsapp")}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FaWhatsapp className="w-4 h-4 text-green-500" />
                        WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Submit Button */}
                <button
                  className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg hover:bg-[##5f60b9]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  onClick={handleSendOtp}
                  disabled={isLoading || !(mobile.length === 12)}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center px-3 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link href="/terms-and-conditions">
                    <span className="text-[var(--color-primary)] font-medium cursor-pointer hover:underline">
                      Terms and Conditions
                    </span>
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy">
                    <span className="text-[var(--color-primary)] font-medium cursor-pointer hover:underline">
                      Privacy Policy
                    </span>
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Verify OTP
                </h3>
                <p className="text-gray-600 text-sm">
                  Enter the 6-digit code sent to +{mobile}
                </p>
              </div>

              <div className="space-y-6">
                {/* OTP Input */}
                <div className="flex justify-center">
                  <InputOtp
                    length={6}
                    value={otp}
                    onValueChange={setOtp}
                    variant="faded"
                  />
                </div>

                {/* Timer/Resend */}
                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-600">
                      OTP expires in{" "}
                      <span className="font-semibold text-gray-900">
                        {Math.floor(timer / 60)}:
                        {String(timer % 60).padStart(2, "0")}
                      </span>
                    </p>
                  ) : (
                    <button
                      className="text-sm text-gray-900 font-medium hover:underline"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                    >
                      {isLoading ? "Resending..." : "Resend OTP"}
                    </button>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg hover:bg-[##5f60b9]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Back Button */}
                <button
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 transition-colors"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
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
