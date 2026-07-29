"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { providerAPI } from "@/api/provider";
import { toast } from "@/hooks/use-toast";

export default function EmailPage() {
  const [email, setEmail] = useState("");
  const [existingEmail, setExistingEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await providerAPI.getProfileData();
        setExistingEmail(res.data?.User?.email || "");
      } catch (err) {
        console.error("Failed to load profile", err);
        toast({
          title: "Error",
          description: "Unable to load current email.",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await providerAPI.updateProfile({ email });
      toast({ title: "Success", description: "Email update submitted." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {existingEmail && (
        <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded border border-blue-200">
          <p>
            <strong>Current Email:</strong> {existingEmail}
          </p>
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">New Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter new email"
        />
      </div>

      <div className="text-right">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
