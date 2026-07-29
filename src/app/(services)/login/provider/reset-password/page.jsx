"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { providerAPI } from "@/api/provider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValidPassword = newPassword.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("Invalid or missing token.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await providerAPI.resetPasswordViaToken({
        token,
        new_password: newPassword,
      });

      setIsSuccess(true);
      setMessage("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login/service-provider");
      }, 3000);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Failed to reset password.";
      setIsSuccess(false);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg shadow-sm bg-white dark:bg-zinc-900">
      <h2 className="text-2xl font-semibold mb-4">Reset Your Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter at least 8 characters"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={!isValidPassword || loading}
          className="w-full"
        >
          {loading ? "Submitting..." : "Reset Password"}
        </Button>
      </form>

      {message && (
        <Alert variant={isSuccess ? "success" : "destructive"} className="mt-6">
          <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
