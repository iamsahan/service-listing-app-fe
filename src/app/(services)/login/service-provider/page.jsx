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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white flex flex-col lg:flex-row gap-8 lg:gap-14 p-4 lg:p-10 rounded-lg shadow-md w-full max-w-6xl lg:pr-20">
        <div className="flex justify-center items-center w-full lg:w-auto order-1">
          <Image
            src="/assets/images/reg_img.png"
            alt="Provider Login"
            width={500}
            height={100}
            className="border-solid border-2 border-gray-600 rounded-2xl border-opacity-25 p-3 lg:p-5 w-full max-w-md lg:max-w-none"
          />
        </div>

        <div className="w-full lg:ml-12 lg:max-w-sm order-2">
          <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-2">
            {forgotMode ? "Forgot Password" : "Service Provider Login"}
          </h2>
          <p className="text-center mb-6 lg:mb-8 text-sm lg:text-base px-2">
            {forgotMode
              ? "Enter your email to receive a reset link"
              : "Enter your credentials to access your account"}
          </p>

          {error && !forgotMode && (
            <div className="mb-4 text-red-500 text-center text-sm">{error}</div>
          )}

          {!forgotMode && (
            <>
              <div className="relative mb-4 lg:mb-6">
                <input
                  type="email"
                  className="w-full px-4 py-3 lg:py-2 pr-10 text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    if (e.target.value?.length < 50) setEmail(e.target.value);
                  }}
                />
                <FaUser className="absolute right-4 top-3 lg:top-3 text-gray-500" />
              </div>

              <div className="relative mb-4 lg:mb-6">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 lg:py-2 pr-10 text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    if (e.target.value?.length < 50)
                      setPassword(e.target.value);
                  }}
                />
                <div
                  className="absolute right-4 top-3 lg:top-3 text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <button
                className="w-full bg-indigo-500 text-white py-3 lg:py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 font-medium"
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </>
          )}

          {forgotMode && (
            <>
              <div className="mb-4 lg:mb-6">
                <input
                  type="email"
                  className="w-full px-4 py-3 lg:py-2 text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              <button
                className="w-full bg-blue-500 text-white py-3 lg:py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 font-medium"
                onClick={handleForgotPassword}
                disabled={forgotLoading || !isValidEmail(forgotEmail)}
              >
                {forgotLoading ? "Sending..." : "Send Verification"}
              </button>
            </>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setForgotMode(!forgotMode)}
              className="text-blue-500 underline text-sm"
            >
              {forgotMode ? "Back to Login" : "Forgot Password?"}
            </button>
          </div>

          {!forgotMode && (
            <div className="mt-4 text-center px-2">
              <Link
                href="/registration/provider"
                className="text-indigo-500 hover:text-indigo-600 text-sm lg:text-base"
              >
                Don&apos;t have an account? Register as a service provider
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderLogin;
