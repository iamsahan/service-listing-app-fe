"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOtp } from "@heroui/react";
import { providerAPI } from "@/api/provider";
import { toast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [contacts, setContacts] = useState({
    mobile: "",
    whatsapp_number: "",
    alternate_number: "",
  });

  const [defaultContacts, setDefaultContacts] = useState({
    mobile: "",
    whatsapp_number: "",
    alternate_number: "",
  });

  const [otpMode, setOtpMode] = useState(null);
  const [otp, setOtp] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);

  const RESEND_LIMIT = 3;
  const RESEND_DURATION = 30;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await providerAPI.getProfileData();
        const data = res.data || res;
        const initial = {
          mobile: data?.User?.mobile || "",
          whatsapp_number: data?.whatsapp_number || "",
          alternate_number: data?.alternate_number || "",
        };
        setContacts(initial);
        setDefaultContacts(initial);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load contact info.",
          variant: "destructive",
        });
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  const mask = (num) =>
    num ? num.replace(/^(\d{2})\d{6}(\d{2})$/, "$1******$2") : "";

  const handleChange = async (type) => {
    try {
      await providerAPI.updateProfile({ [type]: contacts[type] });
      setOtpMode({ type, value: contacts[type] });
      setResendCount(0);
      setResendTimer(RESEND_DURATION);
      setDefaultContacts((prev) => ({ ...prev, [type]: contacts[type] }));

      toast({
        title: "OTP Sent",
        description: `OTP sent to your ${type.replace("_", " ")}`,
      });
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || error?.message || "Failed to update.";

      toast({
        title: "Error",
        description: backendMessage,
        variant: "destructive",
      });
    }
  };

  const verifyOtp = async () => {
    try {
      await providerAPI.verifyProfile({ type: otpMode.type, code: otp });
      toast({ title: "Success", description: "Contact verified." });
      setOtpMode(null);
      setOtp("");
      setResendCount(0);
      setResendTimer(0);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || error?.message || "Invalid OTP.";

      toast({
        title: "Error",
        description: backendMessage,
        variant: "destructive",
      });
    }
  };

  const resendOtp = async () => {
    if (resendCount >= RESEND_LIMIT || resendTimer > 0) return;
    try {
      await handleChange(otpMode.type);
      setResendCount((prev) => prev + 1);
      setResendTimer(RESEND_DURATION);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {["mobile", "whatsapp_number", "alternate_number"].map((key) => (
        <div key={key} className="space-y-2">
          <label className="block font-medium capitalize">
            {key.replace("_", " ")}
          </label>
          <div className="flex gap-2 items-center">
            <div className="px-2 py-1 bg-gray-100 rounded select-none">+91</div>
            <Input
              type="tel"
              value={contacts[key]}
              maxLength={10}
              onChange={(e) =>
                setContacts((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={`Enter ${key.replace("_", " ")}`}
            />
            {contacts[key] !== defaultContacts[key] &&
              contacts[key].length === 10 && (
                <Button onClick={() => handleChange(key)}>Change</Button>
              )}
          </div>
        </div>
      ))}

      <Dialog open={!!otpMode} onOpenChange={() => setOtpMode(null)}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Please enter OTP sent to {mask(otpMode?.value || "")}
            </DialogTitle>
          </DialogHeader>
          <InputOtp
            length={6}
            value={otp}
            onValueChange={setOtp}
            variant="faded"
          />
          <div className="mt-4 flex justify-between gap-2">
            <Button variant="outline" onClick={() => setOtpMode(null)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button onClick={verifyOtp}>Verify</Button>

              <Button
                variant="secondary"
                onClick={resendOtp}
                disabled={resendCount >= RESEND_LIMIT || resendTimer > 0}
              >
                Resend OTP {resendTimer > 0 ? `(${resendTimer}s)` : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
