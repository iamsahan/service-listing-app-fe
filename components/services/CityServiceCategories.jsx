"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LocationSwitcher } from "./LocationSwitcher";
import { ExpandableCategory } from "./CategoryGrid";
import SubCategoryCard from "./SubCategoryCard";
import FeaturedSection from "./FeaturedSection";
import { useToast } from "@/hooks/use-toast";
import { serviceAPI } from "@/api/services";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import GlobalCart from "../cart/GlobalCart";
import dynamic from "next/dynamic";
import { ImagesSection } from "./ServicePageImages";
import { MapPin, Sparkles } from "lucide-react";
import QprozLoader from "../QprozLoader";
import Banner from "../Banner";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import animation1 from "../../public/assets/lotties/Animation - 1748414177431.json";

// Memoize
const MemoExpandableCategory = React.memo(ExpandableCategory);
const MemoImagesSection = React.memo(ImagesSection);

export function CityServiceCategories({ cityName = "" }) {
  const [categories, setCategories] = useState([]);
  const [cityData, setCityData] = useState({ name: null, id: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNotInServiceArea, setIsNotInServiceArea] = useState(false);

  const { toast } = useToast();

  // Fetch city and categories
  useEffect(() => {
    if (!cityName) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setIsNotInServiceArea(false);

      try {
        const citiesResponse = await serviceAPI.getCities();
        const matchedCity = citiesResponse.data.find((city) =>
          cityName.toLowerCase().includes(city.name.toLowerCase())
        );

        if (!matchedCity) {
          setIsNotInServiceArea(true);
          return;
        }

        setCityData({ name: matchedCity.name, id: matchedCity.city_id });

        const categoriesResponse = await serviceAPI.getCategories(
          matchedCity.city_id
        );

        // Sort
        const sortedCategories = [...categoriesResponse.data].sort(
          (a, b) => a.display_order - b.display_order
        );

        setCategories(sortedCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cityName, toast]);

  // Middle Index
  const middleIndex = Math.floor(categories.length / 2);

  // Render SubCategoryCard
  const renderSubCategory = useCallback(
    (sub, category) => (
      <CarouselItem
        key={`${category.category_id}-${sub.sub_category_id}`}
        className="!w-40 basis-40 lg:!w-56 lg:basis-56 shrink-0 scroll-snap-start"
      >
        <div className="p-1">
          <SubCategoryCard
            name={sub.name}
            icon_url={sub.image_variants?.small}
            url={`/services/${cityData.name}/${category.slug}/${sub.slug}`}
          />
        </div>
      </CarouselItem>
    ),
    [cityData.name]
  );

  // Early return
  if (cityName === "Unknown") {
    return (
      <div className="min-h-screen bg-gray-50 p-10">
        <div className="text-center py-8 space-y-8">
          <h2 className="text-2xl font-semibold">
            Please select your location to view services.
          </h2>
          <div className="max-w-md mx-auto">
            <LocationSwitcher />
          </div>
        </div>
      </div>
    );
  }

  if (isNotInServiceArea) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-10 ">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              We're not in{" "}
              <span className="text-indigo-600">
                {cityName.replace("%20", " ")}
              </span>{" "}
              yet
            </h2>
            <p className="text-gray-600 text-lg md:text-xl">
              But don't worry — we're expanding fast!
            </p>
            <p className="text-gray-500">
              Please select a different city to explore the services currently
              available.
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <LocationSwitcher />
          </div>

          <div className="w-full max-w-md mx-auto">
            <Lottie animationData={animation1} loop />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-10">
        <div className="text-center py-8 text-red-600">
          <h2 className="text-xl">{error}</h2>
        </div>
      </div>
    );
  }

  if (isLoading || !cityData.id) {
    return <QprozLoader />;
  }

  return (
    <div className="container mx-auto space-y-8 md:space-y-16 px-5 lg:px-12 above-xl:px-0 py-8">
      <div className="mx-auto flex flex-col lg:flex-row justify-between gap-8 lg:gap-10 above-xl:gap-12 lg:mt-5">
        <div className="w-full lg:w-2/6">
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-1 md:gap-2 text-[var(--color-primary)] mb-1">
              <MapPin className="size-3 md:size-4" />
              <span className="text-xs md:text-sm font-medium">
                Your Location
              </span>
            </div>

            <div className="flex items-center justify-between gap-5">
              <LocationSwitcher />
              <GlobalCart />
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                No services available in this city
              </p>
            </div>
          ) : (
            <div className="p-6 mt-6 bg-gray-50 rounded-xl shadow-sm space-y-3 sm:min-h-[460px]">
              <div className="items-center gap-2 flex">
                <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                <Label className="font-medium underline underline-offset-8 decoration-gray-200">
                  Explore our services
                </Label>
              </div>

              <MemoExpandableCategory
                categories={categories}
                cityName={cityData.name}
              />
            </div>
          )}
        </div>

        <MemoImagesSection />
      </div>

      <Banner cityId={cityData.id} position="category_page_top" />
      <FeaturedSection city={cityData.name} />

      {categories.map(
        (category, index) =>
          category.SubCategories.length > 0 && (
            <React.Fragment key={category.category_id}>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Label className="text-lg md:text-2xl font-semibold ml-2">
                    {category.name}
                  </Label>

                  <Button
                    asChild
                    variant="secondary"
                    className="bg-[#5f60b9]/10 rounded-full text-[var(--color-primary)] font-semibold h-9 px-3 md:px-4 md:h-10"
                  >
                    <Link href={`/services/${cityData.name}/${category.slug}`}>
                      See All
                    </Link>
                  </Button>
                </div>

                <Carousel
                  opts={{
                    align: "start",
                    slidesToScroll: 1,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="flex gap-5 scroll-snap-x scroll-snap-mandatory">
                    {category.SubCategories.map((sub) =>
                      renderSubCategory(sub, category)
                    )}
                    <div className="shrink-0 w-[16px]" />
                  </CarouselContent>

                  {category.SubCategories.length > 4 && (
                    <>
                      <CarouselPrevious className="hidden md:flex" />
                      <CarouselNext className="hidden md:flex" />
                    </>
                  )}
                </Carousel>
              </div>

              {index === middleIndex && (
                <Banner cityId={cityData.id} position="category_page_middle" />
              )}
            </React.Fragment>
          )
      )}
    </div>
  );
}

export default React.memo(CityServiceCategories);
