"use client";

import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLoader from "./PageLoader";

const isAllowed = (permissions, requirement) => {
  if (!requirement) return true;
  if (!permissions) return false;

  const modulePerm = permissions[requirement.module];

  if (modulePerm === true) return true;
  if (modulePerm && typeof modulePerm === "object") {
    if (!requirement.action) return true;
    return modulePerm[requirement.action] === true;
  }

  return false;
};

const withAdminAuth = (WrappedComponent, permission = null) => {
  const ROLES_WITH_PERMISSION_CHECK = [
    "super_admin",
    "admin",
    "moderator",
    "customer_manager",
  ];
  const ALLOWED_ADMIN_ROLES = [
    "super_admin",
    "admin",
    "moderator",
    "customer_manager",
  ];

  const WithAdminAuthComponent = (props) => {
    const { user, permissions, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        // Check if user exists and has an allowed admin role
        if (!user || !ALLOWED_ADMIN_ROLES.includes(user.role)) {
          router.replace("/login/admin");
          return;
        }

        // Only enforce permission checks for specific roles
        const needsPermissionCheck = ROLES_WITH_PERMISSION_CHECK.includes(
          user.role,
        );

        if (
          needsPermissionCheck &&
          permission &&
          !isAllowed(permissions, permission)
        ) {
          router.replace("/not-authorized");
          return;
        }
      }
    }, [user, permissions, loading, router, permission]);

    if (loading) return <PageLoader message="Loading..." />;
    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.role)) return null;

    const needsPermissionCheck = ROLES_WITH_PERMISSION_CHECK.includes(
      user.role,
    );
    if (
      needsPermissionCheck &&
      permission &&
      !isAllowed(permissions, permission)
    ) {
      return <div className="p-6 text-center text-red-600">Not authorized</div>;
    }

    return <WrappedComponent {...props} />;
  };

  WithAdminAuthComponent.displayName = `WithAdminAuth(${getDisplayName(
    WrappedComponent,
  )})`;

  return WithAdminAuthComponent;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withAdminAuth;
