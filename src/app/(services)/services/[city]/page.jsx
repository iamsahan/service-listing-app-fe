import { CityServiceCategories } from "@/components/services/CityServiceCategories";

export async function generateMetadata({ params }) {
  const pms = await params;
  const cityName = pms?.city;

  return {
    title: `Services in ${cityName} – ProHive`,
    description: `Explore all home services available in ${cityName}. Find trusted professionals for cleaning, repairs, plumbing, electrical, and more.`,
    openGraph: {
      title: `Services in ${cityName} – ProHive`,
      description: `Book verified home service professionals in ${cityName} for cleaning, repairs, plumbing, electrical work, and more.`,
      images: ["/assets/images/swiper-1.jpg"],
    },
    alternates: {
      canonical: `https://prohive.com/services/${cityName}`,
    },
  };
}

export default async function ServicePage({ params, searchParams }) {
  const pms = await params;
  const cityName = pms?.city;
  const cityId = searchParams?.cityId;

  return <CityServiceCategories cityName={cityName} cityId={cityId} />;
}
