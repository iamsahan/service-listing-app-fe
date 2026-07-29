"use client";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { profileAPI } from "@api/profile";
import { Button } from "@components/ui/button";
import { toast } from "@hooks/use-toast";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const Page = ({ params }) => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState({
    user_id: "",
    name: "",
    user_type: "",
  });

  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      if (resolvedParams?.token) {
        setToken(resolvedParams.token);
      }
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setTokenData({
          user_id: decodedToken.uid,
          name: decodedToken.name,
          user_type: decodedToken.user_type,
        });
        setIsTokenValid(true);
      } catch (error) {
        setError(
          "Invalid registration link. Please check your email for the correct link."
        );
        setIsTokenValid(false);
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  // Check if email is already verified
  useEffect(() => {
    const checkEmailStatus = async () => {
      if (tokenData.user_id) {
        try {
          setIsLoading(true);
          const response = await profileAPI.checkEmailVerification(
            tokenData.user_id
          );

          if (response.data?.email_verified) {
            setIsVerified(true);
            setError(
              "Email has already been verified. You can close this window."
            );
          }
        } catch (error) {
          console.error("Error checking email verification:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkEmailStatus();
  }, [tokenData.user_id]);

  console.log(tokenData);

  const verifyEmail = async () => {
    try {
      setIsLoading(true);
      await profileAPI.validateEmail(tokenData.user_id);
      setIsVerified(true);
      setError(null);
      toast({
        title: "Success!",
        description: "Your Email Successfully Validated!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error Validating Email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {isLoading ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-md mx-4 p-8 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              Checking verification status...
            </h1>
            <p className="text-gray-600 text-sm">
              Please wait while we verify your information.
            </p>
          </div>
        ) : isVerified ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-md mx-4 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-600">
              Your email has been verified. You can now close this window.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-md mx-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center p-6">
              <h1 className="text-2xl font-bold">Email Verification</h1>
              <p className="mt-2 text-sm">
                Hi {tokenData.name || "Test user"}, let's verify your email!
              </p>
            </div>

            {isTokenValid && !error && (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Click the button below to complete your email verification
                  process.
                </p>
                <Button
                  onClick={verifyEmail}
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-600 text-sm p-4 mt-4 rounded-md mx-6">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
