import LocationInitializer from "@/components/LocationInitializer";
import { cookies } from "next/headers";

export const metadata = {
  title: "QProz Services – Find Trusted Professionals in Your City",
  description:
    "Explore all home services offered by QProz. Find skilled professionals for cleaning, repairs, plumbing, electrical work, and more, near you.",
  keywords:
    "home services, cleaning, plumbing, electrical, repairs, trusted professionals, QProz",
  openGraph: {
    title: "QProz Services – Trusted Home Professionals",
    description:
      "Book verified home service professionals for cleaning, repairs, electrical, plumbing and more. Available in your city.",
    images: ["/assets/images/swiper-1.jpg"],
  },
  alternates: {
    canonical: "https://qproz.com/services",
  },
};

export default async function ServicesLayout({ children }) {
  const cookieStore = await cookies();
  const city = cookieStore.get("current-location")?.value;

  if (!city) {
    return <LocationInitializer />;
  }

  return <div className="lg:pb-20 min-h-screen">{children}</div>;
}
