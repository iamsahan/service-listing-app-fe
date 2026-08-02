"use client";
import React, { useState, useEffect } from "react";
import { LocationSwitcher } from "./LocationSwitcher";
import { ExpandableCategory } from "./CategoryGrid";
import SubCategoryCard from "./SubCategoryCard";
import FeaturedSection from "./FeaturedSection";
import { useToast } from "@/hooks/use-toast";
import { serviceAPI } from "@/api/services";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Link from "next/link";
import GlobalCart from "../cart/GlobalCart";
import dynamic from "next/dynamic";
import { ImagesSection } from "./ServicePageImages";
import { MapPin, LayoutGrid, CheckCircle, ShieldCheck, Zap } from "lucide-react";
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

  // Middle Index for middle banner placement
  const middleIndex = Math.floor(categories.length / 2);

  // Early return for unknown location
  if (cityName === "Unknown") {
    return (
      <div className="min-h-[85vh] bg-white bg-grid-pattern flex items-center justify-center p-6">
        <style>{`
          .bg-grid-pattern {
            background-size: 30px 30px;
            background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px),
                              linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
          }
        `}</style>
        <div className="max-w-md w-full bg-white border border-neutral-200 p-8 rounded-[2.5rem] shadow-xl text-center space-y-6">
          <div className="size-14 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center mx-auto text-amber-500">
            <MapPin className="size-6 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-neutral-900">
              Select Your Service Location
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              Please enter or select a city below to view corresponding catalog services and pricing.
            </p>
          </div>
          <LocationSwitcher />
        </div>
      </div>
    );
  }

  if (isNotInServiceArea) {
    return (
      <div className="min-h-[85vh] bg-white bg-grid-pattern flex items-center justify-center p-6">
        <style>{`
          .bg-grid-pattern {
            background-size: 30px 30px;
            background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px),
                              linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
          }
        `}</style>
        <div className="max-w-2xl w-full bg-white border border-neutral-200 p-10 rounded-[2.5rem] shadow-xl text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-800 uppercase tracking-wider w-fit mx-auto">
              <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
              Not Available Yet
            </div>
            <h2 className="text-3xl font-black text-neutral-900 leading-tight">
              We Aren&apos;t Active in <br />
              <span className="bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent capitalize">
                {cityName.replace("%20", " ")}
              </span>
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              We are expanding to new regions rapidly. Choose another operational city to explore available service options.
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <LocationSwitcher />
          </div>

          <div className="w-full max-w-[280px] mx-auto opacity-90">
            <Lottie animationData={animation1} loop />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-10">
        <div className="text-center py-8 text-red-600 font-extrabold">
          <h2 className="text-lg">{error}</h2>
        </div>
      </div>
    );
  }

  if (isLoading || !cityData.id) {
    return <QprozLoader />;
  }

  return (
    <div className="min-h-screen">
      {/* 1. Hero (dark, brand-matched) */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        <div className="absolute -top-32 -right-20 w-[420px] h-[420px] bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-[380px] h-[380px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative container mx-auto px-6 max-w-7xl pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/80 uppercase tracking-wider">
                <MapPin className="size-3.5 text-amber-400" />
                {cityData.name || cityName}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">
                Verified Home Services
              </h1>
              <p className="text-white/50 text-xs sm:text-sm max-w-md">
                Book rigorously vetted local specialists for trade, repairs, diagnostics, and care.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-bold text-white/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  Verified professionals
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="size-3.5 text-amber-400" />
                  Instant scheduling
                </span>
              </div>
            </div>

            {/* Action controls widget */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md p-2 rounded-2xl w-fit shrink-0">
              <LocationSwitcher />
              <div className="w-[1.5px] h-6 bg-white/10" />
              <GlobalCart />
            </div>
          </div>

          {/* Quick category pill selector */}
          {categories.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3.5 pl-1">
                <LayoutGrid className="size-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white/70">
                  Quick Catalog Selector
                </span>
              </div>
              <MemoExpandableCategory categories={categories} cityName={cityData.name} />
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto space-y-12 md:space-y-16 px-6 max-w-7xl py-12">
        {/* 2. Visual trust strip */}
        <MemoImagesSection />

        {/* 3. Campaign Promotion Banners */}
        <Banner cityId={cityData.id} position="category_page_top" />

        {/* 4. Featured Services Grid (4-Column Layout) */}
        <FeaturedSection city={cityData.name} />

        {/* 5. Bottom Main Catalogue Directory (Sticky Left Index + Subcategory Grids) */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-neutral-100">
            {/* Left Sticky Navigation Index */}
            <div className="lg:col-span-3 sticky top-24 hidden lg:block bg-neutral-50 border border-neutral-200/50 p-6 rounded-[2rem] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pl-1 mb-2">
                <LayoutGrid className="size-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800">
                  Directory Index
                </span>
              </div>
              <div className="flex flex-col gap-1 text-left">
                {categories.map((category) => (
                  <button
                    key={category.category_id}
                    onClick={() => {
                      const el = document.getElementById(`cat-${category.category_id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="text-left text-xs font-extrabold text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50/50 p-2.5 rounded-xl transition-all"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Main Catalog Content Area */}
            <div className="lg:col-span-9 space-y-12">
              {categories.length === 0 && (
                <div className="text-center py-16 bg-neutral-50 border border-neutral-200/60 rounded-[2rem] space-y-4">
                  <LayoutGrid className="size-10 text-neutral-300 mx-auto" />
                  <p className="text-neutral-500 text-xs font-bold">
                    No active categories in this city
                  </p>
                </div>
              )}

              {categories.map((category, index) => (
                category.SubCategories.length > 0 && (
                  <div
                    key={category.category_id}
                    id={`cat-${category.category_id}`}
                    className="space-y-6 scroll-mt-24 text-left border-b border-neutral-100 pb-10 last:border-0"
                  >
                    <div className="flex justify-between items-center pl-1">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <Label className="text-xl md:text-2xl font-black text-neutral-900 uppercase tracking-tight">
                          {category.name}
                        </Label>
                      </div>

                      <Button
                        asChild
                        variant="secondary"
                        className="bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-200 font-bold px-4 py-1.5 h-auto rounded-full text-xs uppercase tracking-wider transition-all"
                      >
                        <Link href={`/services/${cityData.name}/${category.slug}`}>
                          See All
                        </Link>
                      </Button>
                    </div>

                    {/* SubCategory Card Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                      {category.SubCategories.map((sub) => (
                        <div key={sub.sub_category_id} className="flex justify-center">
                          <SubCategoryCard
                            name={sub.name}
                            icon_url={sub.image_variants?.small}
                            url={`/services/${cityData.name}/${category.slug}/${sub.slug}`}
                          />
                        </div>
                      ))}
                    </div>

                    {index === middleIndex && (
                      <div className="pt-6">
                        <Banner cityId={cityData.id} position="category_page_middle" />
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(CityServiceCategories);
