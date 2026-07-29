import { CategoryDetailsPage } from "@/components/services/CategoryDetailsPage";

function formatCategory(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { city, category } = await params;
  const formattedCategory = formatCategory(category);

  return {
    title: `${formattedCategory} Services in ${city} – QProz`,
    description: `Book trusted ${formattedCategory} services in ${city}. Find verified professionals for ${formattedCategory}, repairs, and more.`,
    openGraph: {
      title: `${formattedCategory} Services in ${city} – QProz`,
      description: `Hire verified professionals for ${formattedCategory} services in ${city}. Fast booking, guaranteed satisfaction.`,
      images: ["/assets/images/swiper-1.jpg"],
    },
    alternates: {
      canonical: `https://qproz.com/services/${city}/${category}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { city, category } = await params;

  return <CategoryDetailsPage cityName={city} categorySlug={category} />;
}
