"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { profileAPI } from "@/api/profile";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@src/context/AuthContext";
import {
  Camera,
  LogOut,
  Calendar,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import ProfileForm from "./ProfileForm";
import { useSocket } from "@src/context/SocketContext";
import LogoutDialog from "../layout/LogoutDialog";
import { cn } from "@/lib/utils";

const ProfileSidebar = ({ handleUserLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.getProfileByUserId(user.uId);
      setUserData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
      if (error.response?.status === 401) {
        router.push("/login/user");
      }
    }
  };

  const handleLogout = () => {
    setOpenLogoutDialog(false);
    handleUserLogout();
    if (socket) socket.disconnect();
    router.push("/login/user");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      await profileAPI.uploadPhoto(formData);
      fetchUserProfile();
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path) => {
    if (path === "/profile/customer") {
      return pathname === "/profile/customer";
    }
    return pathname.startsWith(path);
  };

  if (!userData) {
    return (
      <div className="p-6 text-left">
        <p className="text-xs font-bold text-neutral-400 animate-pulse">LOADING PROFILE...</p>
      </div>
    );
  }

  const renderNavButton = (path, label, icon) => {
    const active = isActive(path);
    return (
      <Button
        onClick={() => {
          setIsOpen(false);
          router.push(path);
        }}
        className={cn(
          "w-full justify-start rounded-xl font-bold py-3.5 uppercase tracking-wider text-[10px] transition-all duration-200 shadow-none flex items-center gap-2.5 h-auto border-none",
          active
            ? "bg-black text-white hover:bg-neutral-800"
            : "text-neutral-500 hover:text-neutral-900 bg-transparent hover:bg-neutral-100/60"
        )}
      >
        {React.cloneElement(icon, { className: "size-4 shrink-0" })}
        {label}
      </Button>
    );
  };

  return (
    <>
      {/* Toggle button mobile */}
      <button
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 border border-neutral-200 rounded-xl bg-white shadow-sm hover:bg-neutral-50 active:scale-95 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-5 text-neutral-800" />
      </button>

      {/* Dark overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[320px] bg-neutral-50/80 backdrop-blur-md border-r border-neutral-200/60 p-6 overflow-y-auto z-50 
          transform transition-transform duration-300 flex flex-col justify-between
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:block
        `}
      >
        <div className="space-y-6 text-left">
          {/* Close button mobile */}
          <button
            className="lg:hidden absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 p-1 rounded-full hover:bg-neutral-100"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Profile Photo & Name header */}
          <div className="flex items-center gap-4 mt-6 lg:mt-0">
            <div className="relative size-16 shrink-0 aspect-square border border-neutral-200 p-0.5 bg-white rounded-full">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={
                    userData?.photo
                      ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${userData.photo}`
                      : "/assets/images/def_pro.webp"
                  }
                  alt={userData?.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>

              <label className="absolute bottom-0 right-0 p-1.5 bg-black hover:bg-neutral-800 text-white rounded-full cursor-pointer transition-colors shadow-sm">
                <Camera className="h-3.5 w-3.5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-black text-neutral-900 truncate uppercase tracking-tight">{userData.name}</h2>
              <p className="text-[10px] font-bold text-neutral-400 truncate">{userData.email}</p>
            </div>
          </div>

          {/* Profile Form parameters */}
          <Card className="p-4 border border-neutral-200/50 shadow-sm rounded-2xl bg-white">
            <ProfileForm
              userData={userData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onUpdate={fetchUserProfile}
            />
          </Card>

          {/* Navigation link sets */}
          <div className="space-y-1.5 pt-2">
            {renderNavButton("/profile/customer", "Overview", <LayoutDashboard />)}
            {renderNavButton("/profile/customer/bookings", "My Bookings", <Calendar />)}
            {renderNavButton("/profile/customer/notifications", "Notifications", <Bell />)}
            {renderNavButton("/profile/customer/addresses", "My Locations", <MapPin />)}
          </div>
        </div>

        {/* Footer actions: Logout */}
        <div className="mt-8 pt-4 border-t border-neutral-200/60">
          <Button
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-150 rounded-xl font-bold py-3.5 uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5"
            onClick={() => setOpenLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <LogoutDialog
        open={openLogoutDialog}
        onOpenChange={() => setOpenLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default ProfileSidebar;
