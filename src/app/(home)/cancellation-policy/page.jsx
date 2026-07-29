import PolicyPage from "@/components/docs/PolicyPage";

export const metadata = {
  title: "Cancellation Policy – QProz",
  description:
    "Read the cancellation policy for QProz services. Learn about terms, conditions, and how to cancel your bookings.",
  openGraph: {
    title: "Cancellation Policy – QProz",
    description:
      "Understand the cancellation terms and conditions for QProz services. Stay informed about your bookings.",
    images: ["/assets/images/swiper-1.jpg"],
  },
  alternates: {
    canonical: "https://qproz.com/cancellation-policy",
  },
};

const CancellationPolicyPage = () => {
  return <PolicyPage doc="cancellation.docx" title="Cancellation Policy" />;
};

export default CancellationPolicyPage;
