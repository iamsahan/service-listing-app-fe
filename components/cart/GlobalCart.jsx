"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import {
  clearUserCartEntries,
  getUserCartEntries,
  setUserCartEntries,
} from "@/src/app/utils/cartcache";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function GlobalCart() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [cache, setCache] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const userCache = getUserCartEntries(user?.uId);
      setCache(userCache);
    } catch (e) {
      console.error("Failed to load cart cache", e);
      toast({
        title: "Error",
        description: "Could not load cart.",
        variant: "destructive",
      });
    }
  }, [user]);

  const updateLocalStorage = (newUserCache) => {
    const userId = user?.uId || null;

    if (!newUserCache || newUserCache.length === 0) {
      clearUserCartEntries(userId);
      setCache([]);
      return;
    }

    setUserCartEntries(userId, newUserCache);
    setCache(newUserCache);
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const confirmCheckout = (entry) => {
    if (!user) {
      router.push("/login/user");
      return;
    }

    router.push(
      `/booking?cityName=${encodeURIComponent(entry.cityName)}&cityId=${
        entry.cityId
      }&serviceName=${encodeURIComponent(
        entry.subCategorySlug
      )}&categoryName=${encodeURIComponent(
        entry?.categorySlug
      )}&subcategoryId=${entry.subcategory_id}`
    );
  };

  const updateQuantity = (entryIndex, itemIndex, change) => {
    const newCache = [...cache];
    const item = newCache[entryIndex].items[itemIndex];

    item.quantity += change;

    if (item.quantity <= 0) {
      newCache[entryIndex].items.splice(itemIndex, 1);
    }

    if (newCache[entryIndex].items.length === 0) {
      newCache.splice(entryIndex, 1);
    }

    updateLocalStorage(newCache);
  };

  const removeItem = (entryIndex, itemIndex) => {
    const newCache = [...cache];
    newCache[entryIndex].items.splice(itemIndex, 1);

    if (newCache[entryIndex].items.length === 0) {
      newCache.splice(entryIndex, 1);
    }

    updateLocalStorage(newCache);
  };

  const formatSlug = (slug) => {
    return decodeURIComponent(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getImageUrl = (path) => {
    if (path) {
      return process.env.NEXT_PUBLIC_API_ENDPOINT + path;
    }

    return null;
  };

  return (
    <>
      {/* Trigger button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="icon"
            className="size-[3.6rem] aspect-square text-lg [&_svg]:size-5 relative rounded-full border transition-all duration-300 ease-out hover:scale-105 active:scale-95 group"
          >
            <ShoppingCart className="transition-transform duration-200 group-hover:scale-[1.2]" />
            {cache.length > 0 && (
              <div className="bg-gradient-to-r notranslate size-6 from-red-500 to-rose-500 text-white absolute -top-1 -right-2 flex rounded-full items-center justify-center text-xs font-bold transition-all duration-300 ease-out shadow-md border-2 border-white/30">
                {cache.length}
              </div>
            )}
          </Button>
        </DialogTrigger>

        {/* Main Cart Dialog */}
        <DialogContent className="w-[90vw] max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-xl">
          <DialogHeader className="px-5 pt-3 pb-1">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="size-5 text-[var(--color-primary)]" />
              Cart
              {cache.length > 0 && (
                <span className="text-xs font-normal text-gray-500 ml-1 bg-gray-100 px-3 py-1 rounded-full notranslate">
                  {cache.length} entry(ies)
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 pt-0">
            {cache.length === 0 ? (
              <div className="flex flex-col items-center justify-center pb-8 pt-2 px-4">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <ShoppingCart className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  Your cart is empty
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Add services to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {cache.map((entry, entryIndex) => {
                  const subtotal = entry.items.reduce(
                    (sum, i) => sum + i.price * i.quantity,
                    0
                  );

                  return (
                    <div
                      key={entry.subCategorySlug}
                      className="sm:border-b sm:pb-5 last:border-0"
                    >
                      <hr className="pb-4" />

                      <h3 className="text-lg font-semibold text-gray-900 mb-3 ml-1">
                        {formatSlug(entry.subCategorySlug)}
                      </h3>

                      <div className="space-y-2 mb-4">
                        {entry.items.map((item, itemIndex) => (
                          <div
                            key={`${item.id}-${item.type}`}
                            className="bg-gray-50 rounded-lg p-3 relative"
                          >
                            <button
                              onClick={() => removeItem(entryIndex, itemIndex)}
                              className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>

                            <div className="flex gap-3">
                              <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden flex items-center justify-center">
                                <Image
                                  src={getImageUrl(item.image_url)}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              </div>

                              <div className="pr-6">
                                <p className="font-medium text-sm text-gray-900 mb-1">
                                  {item.name}
                                </p>
                                <p className="text-sm notranslate font-semibold text-[var(--color-primary)]">
                                  ₹{formatPrice(item.price)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() =>
                                  updateQuantity(entryIndex, itemIndex, -1)
                                }
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3.5 h-3.5 text-gray-600" />
                              </button>

                              <span className="text-sm notranslate font-medium w-8 text-center">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(entryIndex, itemIndex, 1)
                                }
                                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-white transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 ml-1">
                          <span className="font-semibold text-lg text-gray-900">
                            Subtotal
                          </span>
                          <span className="font-bold text-lg text-gray-900 notranslate">
                            ₹{formatPrice(subtotal)}
                          </span>
                        </div>

                        {subtotal < entry.minimumCartValue && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-600 text-center">
                              Minimum cart value is ₹
                              <span className="notranslate">
                                {entry.minimumCartValue}
                              </span>
                            </p>
                          </div>
                        )}

                        <Button
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors"
                          onClick={() => confirmCheckout(entry)}
                          disabled={subtotal < entry.minimumCartValue}
                        >
                          Proceed to Checkout
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Clear Cart Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      disabled={cache.length === 0}
                    >
                      Clear Cart
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-[90vw] max-w-sm [&>button]:hidden p-0 rounded-xl">
                    <DialogHeader className="px-5 py-4 border-b">
                      <DialogTitle className="text-base">
                        Clear Cart
                      </DialogTitle>
                    </DialogHeader>

                    <div className="px-5 py-4">
                      <p className="text-sm text-gray-600">
                        Are you sure you want to remove all items from your
                        cart?
                      </p>
                    </div>

                    <DialogFooter className="px-5 pb-4 flex-row gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </DialogClose>

                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          updateLocalStorage(null);
                        }}
                      >
                        Clear Cart
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
