import PolicyPage from "@/components/docs/PolicyPage";

export const metadata = {
  title: "Privacy Policy – QProz",
  description:
    "Read the Privacy Policy of QProz. Learn how we collect, use, and protect your personal information while using our services.",
  openGraph: {
    title: "Privacy Policy – QProz",
    description:
      "Understand how QProz handles your personal information and privacy. Stay informed about data collection, usage, and protection.",
    images: ["/assets/images/swiper-1.jpg"],
  },
  alternates: {
    canonical: "https://qproz.com/privacy-policy",
  },
};

const PrivacyPolicyPage = () => {
  return <PolicyPage documentType="privacy_policy" title="Privacy Policy" />;
};

export default PrivacyPolicyPage;
