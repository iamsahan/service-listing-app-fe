import Home from "@/components/home/HomePage";

export const metadata = {
  title: "QProz – Trusted Professionals for Home Services",
  description:
    "Book verified home service professionals for cleaning, repairs, electrical, plumbing and more. Fast booking, secure service, and guaranteed satisfaction.",
  openGraph: {
    title: "QProz – Home Services",
    description: "Find trusted professionals for any home service instantly.",
    images: ["/assets/images/swiper-1.jpg"],
  },
  alternates: {
    canonical: "https://qproz.com",
  },
};

export default async function HomePage() {
  return <Home />;
}
