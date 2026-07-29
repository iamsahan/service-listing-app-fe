"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { serviceAPI } from "@/api/services";
import { ServiceList } from "./ServiceList";
import { PackageList } from "./PackageList";
import DOMPurify from "dompurify";
import { Label } from "../ui/label";
import Cart from "../cart/Cart";
import {
  getUserCartEntries,
  removeUserCartEntry,
  updateUserCartEntry,
} from "@/src/app/utils/cartcache";
import SelectionRestrictionDialog from "./SelectionRestrictionDialog";
import SubCategoryDetailsSidenav from "./SubCategoryDetailsSidenav";
import OrderProcessBanner from "./OrderProcessBanner";
import { useMobile } from "@/src/hooks/useMobile";
import { cartService } from "@/api/cartService";
import QprozLoader from "../QprozLoader";
import Banner from "../Banner";

export function SubCategoryDetailsPage({
  cityName,
  categorySlug,
  subCategorySlug,
}) {
  const isMobile = useMobile();
  const { user } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [data, setData] = useState({
    cityId: null,
    subCategory: null,
    serviceTypes: [],
    minimumCartValue: null,
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [modalDescription, setModalDescription] = useState(null);
  const [isRestrictionDialogOpen, setIsRestrictionDialogOpen] = useState(false);

  /** Fetch all required data in parallel */
  useEffect(() => {
    if (!cityName || !subCategorySlug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const cleanSlug = decodeURIComponent(subCategorySlug.split("?")[0]);

        // Run in parallel
        const [citiesRes, subCategoryRes] = await Promise.all([
          serviceAPI.getCities(),
          serviceAPI.getSubCategoryBySlug(cleanSlug),
        ]);

        const city = citiesRes.data.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase()
        );
        if (!city) throw new Error("City not found");
        const cityId = city.city_id;

        const subCategory = subCategoryRes.data;

        const [serviceTypesRes, minCartRes] = await Promise.all([
          serviceAPI.getServiceTypes(subCategory.sub_category_id, cityId),
          cartService.getMinimumCartValue(cityId, subCategory.category_id),
        ]);

        setData({
          cityId,
          subCategory,
          serviceTypes: serviceTypesRes.data || [],
          minimumCartValue: minCartRes.data.minimum_cart_value,
        });
      } catch (err) {
        console.error("Error fetching data", err);
        toast({
          title: "Error",
          description: "Failed to load service data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityName, subCategorySlug, toast]);

  // Add service item to cart on page load
  const itemId = searchParams.get("itemId");
  const serviceId = searchParams.get("serviceId");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!itemId || !data.cityId || !serviceId) return;
      if (selectedItems.some((i) => String(i.id) === String(itemId))) return;

      try {
        // Fetch service items
        const res = await serviceAPI.getServiceItems(serviceId, data.cityId);
        if (cancelled) return;

        const items = res.data;
        const toAdd = items.find(
          (item) => String(item.item_id) === String(itemId)
        );

        if (toAdd) {
          addToCart(toAdd, "service_item", toAdd.image_variants?.thumbnail);
        } else {
          toast({
            title: "Not found",
            description: `Service ${itemId} currently not available.`,
            variant: "destructive",
          });
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: "Failed to load service items.",
            variant: "destructive",
          });
        }
        console.error(err);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [serviceId, itemId, data.cityId, data.serviceTypes, toast]);

  /** Load cached cart items */
  useEffect(() => {
    if (!subCategorySlug || !cityName) return;

    try {
      const userEntries = getUserCartEntries(user?.uId);
      const match = userEntries.find(
        (entry) =>
          entry.subCategorySlug === subCategorySlug &&
          entry.cityName === cityName
      );
      if (match) {
        setSelectedItems(match.items || []);
      }
    } catch (e) {
      console.error("Failed to load cached cart items:", e);
    }
  }, [subCategorySlug, cityName, user]);

  const updateCache = (items) => {
    if (!items || items.length === 0) {
      removeUserCartEntry(user?.uId, cityName, subCategorySlug);
      return;
    }
    const newEntry = {
      subCategorySlug,
      categorySlug,
      cityName,
      cityId: data.cityId,
      subcategory_id: data.subCategory?.sub_category_id,
      items,
      minimumCartValue: data.minimumCartValue,
    };
    updateUserCartEntry(user?.uId, newEntry);
  };

  const addToCart = (item, type, icon_url) => {
    const cartSize = selectedItems.length;
    const hasHomeVisit = selectedItems.some((i) => i.is_home_visit === true);
    const isHome =
      item.is_home_visit ||
      item.sections?.some((sec) => sec.item.is_home_visit === true);

    if (
      (hasHomeVisit && !isHome) ||
      (cartSize > 0 && !hasHomeVisit && isHome)
    ) {
      setIsRestrictionDialogOpen(true);
      return;
    }

    let updatedItems = [...selectedItems];

    if (type === "service_item") {
      const existing = updatedItems.find(
        (i) => i.id === item.item_id && i.type === type
      );
      if (existing) {
        updatedItems = updatedItems.map((i) =>
          i.id === item.item_id && i.type === type
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      } else {
        updatedItems.push({
          id: item.item_id,
          type,
          duration_hours: item.duration_hours,
          duration_minutes: item.duration_minutes,
          name: item.name,
          price: item.SpecialPricings?.[0]?.special_price ?? item.base_price,
          quantity: 1,
          is_home_visit: item.is_home_visit,
          image_url: icon_url,
        });
      }
    }

    if (type === "package_item") {
      item.sections.forEach((sec) => {
        const existing = updatedItems.find(
          (i) => i.id === sec.itemId && i.type === type
        );
        if (existing) {
          updatedItems = updatedItems.map((i) =>
            i.id === sec.itemId && i.type === type
              ? { ...i, quantity: (i.quantity || 1) + 1 }
              : i
          );
        } else {
          updatedItems.push({
            pkgName: item.name,
            id: sec.itemId,
            type,
            name: sec.item.name,
            duration_hours: item.duration_hours,
            duration_minutes: item.duration_minutes,
            price: sec.item.price,
            quantity: 1,
            is_home_visit: sec.item.is_home_visit,
            image_url: icon_url,
          });
        }
      });
    }

    setSelectedItems(updatedItems);
    updateCache(updatedItems);
  };

  const removeFromCart = (itemId, type) => {
    const filteredItems = selectedItems.filter(
      (item) => !(item.id === itemId && item.type === type)
    );
    setSelectedItems(filteredItems);
    updateCache(filteredItems);
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item.id, item.type);
      return;
    }
    const updatedItems = selectedItems.map((i) =>
      i.id === item.id && i.type === item.type
        ? { ...i, quantity: newQuantity }
        : i
    );
    setSelectedItems(updatedItems);
    updateCache(updatedItems);
  };

  const handleProceedToBooking = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description:
          "Please select at least one service or package to continue.",
        variant: "destructive",
      });
      return;
    }
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    if (data.minimumCartValue && subtotal < data.minimumCartValue) {
      toast({
        title: "Insufficient Cart Value",
        description: `Minimum cart value is ₹${data.minimumCartValue.toFixed(
          2
        )}. Please add more items.`,
        variant: "destructive",
      });
      return;
    }
    if (user) {
      router.push(
        `/booking?cityName=${encodeURIComponent(cityName)}&cityId=${
          data.cityId
        }&serviceName=${encodeURIComponent(
          subCategorySlug
        )}&categoryName=${encodeURIComponent(categorySlug)}&subcategoryId=${
          data.subCategory?.sub_category_id
        }`
      );
    } else {
      setTimeout(() => {
        router.push(`/login/user?returnUrl=${path}`);
      }, 2000);
    }
  };

  const handleBack = () => router.push(`/services/${cityName}/`);
  const closeModal = () => {
    setIsOpen(false);
    setModalDescription(null);
  };

  if (loading) {
    return <QprozLoader />;
  }

  return (
    <>
      <div className="px-5 pt-2 md:px-8 sm:pt-6 min-h-screen">
        <div className="container mx-auto">
          <div className="xl:grid xl:grid-cols-12 flex flex-col gap-8">
            {/* Left Column Sidenav index list */}
            <SubCategoryDetailsSidenav
              cityId={data.cityId}
              serviceTypes={data.serviceTypes}
              subCategory={data.subCategory}
              handleBack={handleBack}
            />

            {/* Main services listing + Cart sections */}
            <div className="xl:col-span-9 flex flex-col xl:flex-row gap-8">
              <div className="flex-1">
                {/* Banner */}
                {!isMobile && (
                  <Banner
                    cityId={data.cityId}
                    subCategory={data.subCategory}
                    position="service_page_top"
                  />
                )}

                {/* Service List */}
                <div className="flex-1 space-y-10">
                  {data.serviceTypes
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((type, index) => (
                      <div
                        key={type.type_id}
                        id={type.name.toLowerCase().replace(/\s+/g, "-")}
                        className="space-y-6 text-left scroll-mt-24"
                      >
                        {/* Unified header layout with border and status dot */}
                        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3 mt-4">
                          <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                          <Label className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                            {type.name}
                          </Label>
                        </div>

                        <div className="space-y-8">
                          <PackageList
                            typeId={type.type_id}
                            cityId={data.cityId}
                            addToCart={addToCart}
                            diplayHeader={false}
                            selectedItems={selectedItems}
                            onQuantityChange={handleQuantityChange}
                          />

                          <ServiceList
                            typeId={type.type_id}
                            cityId={data.cityId}
                            addToCart={addToCart}
                            selectedItems={selectedItems}
                            onQuantityChange={handleQuantityChange}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Right Column Cart panel */}
              <div className="w-full max-w-sm sticky top-28 self-start z-10">
                <Cart
                  selectedItems={selectedItems}
                  onRemove={(item) => removeFromCart(item.id, item.type)}
                  onCheckout={handleProceedToBooking}
                  minimumCartValue={data.minimumCartValue}
                  onQuantityChange={handleQuantityChange}
                />
                <OrderProcessBanner />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Description Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="w-full max-w-md p-6 bg-white rounded-3xl shadow-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="font-black text-neutral-950 text-xl">Description</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div
            className="text-gray-600 text-sm mt-4 text-left leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(modalDescription || ""),
            }}
          />
        </DialogContent>
      </Dialog>

      <SelectionRestrictionDialog
        open={isRestrictionDialogOpen}
        onOpenChange={setIsRestrictionDialogOpen}
      />
    </>
  );
}
