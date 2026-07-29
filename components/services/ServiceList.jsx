"use client";

import React, { useState, useEffect } from "react";
import { serviceAPI } from "@/api/services";
import { useToast } from "@/hooks/use-toast";
import { AlertCircleIcon, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ServiceOverviewDialog from "./ServiceOverviewDialog";

export function ServiceList({
  typeId,
  cityId,
  addToCart,
  selectedItems,
  onQuantityChange,
}) {
  const [services, setServices] = useState([]);
  const [serviceItems, setServiceItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState({});
  const { toast } = useToast();
  const [activeItemId, setActiveItemId] = useState(null);

  useEffect(() => {
    if (typeId) fetchServices();
  }, [typeId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServices(typeId, cityId);
      const fetchedServices = response.data || [];
      setServices(fetchedServices);

      // Fetch items for each service
      fetchedServices.forEach((service) => {
        fetchServiceItems(service.service_id);
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceItems = async (serviceId) => {
    if (!serviceId || !cityId) return;

    setServiceLoading((prev) => ({ ...prev, [serviceId]: true }));
    try {
      const response = await serviceAPI.getServiceItems(serviceId, cityId);
      const items = response.data || [];
      setServiceItems((prev) => ({ ...prev, [serviceId]: items }));
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load items for service ${serviceId}.`,
        variant: "destructive",
      });
    } finally {
      setServiceLoading((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const getImageUrl = (url) => {
    if (url) {
      return `${process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`;
    }
    return "/default-icon.png";
  };

  if (loading)
    return <div className="text-center py-4">Loading services...</div>;

  return (
    <div className="space-y-8">
      {services
        .sort((a, b) => a.display_order - b.display_order)
        .map((service) => (
          <div key={service.service_id}>
            <div className="flex items-center gap-3 mb-3 border p-2 rounded-lg">
              <Image
                src={getImageUrl(service.image_variants?.thumbnail)}
                alt={service.name || "Service"}
                width={48}
                height={48}
                className="rounded-md aspect-square object-cover size-12 bg-gray-100"
                unoptimized
                crossOrigin="anonymous"
              />
              <div>
                <h3 className="font-medium text-[0.94rem]">{service.name}</h3>
                <p className="text-gray-600 text-xs mt-0.5">
                  {service.description}
                </p>
              </div>
            </div>

            {serviceLoading[service.service_id] && (
              <div className="text-center text-sm text-gray-500 py-2">
                Loading items...
              </div>
            )}

            {!serviceLoading[service.service_id] &&
              serviceItems[service.service_id]?.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  No items found for this service.
                </div>
              )}

            {!serviceLoading[service.service_id] &&
              serviceItems[service.service_id]?.length > 0 && (
                <div className="grid grid-cols-1 gap-6 pt-5 px-2">
                  {serviceItems[service.service_id].map((item, index) => (
                    <React.Fragment key={item.item_id}>
                      <div className="space-y-2">
                        <div className="flex gap-6 sm:gap-12 justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="space-y-3.5">
                              <div className="space-y-1">
                                <h6 className="font-medium text-[0.94rem]">
                                  {item.name || "Unnamed Item"}
                                </h6>

                                <div className="flex items-center gap-1.5">
                                  <Clock className="size-[0.8rem] text-[var(--color-primary)]" />
                                  <span className="text-xs text-gray-600">
                                    {item.duration_hours ||
                                    item.duration_minutes ? (
                                      <>
                                        {item.duration_hours > 0 && (
                                          <>
                                            {item.duration_hours}{" "}
                                            {item.duration_hours === 1
                                              ? "hr"
                                              : "hrs"}{" "}
                                          </>
                                        )}
                                        {item.duration_minutes > 0 && (
                                          <>
                                            {item.duration_minutes}{" "}
                                            {item.duration_minutes === 1
                                              ? "min"
                                              : "mins"}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      "No duration"
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                {item.SpecialPricings?.[0]?.special_price ? (
                                  <>
                                    <span className="font-semibold text-gray-900">
                                      ₹{item.SpecialPricings[0].special_price}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                      ₹{item.base_price || 0}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold text-gray-900">
                                    ₹{item.base_price || 0}
                                  </span>
                                )}
                              </div>
                            </div>

                            {item.description && (
                              <ul className="space-y-1 border-t border-dashed pt-3">
                                <li className="text-sm text-gray-600 flex items-start gap-2">
                                  <span>•</span>
                                  <span>{item.description}</span>
                                </li>
                              </ul>
                            )}

                            <Button
                              variant="link"
                              className="text-[var(--color-primary)] p-0 pt-1 h-auto font-semibold text-[0.83rem] gap-1"
                              onClick={() => setActiveItemId(item.item_id)}
                            >
                              Show more
                              <ChevronRight />
                            </Button>

                            {!item.is_home_visit && (
                              <p className="text-sm text-[var(--color-primary)] flex sm:items-center">
                                <AlertCircleIcon className="mr-2 size-4 mt-1 sm:mt-0" />
                                Visit required at provider location
                              </p>
                            )}

                            {item.advance_percentage > 0 && (
                              <p className="text-sm text-[var(--color-primary)] flex sm:items-center">
                                <AlertCircleIcon className="mr-2 size-4 mt-1 sm:mt-0" />
                                {item.advance_percentage}% Advanced Payment
                                Required
                              </p>
                            )}
                          </div>

                          {/* Image and Add Button Container */}
                          <div className="flex flex-col items-center gap-5">
                            {service.icon_url && (
                              <Image
                                src={getImageUrl(
                                  service.image_variants?.thumbnail
                                )}
                                alt={item.name}
                                width={128}
                                height={128}
                                className="size-24 sm:size-32 object-cover rounded-lg bg-gray-50"
                                unoptimized
                                crossOrigin="anonymous"
                              />
                            )}

                            {(() => {
                              const cartItem = selectedItems?.find(
                                (i) =>
                                  i.id === item.item_id &&
                                  i.type === "service_item"
                              );

                              if (cartItem) {
                                return (
                                  <div className="flex items-center gap-2 border border-[#5f60b9]/20 rounded-md">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-[#5f60b9] hover:bg-[#5f60b9]/10 h-8 px-3"
                                      onClick={() =>
                                        onQuantityChange(
                                          cartItem,
                                          cartItem.quantity - 1
                                        )
                                      }
                                    >
                                      -
                                    </Button>
                                    <span className="px-2 font-medium text-sm">
                                      {cartItem.quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-[#5f60b9] hover:bg-[#5f60b9]/10 h-8 px-3"
                                      onClick={() =>
                                        onQuantityChange(
                                          cartItem,
                                          cartItem.quantity + 1
                                        )
                                      }
                                    >
                                      +
                                    </Button>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="flex flex-col items-center">
                                    <Button
                                      size="sm"
                                      className="bg-white text-[#5f60b9] border border-[#5f60b9]/20 hover:bg-[#5f60b9] hover:text-white px-8 font-medium transition-colors"
                                      onClick={() =>
                                        addToCart(
                                          item,
                                          "service_item",
                                          service.image_variants?.thumbnail ||
                                            service.image_variants?.default
                                              ?.thumbnail?.url
                                        )
                                      }
                                      disabled={!item.item_id}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </div>

                      {index !==
                        serviceItems[service.service_id].length - 1 && <hr />}
                    </React.Fragment>
                  ))}
                </div>
              )}
          </div>
        ))}

      {/* Detail Modal */}
      <ServiceOverviewDialog
        open={!!activeItemId}
        onOpenChange={(open) => !open && setActiveItemId(null)}
        itemId={activeItemId}
      />
    </div>
  );
}
