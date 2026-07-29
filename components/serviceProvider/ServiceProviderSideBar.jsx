"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { providerAPI } from "@api/provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  LogOut,
  Calendar,
  BookCheck,
  Settings,
  ChartArea,
  Loader2,
  HandCoins,
  Camera,
  IndianRupee,
  Pencil,
  Menu,
  X,
} from "lucide-react";
import { PeopleAltSharp } from "@mui/icons-material";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/src/context/AuthContext";
import { profileAPI } from "@/api/profile";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ServiceProviderSideBar = ({ isProviderDisabled }) => {
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // mobile toggle
  const router = useRouter();

  const fetchProviderData = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.uId) {
        router.push("/login/user");
        return;
      }

      const response = await providerAPI.getProviderByUserId(user.uId);
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  const handleLogout = async () => {
    setLoadingLogout(true);
    logout("/login/service-provider");
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getImageUrl = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_ENDPOINT?.replace(/\/$/, "");
    const userPhoto = profileData?.User?.photo;
    const logo = profileData?.ServiceProviderDocuments?.find(
      (doc) => doc.document_type === "logo"
    )?.document_url;

    const selectedImage = userPhoto || logo;
    if (!selectedImage || !selectedImage.startsWith("/"))
      return "/assets/images/def_pro.webp";

    const cleanedImage = selectedImage.replace(/^https?:\/\//, "");

    return `${apiBase}${cleanedImage}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-72 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const navigationItems = isProviderDisabled
    ? [
        {
          label: "Payouts",
          icon: HandCoins,
          path: "/profile/provider/payouts",
        },
      ]
    : [
        {
          label: "Overview",
          icon: ChartArea,
          path: "/profile/provider",
        },
        {
          label: "Service Management",
          icon: Calendar,
          path: "/profile/provider/services",
        },
        {
          label: "Bookings",
          icon: BookCheck,
          path: "/profile/provider/orders",
        },
        {
          label: "Earnings",
          icon: IndianRupee,
          path: "/profile/provider/payments",
        },
        {
          label: "Payouts",
          icon: HandCoins,
          path: "/profile/provider/payouts",
        },
        ...(profileData?.business_type !== "individual"
          ? [
              {
                label: "Employees",
                icon: PeopleAltSharp,
                path: "/profile/provider/employees",
              },
            ]
          : []),
        {
          label: "Configurations",
          icon: Settings,
          path: "/profile/provider/configurations",
        },
        {
          label: "Notification",
          icon: BookCheck,
          path: "/profile/provider/notifications",
        },
      ];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await profileAPI.uploadPhoto(formData);
      fetchProviderData();
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "lg:hidden fixed top-5 right-4 z-50 p-2 bg-primary text-white rounded-md shadow-md",
          {
            "top-[8.3rem]": isProviderDisabled,
          }
        )}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gray-50 shadow p-6 overflow-y-auto z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:block
          w-full max-w-xs lg:w-72
        `}
      >
        {/* Close button */}
        <button
          className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-6 w-6" />
        </button>

        <div className="space-y-6 mt-16 lg:mt-0">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative w-28 h-28">
              <Image
                src={getImageUrl()}
                alt={profileData?.User?.name || "User"}
                layout="fill"
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
            <h2 className="text-lg font-semibold text-gray-800 mt-3 text-center">
              {profileData?.business_name || profileData?.User?.name}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {profileData?.business_type} Provider
            </p>
          </div>

          {/* Contact Information */}
          <div className="border p-4 rounded-xl space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Email</p>
              <p className="text-sm text-gray-600 break-words">
                {profileData?.User?.email}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Contact</p>
              <p className="text-sm text-gray-600">
                {profileData?.User?.mobile}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">
                Member Since
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(profileData?.User?.created_at)}
              </p>
            </div>

            <Button
              variant="secondary"
              className="w-full bg-gray-200/75 hover:bg-gray-100 [&_svg]:size-3"
              asChild
              disabled={isProviderDisabled}
            >
              <Link href="/profile/provider/settings">
                <Pencil />
                Edit Profile
              </Link>
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-3 mt-5">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start px-3 h-fit hover:bg-gray-100"
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Logout Button */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-fit hover:bg-gray-100 text-destructive"
              onClick={() => setShowLogoutDialog(true)}
              disabled={loadingLogout}
            >
              {loadingLogout ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Logout
            </Button>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You&apos;ll need to log in
                again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loadingLogout}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                disabled={loadingLogout}
                className="bg-red-500 hover:bg-red-600"
              >
                {loadingLogout && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </aside>
    </>
  );
};

export default ServiceProviderSideBar;
