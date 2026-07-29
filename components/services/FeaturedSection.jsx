import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Sparkles } from "lucide-react";
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
    <section>
      <div className="container mx-auto lg:px-6">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles className="size-5 text-[var(--color-primary)]" />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Featured Services
            </h2>
          </div>
          <p className="text-xs md:text-sm text-gray-500">
            Trusted choices offering exceptional value, backed by positive
            reviews
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {data?.map((item, index) => (
              <CarouselItem key={index} className="pl-4 basis-auto">
                <FeaturedCard
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
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="hidden md:block">
            <CarouselPrevious className="left-0 -translate-x-12" />
            <CarouselNext className="right-0 translate-x-12" />
          </div>
        </Carousel>
      </div>

      {/* Overview Dialog */}
      <Dialog open={!!modalOverview} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Overview</DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 mt-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(modalOverview || ""),
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
