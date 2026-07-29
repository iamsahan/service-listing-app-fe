"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { providerAPI } from "@/api/provider";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await providerAPI.verifyProfile({
          type: "email",
          code: token,
        });

        setStatus("success");
        setMessage(response?.message || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Verification failed."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      {status === "loading" && <p className="text-lg">Verifying...</p>}

      {status !== "loading" && (
        <>
          <h2
            className={`text-2xl font-semibold ${
              status === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {status === "success" ? "Success!" : "Verification Failed"}
          </h2>
          <p className="mt-2 text-gray-600">{message}</p>

          <div className="mt-6 flex gap-4">
            <Button onClick={() => router.push("/")}>Go to Home</Button>

            <Button
              variant="outline"
              onClick={() => router.push("/profile/provider")}
            >
              Go to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
