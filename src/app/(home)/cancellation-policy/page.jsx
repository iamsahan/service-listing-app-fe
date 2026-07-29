import PolicyPage from "@/components/docs/PolicyPage";

export const metadata = {
  title: "Cancellation Policy – ProHive",
  description:
    "Read the cancellation policy for ProHive services. Learn about terms, conditions, and how to cancel your bookings.",
  openGraph: {
    title: "Cancellation Policy – ProHive",
    description:
      "Understand the cancellation terms and conditions for ProHive services. Stay informed about your bookings.",
    images: ["/assets/images/swiper-1.jpg"],
  },
  alternates: {
    canonical: "https://prohive.com/cancellation-policy",
  },
};

const CancellationPolicyPage = () => {
  return <PolicyPage doc="cancellation.docx" title="Cancellation Policy" />;
};

export default CancellationPolicyPage;
