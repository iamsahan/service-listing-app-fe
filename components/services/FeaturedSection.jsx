"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CheckCircle } from "lucide-react";
import FeaturedCard from "@/components/ui/featuredCard";
import { serviceAPI } from "@/api/services";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";

export default function FeaturedSection({ city }) {
  const [data, setData] = useState();
  const [modalOverview, setModalOverview] = useState(null);

  const router = useRouter();

  const openOverviewModal = (overview) => setModalOverview(overview);

  const closeModals = () => {
    setModalOverview(null);
  };

  useEffect(() => {
    if (city && city !== "" && city !== "unknown") {
      fetchFeaturedServices(city);
    }
  }, [city]);

  const fetchFeaturedServices = async (city) => {
    try {
      const response = await serviceAPI.getFeaturedServices(city);
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10 text-left pl-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-5 text-emerald-500" />
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 uppercase tracking-tight">
              Featured Services
            </h2>
          </div>
          <p className="text-xs md:text-sm text-neutral-500">
            Highly-rated options selected for exceptional reviews and verified support
          </p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {data?.map((item, index) => (
            <FeaturedCard
              key={index}
              imageSrc={
                item.icon_url
                  ? process.env.NEXT_PUBLIC_API_ENDPOINT +
                    item.image_variants?.small
                  : null
              }
              badgeText={item.numberOfReviews}
              price={item.base_price}
              title={item.name}
              rating={item.rating}
              providerName={item.providerName}
              providerAvatar={item.providerAvatar}
              description={item.description}
              onClick={() => openOverviewModal(item.overview)}
              onBtnClick={() =>
                router.push(
                  `/services/${city}/${item.full_url}?itemId=${item.item_id}&serviceId=${item.service_id}`
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Overview Dialog */}
      <Dialog open={!!modalOverview} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-left font-black text-xl text-neutral-950">
              Service Overview
            </DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 mt-4 text-left"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(modalOverview || ""),
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
