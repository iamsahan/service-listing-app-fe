import PolicyPage from "@/components/docs/PolicyPage";

export const metadata = {
  title: "Privacy Policy – ProHive",
  description:
    "Read the Privacy Policy of ProHive. Learn how we collect, use, and protect your personal information while using our services.",
  openGraph: {
    title: "Privacy Policy – ProHive",
    description:
      "Understand how ProHive handles your personal information and privacy. Stay informed about data collection, usage, and protection.",
    images: ["/assets/images/swiper-1.jpg"],
  },
  alternates: {
    canonical: "https://prohive.com/privacy-policy",
  },
};

const PrivacyPolicyPage = () => {
  return <PolicyPage documentType="privacy_policy" title="Privacy Policy" />;
};

export default PrivacyPolicyPage;
