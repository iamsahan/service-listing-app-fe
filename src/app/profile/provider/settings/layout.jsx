import ProviderprofileHeader from "@/components/profile/provider/ProfileHeader";
import ProviderProfileSidebar from "@/components/profile/provider/ProfileSidebar";

export default function SettingsLayout({ children, params }) {
  const section = params?.segment || "service-area";
  const sectionTitles = {
    "service-area": "Service Area & Location",
    email: "Change Email",
    password: "Change Password",
    contact: "Contact Info",
  };
  const title = sectionTitles[section] || "Settings";

  return (
    <div className="max-w-5xl mx-auto py-10 px-5">
      <ProviderprofileHeader title={title} />

      <div className="min-h-screen flex">
        <ProviderProfileSidebar />
        <main className="flex-1 px-6 pb-6">{children}</main>
      </div>
    </div>
  );
}
