import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLoader from "./PageLoader";

const isAllowed = (permissions, requirement) => {
  if (!requirement) return true;
  if (!permissions) return false;

  const modulePerm = permissions[requirement.module];

  if (modulePerm === true) return true; // full module access

  if (modulePerm && typeof modulePerm === "object") {
    if (!requirement.action) return true; // module-level access
    return modulePerm[requirement.action] === true;
  }

  return false;
};

const withAuth = (WrappedComponent, options = {}) => {
  // Backward compat: if array is passed, treat as roles
  const normalized = Array.isArray(options) ? { roles: options } : options;

  const {
    roles = ["admin", "super_admin", "moderator"],
    permission = null,
    redirectTo = "/login/admin",
  } = normalized;

  const WithAuthComponent = (props) => {
    const { user, permissions, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace(redirectTo);
      }
    }, [user, loading, router, redirectTo]);

    useEffect(() => {
      if (!loading && user && !roles.includes(user.role)) {
        router.replace("/not-authorized");
      }
    }, [user, loading, roles, router]);

    useEffect(() => {
      if (
        !loading &&
        user &&
        permission &&
        !isAllowed(permissions, permission)
      ) {
        router.replace("/not-authorized");
      }
    }, [user, loading, permission, permissions, router]);

    if (loading) return <PageLoader message="Loading..." />;
    if (!user) return null;
    if (!roles.includes(user.role)) return null;
    if (permission && !isAllowed(permissions, permission))
      return <div className="p-6 text-center text-red-600">Not authorized</div>;

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${getDisplayName(
    WrappedComponent
  )})`;

  return WithAuthComponent;
};

// Helper function to get the display name of a component
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withAuth;
