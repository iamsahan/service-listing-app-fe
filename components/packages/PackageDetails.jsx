import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, ChevronRight, Clock } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMobile } from "@/src/hooks/useMobile";
import Image from "next/image";
import { cn } from "@/lib/utils";
import PackageOverviewDialog from "./PackageOverviewDialog";

const PackageDetails = ({ pkg, addToCart, cartItems, onQuantityChange }) => {
  const [modalOverview, setModalOverview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isMobile = useMobile();

  // Process package sections
  const sections = useMemo(() => {
    if (!pkg?.PackageSections?.length) return [];

    return pkg.PackageSections.map((section) => {
      const items = (section.PackageItems || [])
        .map((item) => {
          const cityPrice = item.CitySpecificPricings?.[0]?.price;
          const specialPrice = item.SpecialPricings?.[0]?.special_price;
          const price = specialPrice || cityPrice || item.price;

          return {
            ...item,
            price,
            originalPrice: cityPrice || item.price,
          };
        })
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      return { ...section, items };
    });
  }, [pkg]);

  // Get cart items for package
  const packageCartItems = useMemo(
    () =>
      cartItems?.filter(
        (i) => i.type === "package_item" && i.pkgName === pkg.name
      ) || [],
    [cartItems, pkg.name]
  );

  const packageQuantity = useMemo(
    () => packageCartItems.reduce((sum, i) => sum + (i.quantity || 0), 0),
    [packageCartItems]
  );

  const totalItems = useMemo(
    () => sections.reduce((sum, s) => sum + s.items.length, 0),
    [sections]
  );

  const lowestItemPrice = useMemo(() => {
    const prices = sections.flatMap((s) =>
      s.items.map((i) => Number(i.price) || 0)
    );
    return prices.length ? Math.min(...prices) : 0;
  }, [sections]);

  // Initialize selected items
  const getDefaultSelections = useCallback(() => {
    const defaults = {};
    pkg?.PackageSections?.forEach((section) => {
      const defaultItem = section.PackageItems?.find((i) => i.is_default);
      defaults[section.section_id] = defaultItem ? [defaultItem.item_id] : [];
    });
    return defaults;
  }, [pkg]);

  const [selectedItems, setSelectedItems] = useState(getDefaultSelections);

  // Sync selections with cart
  React.useEffect(() => {
    if (packageCartItems.length === 0) {
      setSelectedItems(getDefaultSelections());
      return;
    }

    setSelectedItems((prev) => {
      const cartItemIds = new Set(packageCartItems.map((ci) => ci.id));
      const updated = {};

      Object.keys(prev).forEach((sectionId) => {
        updated[sectionId] = prev[sectionId].filter((id) =>
          cartItemIds.has(id)
        );
      });

      return updated;
    });
  }, [packageCartItems, getDefaultSelections]);

  // Calculate package total
  const packageTotal = useMemo(() => {
    let total = 0;
    const cartItemIds = new Set(packageCartItems.map((ci) => ci.id));

    sections.forEach((section) => {
      const selectedIds = selectedItems[section.section_id] || [];
      selectedIds.forEach((id) => {
        if (!cartItemIds.has(id)) {
          const item = section.items.find((i) => i.item_id === id);
          if (item) total += Number(item.price) || 0;
        }
      });
    });

    packageCartItems.forEach((i) => {
      total += Number(i.price) * (i.quantity || 0);
    });

    return total;
  }, [sections, selectedItems, packageCartItems]);

  const hasSelections = useMemo(
    () => Object.values(selectedItems).some((arr) => arr?.length > 0),
    [selectedItems]
  );

  const toggleItem = useCallback((sectionId, itemId) => {
    setSelectedItems((prev) => {
      const current = prev[sectionId] || [];
      const updated = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return { ...prev, [sectionId]: updated };
    });
  }, []);

  const handleAddToCart = useCallback(() => {
    setIsDirty(false);

    const cartItemIds = new Set(packageCartItems.map((ci) => ci.id));
    const selectedItemsList = sections.flatMap((section) => {
      const selectedIds = selectedItems[section.section_id] || [];

      return selectedIds
        .filter((id) => !cartItemIds.has(id))
        .map((id) => {
          const item = section.items.find((i) => i.item_id === id);
          return item
            ? {
                section: section.name,
                item,
                itemId: item.item_id,
              }
            : null;
        })
        .filter(Boolean);
    });

    if (selectedItemsList.length === 0) return;

    addToCart(
      { ...pkg, finalPrice: packageTotal, sections: selectedItemsList },
      "package_item",
      pkg.image_variants?.thumbnail ||
        pkg.image_variants?.default?.thumbnail?.url
    );
  }, [sections, selectedItems, packageCartItems, packageTotal, pkg, addToCart]);

  const renderSelections = useCallback(() => {
    if (!sections.length || !packageCartItems.length) return null;

    const itemsInCart = packageCartItems
      .map((ci) => {
        const section = sections.find((s) =>
          s.items.some((i) => i.item_id === ci.id)
        );
        const item = section?.items.find((i) => i.item_id === ci.id);
        return item ? { ...item, sectionName: section?.name } : null;
      })
      .filter(Boolean);

    return (
      <div className="pt-2">
        <p className="text-xs font-medium text-gray-700 flex items-center gap-2">
          Selection:
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {itemsInCart.map((item) => (
            <div
              key={item.item_id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm"
            >
              <span className="text-gray-600">{item.name}</span>
              <span className="font-semibold text-gray-900">
                ₹{Number(item.price).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }, [sections, packageCartItems]);

  const getImageUrl = (segment) =>
    segment ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${segment}` : null;

  const isPackageInCart = packageCartItems.length > 0;

  return (
    <>
      <div className="space-y-5 sm:space-y-2">
        <div className="flex gap-6 sm:gap-12 justify-between items-start">
          {/* Left Section */}
          <div className="flex-1 space-y-5">
            <div className="space-y-3.5">
              <div className="space-y-1">
                <h6 className="font-medium text-[0.94rem] text-gray-900 hover:text-[#5f60b9] transition-colors cursor-pointer">
                  {pkg.name}
                </h6>
                {(pkg.duration_hours || pkg.duration_minutes) && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-[0.8rem] text-[var(--color-primary)]" />
                    <span className="text-xs text-gray-600">
                      {pkg.duration_hours > 0 && `${pkg.duration_hours} hr `}
                      {pkg.duration_minutes > 0 &&
                        `${pkg.duration_minutes} min`}
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic Price */}
              <div className="flex items-center gap-2">
                {!hasSelections ? (
                  <span className="text-sm text-gray-600">
                    Starting from
                    <span className="font-semibold text-base text-gray-900 ml-2">
                      ₹{lowestItemPrice.toFixed(2)}
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">
                      ₹{packageTotal.toFixed(2)}
                    </span>
                    {/* {pkg.default_price &&
                      pkg.default_price !== packageTotal && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{pkg.default_price}
                        </span>
                      )} */}
                  </>
                )}
              </div>

              {!isMobile && renderSelections()}
            </div>

            {/* Description */}
            <ul className="space-y-1 border-t border-dashed border-gray-200 pt-3">
              <li className="text-sm text-gray-600 flex items-start gap-2">
                <span>•</span>
                <span>
                  {pkg.description ||
                    "A curated set of services bundled for convenience and savings."}
                </span>
              </li>
            </ul>

            <Button
              variant="link"
              className="text-[#5f60b9] p-0 pt-1 h-auto font-semibold text-[0.83rem] gap-1"
              onClick={() => setModalOverview(true)}
            >
              Show more
              <ChevronRight />
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-center gap-5">
            {pkg.icon_url && (
              <Image
                src={getImageUrl(
                  pkg.image_variants?.thumbnail ||
                    pkg.image_variants?.default?.thumbnail?.url
                )}
                alt={pkg.name}
                width={128}
                height={128}
                className="size-24 sm:size-32 object-cover rounded-lg bg-gray-50"
                unoptimized
                crossOrigin="anonymous"
              />
            )}

            {/* Customize Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <div
                  className={cn("flex flex-col items-center gap-3", {
                    "mr-3": !pkg.icon_url && isPackageInCart,
                    "mr-4": !pkg.icon_url && !isPackageInCart,
                  })}
                >
                  {isPackageInCart ? (
                    <>
                      <div className="flex items-center gap-2 border border-[#5f60b9]/20 rounded-md hover:bg-[#f7f7ff] transition cursor-pointer">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#5f60b9] hover:bg-[#5f60b9]/10 h-8 px-3"
                        >
                          –
                        </Button>
                        <span className="px-2 font-medium text-sm">
                          {packageQuantity}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#5f60b9] hover:bg-[#5f60b9]/10 h-8 px-3"
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-xs text-gray-600">
                        {totalItems} options
                      </span>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="bg-white text-[#5f60b9] border border-[#5f60b9]/20 hover:bg-[#5f60b9] hover:text-white px-8 font-medium transition-colors"
                      >
                        Add
                      </Button>
                      <span className="text-xs text-gray-600">
                        {totalItems} options
                      </span>
                    </>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent className="w-full max-w-[95vw] sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-lg">
                <DialogHeader className="px-6 py-4 border-b">
                  <DialogTitle className="text-lg">
                    Customize {pkg.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
                  {sections.map((section, idx) => (
                    <div
                      key={section.section_id}
                      className={cn("pb-6", {
                        "border-b border-gray-200": idx !== sections.length - 1,
                      })}
                    >
                      <div className="mb-4">
                        <h3 className="font-semibold text-base text-gray-900 mb-1">
                          {section.name}
                        </h3>
                        {section.description && (
                          <p className="text-sm text-gray-600">
                            {section.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        {section.items.map((item) => {
                          const isSelected = selectedItems[
                            section.section_id
                          ]?.includes(item.item_id);
                          const cartItem = packageCartItems.find(
                            (i) => i.id === item.item_id
                          );
                          const isItemInCart = !!cartItem;

                          return (
                            <div
                              key={item.item_id}
                              onClick={() =>
                                toggleItem(section.section_id, item.item_id)
                              }
                              className={cn(
                                "flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                                isSelected && !isItemInCart
                                  ? "border-[#5b6bdf]/50 bg-gray-50"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              )}
                            >
                              {!isItemInCart && (
                                <Checkbox
                                  checked={isSelected}
                                  readOnly
                                  className="mt-0.5"
                                />
                              )}

                              <Label className="flex-1 cursor-pointer">
                                <div className="flex items-start justify-between gap-6 sm:gap-4">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 mb-1">
                                      {item.name}
                                    </p>
                                    {item.description && (
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    {isItemInCart && (
                                      <div className="flex items-center gap-2 border border-[#5f60b9]/20 rounded-md hover:bg-[#f7f7ff] transition">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-[#5f60b9] hover:bg-[#5f60b9]/10 h-8 pr-1 pl-3"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onQuantityChange(
                                              cartItem,
                                              cartItem.quantity - 1
                                            );
                                            setIsDirty(true);
                                          }}
                                        >
                                          –
                                        </Button>

                                        <span className="px-2 font-medium text-sm">
                                          {cartItem.quantity}
                                        </span>

                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-[#5f60b9] hover:bg-[#5f60b9]/10 h-8 pl-1 pr-3"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onQuantityChange(
                                              cartItem,
                                              cartItem.quantity + 1
                                            );
                                            setIsDirty(true);
                                          }}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    )}

                                    <div className="text-right shrink-0">
                                      <div className="font-bold text-gray-900">
                                        ₹{item.price}
                                      </div>
                                      {item.originalPrice !== item.price && (
                                        <span className="text-xs text-gray-500 line-through">
                                          ₹{item.originalPrice}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {!item.is_home_visit && (
                                  <p className="text-xs text-[var(--color-primary)] border py-1 px-3 w-fit rounded-full flex sm:items-center mt-3 sm:mt-2">
                                    <AlertCircleIcon className="mr-2 size-3 mt-1 sm:mt-0" />
                                    Visit required at provider location
                                  </p>
                                )}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Sticky Footer */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{packageTotal.toFixed(2)}
                      </span>
                    </div>

                    <DialogClose asChild>
                      <Button
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddToCart}
                        disabled={!hasSelections && !isDirty}
                      >
                        Add to Cart
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isMobile && renderSelections()}
      </div>

      {/* Overview Modal */}
      <PackageOverviewDialog
        open={modalOverview}
        onOpenChange={setModalOverview}
        packageId={pkg?.package_id}
      />
    </>
  );
};

export default PackageDetails;
