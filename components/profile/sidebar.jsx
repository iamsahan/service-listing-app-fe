"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { profileAPI } from "@/api/profile";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@src/context/AuthContext";
import {
  Camera,
  LogOut,
  Calendar,
  ChartBar,
  Bell,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import ProfileForm from "./ProfileForm";
import { useSocket } from "@src/context/SocketContext";
import LogoutDialog from "../layout/LogoutDialog";

const ProfileSidebar = ({ handleUserLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // toggle state
  const router = useRouter();
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

  if (!userData) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toggle button */}
      <button
        className="lg:hidden fixed top-9 left-7 sm:left-10 z-50 p-2 border rounded-md bg-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-6" />
      </button>

      {/* Dark overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed top-0 left-0 h-screen w-[360px] bg-white border-r border-gray-200 p-6 overflow-y-auto z-50 
    transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
    lg:translate-x-0 lg:static lg:block
  `}
      >
        {/* Close button */}
        <button
          className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-6 w-6" />
        </button>

        <div className="space-y-6 mt-10 lg:mt-0">
          {/* Profile Photo */}
          <div className="flex items-center gap-5">
            <div className="relative size-20 lg:size-24 aspect-square">
              <Image
                src={
                  userData?.photo
                    ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${userData.photo}`
                    : "/assets/images/def_pro.webp"
                }
                alt={userData?.name || "User"}
                fill
                className="rounded-full object-cover"
              />

              <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-5 w-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            <div>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <Card className="p-4">
            <ProfileForm
              userData={userData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onUpdate={fetchUserProfile}
            />
          </Card>

          {/* Navigation */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsOpen(false);
                router.push("/profile/customer");
              }}
            >
              <ChartBar className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsOpen(false);
                router.push("/profile/customer/bookings");
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsOpen(false);
                router.push("/profile/customer/notifications");
              }}
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsOpen(false);
                router.push("/profile/customer/addresses");
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              My Locations
            </Button>
          </div>

          {/* Logout */}
          <Button
            className="w-full bg-red-300/20 text-destructive hover:bg-destructive hover:text-white"
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
