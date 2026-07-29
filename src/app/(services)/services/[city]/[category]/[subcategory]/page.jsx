import { SubCategoryDetailsPage } from "@/components/services/SubCategoryDetailsPage";

function formatSlug(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { city, category, subcategory } = await params;

  const formattedCategory = formatSlug(category);
  const formattedSubCategory = formatSlug(subcategory);

  return {
    title: `${formattedSubCategory} in ${formattedCategory} – ${city} | ProHive`,
    description: `Find trusted ${formattedSubCategory} professionals for ${formattedCategory} services in ${city}. Fast booking and guaranteed satisfaction.`,
    openGraph: {
      title: `${formattedSubCategory} in ${formattedCategory} Services – ${city} | ProHive`,
      description: `Book verified ${formattedSubCategory} services in ${city} under ${formattedCategory}. Reliable professionals at your fingertips.`,
      images: ["/assets/images/swiper-1.jpg"],
    },
    alternates: {
      canonical: `https://prohive.com/services/${city}/${category}/${subcategory}`,
    },
  };
}

export default async function SubCategoryPage({ params }) {
  const { city, category, subcategory } = await params;

  return (
    <SubCategoryDetailsPage
      cityName={city}
      categorySlug={category}
      subCategorySlug={subcategory}
    />
  );
}
