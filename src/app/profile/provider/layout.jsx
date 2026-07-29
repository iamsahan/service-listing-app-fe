"use client";

import ServiceProviderSideBar from "@components/serviceProvider/ServiceProviderSideBar";
import NotificationListener from "@/components/serviceProvider/NotificationListener";
import { ProfileRefreshProvider } from "@/src/context/ProfileRefreshContext";
import AlertBanner from "@/components/serviceProvider/AccountAlertBanner";
import { usePathname, useRouter } from "next/navigation";
import { getCookie } from "@/utils/cookieUtils";
import { useEffect, useState } from "react";
import withAuth from "@components/isAuth";

const Layout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isProviderDisabled, setIsProviderDisabled] = useState(false);

  useEffect(() => {
    const token = getCookie("provider_status");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload?.is_disabled) {
        setIsProviderDisabled(true);

        if (pathname !== "/profile/provider/payouts") {
          router.push("/profile/provider/payouts");
        }
      }
    } catch (err) {
      console.error("Error decoding provider_status cookie:", err);
    }
  }, []);

  return (
    <ProfileRefreshProvider>
      <div className="flex">
        <div className="fixed left-0 top-0 h-full w-0 lg:w-64 z-50">
          <ServiceProviderSideBar isProviderDisabled={isProviderDisabled} />
          <NotificationListener disabled={isProviderDisabled} />
        </div>

        <div className="flex-1 lg:ml-72 min-h-screen">
          {isProviderDisabled && <AlertBanner />}
          {children}
        </div>
      </div>
    </ProfileRefreshProvider>
  );
};

export default withAuth(Layout, [
  "service_provider",
  "business_service_provider",
]);
