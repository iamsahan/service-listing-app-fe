"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, User2 } from "lucide-react";
import LogoutDialog from "./LogoutDialog";

const UserProfileMenu = ({ user, onLogout }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const router = useRouter();

  const handleNavigateToProfile = () => {
    if (user?.role === "customer") router.push("/profile/customer");
    else if (user?.role === "business_service_provider")
      router.push("/profile/provider");
    else if (user?.role === "business_employee")
      router.push("/profile/business-employee");
    else if (user?.role === "admin") router.push("/admin");
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="flex items-center gap-1">
          <Avatar className="cursor-pointer border-2 items-center">
            <AvatarImage
              src={user?.imageUrl || ""}
              alt="User Avatar"
              className="size-10"
            />

            <AvatarFallback>
              <User2 className="size-4" />
            </AvatarFallback>
          </Avatar>

          <span className="ml-2 text-sm lg:hidden">My Account</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40 mt-3">
          <DropdownMenuItem
            onClick={handleNavigateToProfile}
            className="cursor-pointer"
          >
            <User className="size-4" />
            My Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setConfirmLogout(true)}
            className="text-destructive cursor-pointer focus:text-destructive/90"
          >
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutDialog
        open={confirmLogout}
        onOpenChange={() => setConfirmLogout(false)}
        onConfirm={() => {
          onLogout();
          setConfirmLogout(false);
        }}
      />
    </>
  );
};

export default UserProfileMenu;
