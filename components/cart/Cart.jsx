"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Minus, Plus, AlertCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import Image from "next/image";

export default function Cart({
  selectedItems,
  onRemove,
  onCheckout,
  minimumCartValue,
  onQuantityChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasNonHomeVistItems = useMemo(
    () => selectedItems.some((item) => item.is_home_visit === false),
    [selectedItems]
  );

  const totalPrice = selectedItems
    .map((item) => item.price * (item.quantity || 1))
    .reduce((a, b) => a + b, 0);

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

  const renderCartContent = () => (
    <>
      {selectedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center pb-8 pt-6 px-4">
          <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3">
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
        <div className="space-y-4">
          {hasNonHomeVistItems && (
            <div className="bg-amber-50/80 border border-amber-200/60 p-3.5 rounded-2xl flex items-start gap-2 text-left">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-bold text-amber-800">
                Notice: You have non-home visit services in your cart. Home visit and non-home visit items cannot be booked together.
              </p>
            </div>
          )}

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {selectedItems.map((item) => (
              <div
                key={`${item.id}-${item.type}`}
                className="bg-white border border-neutral-200/60 hover:border-neutral-300 rounded-2xl p-3.5 relative transition-all duration-200"
              >
                {/* Delete button */}
                <button
                  onClick={() => onRemove(item)}
                  className="absolute top-3 right-3 p-1 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700" />
                </button>

                <div className="flex gap-3 text-left">
                  <div className="relative border border-neutral-100 bg-neutral-50 rounded-xl overflow-hidden w-12 h-12 shrink-0">
                    <Image
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-extrabold text-xs text-neutral-900 leading-tight mb-1 line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs font-black text-emerald-700 notranslate">
                      ₹{Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3.5">
                  <button
                    onClick={() =>
                      onQuantityChange(
                        item,
                        Math.max(1, (item.quantity || 1) - 1)
                      )
                    }
                    className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-3 h-3 text-neutral-600" />
                  </button>

                  <span className="text-xs font-black w-8 text-center notranslate text-neutral-800">
                    {item.quantity || 1}
                  </span>

                  <button
                    onClick={() =>
                      onQuantityChange(item, (item.quantity || 1) + 1)
                    }
                    className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-3 h-3 text-neutral-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-4 border-t border-neutral-100">
            <div className="flex justify-between items-center pl-1">
              <span className="font-extrabold text-sm uppercase tracking-wider text-neutral-400">
                Total Amount
              </span>
              <span className="font-black text-xl text-neutral-900 notranslate">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>

            {totalPrice < minimumCartValue && (
              <div className="bg-red-50/80 border border-red-200/60 rounded-2xl p-3.5 flex items-start gap-2 text-left">
                <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-red-700 font-bold">
                  Minimum cart value is ₹
                  <span className="notranslate">
                    {minimumCartValue.toFixed(2)}
                  </span>
                  . Please add more services to checkout.
                </p>
              </div>
            )}

            <Button
              className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md transition-all duration-300 disabled:bg-neutral-150 disabled:text-neutral-400 disabled:opacity-40"
              onClick={onCheckout}
              disabled={totalPrice < minimumCartValue}
            >
              Proceed to Booking
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Cart */}
      <Card className="hidden sm:block border-neutral-200/60 shadow-sm overflow-hidden rounded-[2rem] bg-white">
        <CardHeader className="bg-white border-b border-neutral-100 py-4 px-5">
          <CardTitle className="flex items-center gap-2 text-left">
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
            <span className="font-black uppercase text-xs tracking-wider text-neutral-800">
              Your Cart
            </span>
            {selectedItems.length > 0 && (
              <span className="text-[10px] font-bold text-neutral-400 ml-auto notranslate bg-neutral-100 border border-neutral-200/50 px-2.5 py-1 rounded-full">
                {selectedItems.length} items
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 bg-white">
          {renderCartContent()}
        </CardContent>
      </Card>

      {/* Mobile Cart */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="sm:hidden fixed top-[5.3rem] right-5 w-14 h-14 bg-black text-white hover:bg-neutral-800 shadow-xl border border-neutral-800 rounded-full transition-all duration-200 flex items-center justify-center z-50">
            <ShoppingCart className="w-5 h-5" />
            {selectedItems.length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white notranslate">
                {selectedItems.length}
              </div>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto w-[90vw] rounded-2xl [&>button]:hidden p-0 bg-white">
          <DialogHeader className="px-5 py-4 bg-white border-b border-neutral-100 sticky top-0 z-10 text-left">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-500" />
              <span className="font-black uppercase text-xs tracking-wider text-neutral-800">
                Your Cart
              </span>
              {selectedItems.length > 0 && (
                <span className="text-[10px] font-bold text-neutral-400 ml-auto bg-neutral-100 border border-neutral-200/50 px-2.5 py-1 rounded-full">
                  {selectedItems.length} items
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="p-5">{renderCartContent()}</div>

          <div className="border-t border-neutral-100 p-4 bg-neutral-50 sticky bottom-0 flex gap-3">
            <Button
              variant="outline"
              className="w-full border-neutral-200 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider rounded-xl py-3"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
