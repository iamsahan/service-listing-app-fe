import PolicyPage from "@/components/docs/PolicyPage";

export const metadata = {
  title: "Terms and Conditions – QProz",
  description:
    "Read the Terms and Conditions of QProz services. Learn about your rights, responsibilities, and the rules for using our platform.",
  openGraph: {
    title: "Terms and Conditions – QProz",
    description:
      "Understand the terms and conditions of using QProz. Stay informed about your rights, obligations, and service policies.",
    images: ["/assets/images/swiper-1.jpg"],
  },
  alternates: {
    canonical: "https://qproz.com/terms-and-conditions",
  },
};

const TermsAndConditions = () => {
  return (
    <PolicyPage
      documentType="terms_and_conditions"
      title="Terms and Conditions"
    />
  );
};

export default TermsAndConditions;
