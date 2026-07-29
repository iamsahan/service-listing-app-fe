import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileAPI } from "@/api/profile";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, UserPen } from "lucide-react";

const ProfileForm = ({ userData, isEditing, setIsEditing, onUpdate }) => {
  const [formData, setFormData] = React.useState(userData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.updateProfile(formData, userData.u_id);
      onUpdate();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4 text-left">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Email Address</p>
          <div className="flex items-center">
            <p className="text-xs font-bold text-neutral-800 truncate">{userData.email}</p>
            {userData.email_verified ? (
              <CheckCircle2 className="ml-1.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="ml-1.5 h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Mobile Number</p>
          <p className="text-xs font-bold text-neutral-800">{userData.mobile || "Not set"}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Gender</p>
          <p className="text-xs font-bold text-neutral-800 capitalize">
            {userData.gender || "Not set"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Date of Birth</p>
          <p className="text-xs font-bold text-neutral-800">{userData.dob || "Not set"}</p>
        </div>

        <Button
          onClick={() => setIsEditing(true)}
          variant="secondary"
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider py-3 rounded-xl shadow-none flex items-center justify-center gap-1.5 h-auto mt-2"
        >
          <UserPen className="size-3.5" />
          Edit Profile
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-450">Name</label>
        <Input
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Your name"
          className="rounded-xl border-neutral-200 focus:ring-emerald-500/20 text-xs font-semibold h-10"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-450">Email</label>
        <Input
          type="email"
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Your email"
          className="rounded-xl border-neutral-200 focus:ring-emerald-500/20 text-xs font-semibold h-10"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-455">Gender</label>
        <Select
          value={formData.gender || ""}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
        >
          <SelectTrigger className="rounded-xl border-neutral-200 focus:ring-emerald-500/20 text-xs font-semibold h-10">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-xl shadow-lg border border-neutral-200/50">
            <SelectItem value="male" className="text-xs font-semibold">Male</SelectItem>
            <SelectItem value="female" className="text-xs font-semibold">Female</SelectItem>
            <SelectItem value="other" className="text-xs font-semibold">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-450">Date of Birth</label>
        <Input
          type="date"
          value={formData.dob || ""}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          className="rounded-xl border-neutral-200 focus:ring-emerald-500/20 text-xs font-semibold h-10"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          className="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl py-3 h-auto flex-1 transition-all"
        >
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(false)}
          className="border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl py-3 h-auto flex-1 transition-all"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
