"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, X, AlertCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import SectionBadge from "@/components/home/SectionBadge";
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
  }, [user, open]);

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
    setOpen(false);
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

  const isValidUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("/") || url.startsWith("data:")) return true;
    try {
      if (url.startsWith("undefined")) return false;
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getImageUrl = (path) => {
    const raw = path ? process.env.NEXT_PUBLIC_API_ENDPOINT + path : null;
    return isValidUrl(raw) ? raw : "/assets/images/card-1.jpg";
  };

  return (
    <>
      {/* Trigger button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="icon"
            className="size-[3.6rem] aspect-square text-lg [&_svg]:size-5 relative rounded-full border transition-all duration-300 ease-out hover:scale-105 active:scale-95 group shadow-sm bg-white"
            aria-label="Open Cart"
          >
            <ShoppingCart className="transition-transform duration-200 group-hover:scale-[1.15]" />
            {cache.length > 0 && (
              <div className="bg-black text-white absolute -top-1.5 -right-2 flex size-6 rounded-full items-center justify-center text-[10px] font-black border-2 border-white notranslate shadow-md">
                {cache.length}
              </div>
            )}
          </Button>
        </DialogTrigger>

        {/* Main Cart Dialog */}
        <DialogContent className="w-[92vw] max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-[2rem] bg-white border border-neutral-100 shadow-2xl">
          
          <DialogHeader className="px-6 py-4 bg-white border-b border-neutral-100 sticky top-0 z-10 text-left">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-emerald-500" />
              <span className="font-black uppercase text-xs tracking-wider text-neutral-800">
                Your Cart
              </span>
              {cache.length > 0 && (
                <span className="text-[10px] font-bold text-neutral-400 ml-auto bg-neutral-100 border border-neutral-200/50 px-2.5 py-1 rounded-full notranslate">
                  {cache.length} categories
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cache.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-6 h-6 text-neutral-300" />
                </div>
                <p className="text-neutral-800 text-sm font-bold">
                  Your cart is empty
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  Add services to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {cache.map((entry, entryIndex) => {
                  const subtotal = entry.items.reduce(
                    (sum, i) => sum + i.price * i.quantity,
                    0
                  );

                  return (
                    <div
                      key={entry.subCategorySlug}
                      className="border border-neutral-200/80 rounded-[1.8rem] p-5 bg-neutral-50/40 text-left space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <SectionBadge>{formatSlug(entry.subCategorySlug)}</SectionBadge>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                          {entry.cityName}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {entry.items.map((item, itemIndex) => (
                          <div
                            key={`${item.id}-${item.type}`}
                            className="bg-white border border-neutral-200/60 rounded-2xl p-3.5 relative transition-all"
                          >
                            <button
                              onClick={() => removeItem(entryIndex, itemIndex)}
                              className="absolute top-3 right-3 p-1 hover:bg-neutral-100 rounded-full transition-colors"
                              aria-label="Remove item"
                            >
                              <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-800" />
                            </button>

                            <div className="flex gap-3">
                              <div className="relative border border-neutral-100 bg-neutral-50 rounded-xl overflow-hidden w-11 h-11 shrink-0">
                                <Image
                                  src={getImageUrl(item.image_url)}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="44px"
                                  unoptimized
                                  crossOrigin="anonymous"
                                />
                              </div>

                              <div className="pr-6 text-left">
                                <p className="font-extrabold text-xs text-neutral-900 leading-tight mb-1 line-clamp-2">
                                  {item.name}
                                </p>
                                <p className="text-xs notranslate font-black text-emerald-600">
                                  ₹{formatPrice(item.price)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3.5">
                              <button
                                onClick={() =>
                                  updateQuantity(entryIndex, itemIndex, -1)
                                }
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3 text-neutral-600" />
                              </button>

                              <span className="text-xs font-black w-8 text-center notranslate text-neutral-800">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(entryIndex, itemIndex, 1)
                                }
                                className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 active:scale-95 transition-all shadow-sm"
                              >
                                <Plus className="w-3 h-3 text-neutral-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3.5 border-t border-neutral-200/80 space-y-4">
                        <div className="flex justify-between items-center pl-1">
                          <span className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
                            Subtotal
                          </span>
                          <span className="font-black text-base text-neutral-900 notranslate">
                            ₹{formatPrice(subtotal)}
                          </span>
                        </div>

                        {subtotal < entry.minimumCartValue && (
                          <div className="bg-red-50/80 border border-red-200/60 rounded-2xl p-3.5 flex items-start gap-2 text-left">
                            <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed text-red-700 font-bold">
                              Minimum cart value is ₹
                              <span className="notranslate">
                                {entry.minimumCartValue}
                              </span>
                              . Please add more items to checkout.
                            </p>
                          </div>
                        )}

                        <Button
                          className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md transition-all duration-300 disabled:bg-neutral-150 disabled:text-neutral-400 disabled:opacity-40"
                          onClick={() => confirmCheckout(entry)}
                          disabled={subtotal < entry.minimumCartValue}
                        >
                          Proceed to Booking
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Clear Cart Trigger */}
                <div className="pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-neutral-200 hover:bg-neutral-50 text-xs font-black uppercase tracking-wider rounded-xl py-4 transition-all"
                        disabled={cache.length === 0}
                      >
                        <Trash2 className="size-4 mr-1 text-red-500" />
                        Clear Cart
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="w-[90vw] max-w-sm [&>button]:hidden p-0 rounded-[2rem] bg-white border border-neutral-100 shadow-2xl">
                      <DialogHeader className="px-6 py-4 border-b border-neutral-100 text-left">
                        <DialogTitle className="text-xs font-black uppercase tracking-wider text-neutral-800">
                          Clear Cart
                        </DialogTitle>
                      </DialogHeader>

                      <div className="px-6 py-5 text-left">
                        <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                          Are you sure you want to remove all items and categories from your cart? This action cannot be undone.
                        </p>
                      </div>

                      <DialogFooter className="px-6 pb-5 flex-row gap-3">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold uppercase tracking-wider py-3.5 border-neutral-200">
                            Cancel
                          </Button>
                        </DialogClose>

                        <Button
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider py-3.5"
                          onClick={() => {
                            updateLocalStorage(null);
                          }}
                        >
                          Clear
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-neutral-100 p-4 bg-neutral-50/50 flex gap-3">
            <Button
              variant="outline"
              className="w-full border-neutral-200 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider rounded-xl py-3.5"
              onClick={() => setOpen(false)}
            >
              Close Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
