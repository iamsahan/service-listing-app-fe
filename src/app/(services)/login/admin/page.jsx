"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { LoginAPI } from "@/api/login";
import { useAuth } from "@src/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import { ShieldAlert, Mail, Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, refreshPermissions } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await LoginAPI.adminLogin(email, password);
      if (response.data.success) {
        console.log(response.data);
        login(
          {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role,
            uId: response.data.user.id,
          },
          response.data.permissions
        );

        // Refresh permissions from backend after login
        await refreshPermissions();

        router.push("/admin");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
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

      {isLoading && <LoadingScreen message={"Authenticating Admin...."} />}

      {/* Dynamic light glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Admin Panel Card */}
      <div className="bg-white/95 backdrop-blur-md border border-neutral-200 rounded-[2.5rem] w-full max-w-5xl shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* Left Side: Admin cover illustration */}
        <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[550px] flex flex-col justify-end p-10 overflow-hidden">
          <div className="absolute inset-0 bg-neutral-950">
            <Image
              src="/assets/images/reg_img.png"
              alt="Admin Portal Cover"
              fill
              className="object-cover scale-105 opacity-60 hover:scale-100 transition-transform duration-700 p-2"
              priority
            />
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 text-xs font-bold uppercase tracking-wider text-red-400 rounded-full w-fit">
              <ShieldAlert className="size-3.5" />
              Restricted Area
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              Control Center <br />
              &amp; <span className="bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">Operations</span>
            </h2>
            <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
              Authorized personnel only. Access system statistics, audit payouts, and configure location mapping options.
            </p>
          </div>
        </div>

        {/* Right Side: Credentials forms */}
        <div className="w-full lg:w-1/2 py-12 px-6 sm:px-12 lg:p-16 flex flex-col justify-center text-left">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-xs font-bold text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-red-50 border border-red-100 rounded-full">
                <div className="size-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                  Operations login
                </span>
              </div>
              <h3 className="text-3xl font-black text-neutral-900 mb-1.5">Admin Entry</h3>
              <p className="text-neutral-500 text-sm">
                Provide secure administrative credentials to unlock system control features.
              </p>
            </div>

            <div className="space-y-5">
              
              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 size-4.5 text-neutral-400" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 text-neutral-800 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-semibold text-sm"
                    placeholder="admin@prohive.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">
                  Secret Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 size-4.5 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3.5 text-neutral-800 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-semibold text-sm"
                    placeholder="Enter admin passcode"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Submit */}
              <button
                className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-50"
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
              >
                Unlock Operations Panel
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
