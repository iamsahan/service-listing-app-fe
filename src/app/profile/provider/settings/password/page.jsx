"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { providerAPI } from "@/api/provider";
import { toast } from "@/hooks/use-toast";

export default function PasswordPage() {
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    setLoading(true);
    try {
      await providerAPI.resetPassword({
        existing_password: current,
        new_password: newPassword,
      });
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      setCurrent("");
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Update failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block font-medium">Current Password</label>
      <Input
        type="password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="Enter current password"
      />
      <label className="block font-medium">New Password</label>
      <Input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
      />
      <div className="text-right">
        <Button onClick={handlePasswordChange} disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
}
