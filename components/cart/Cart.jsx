"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Minus, Plus } from "lucide-react";
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

  const getImageUrl = (path) => {
    if (path) {
      return process.env.NEXT_PUBLIC_API_ENDPOINT + path;
    }

    return null;
  };

  const renderCartContent = () => (
    <>
      {selectedItems.length === 0 ? (
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
        <div className="space-y-3">
          {hasNonHomeVistItems && (
            <div className="bg-yellow-50 border-y border-yellow-200 p-3 -mx-4">
              <p className="text-xs text-yellow-800 text-center">
                Note: You have non-home visit services in your cart. Both home
                visit and non-home visit services cannot be booked together.
              </p>
            </div>
          )}

          {selectedItems.map((item) => (
            <div
              key={`${item.id}-${item.type}`}
              className="bg-gray-50 rounded-lg p-3 relative"
            >
              <button
                onClick={() => onRemove(item)}
                className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              <div className="flex gap-3">
                <div className="bg-gray-100 rounded-lg overflow-hidden w-10 h-10">
                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                    crossOrigin="anonymous"
                  />
                </div>

                <div>
                  <div className="pr-6">
                    <p className="font-medium text-sm text-gray-900 mb-1">
                      {item.name}
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-primary)] notranslate">
                      ₹{item.price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() =>
                    onQuantityChange(
                      item,
                      Math.max(1, (item.quantity || 1) - 1)
                    )
                  }
                  className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 text-gray-600" />
                </button>

                <span className="text-sm font-medium w-8 text-center notranslate">
                  {item.quantity || 1}
                </span>

                <button
                  onClick={() =>
                    onQuantityChange(item, (item.quantity || 1) + 1)
                  }
                  className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center py-3 border-t">
              <span className="font-semibold text-base text-gray-900">
                Total
              </span>
              <span className="font-bold text-lg text-gray-900 notranslate">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>

            {totalPrice < minimumCartValue && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 text-center">
                  Minimum cart value is ₹
                  <span className="notranslate">
                    {minimumCartValue.toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors"
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
      <Card className="hidden sm:block border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="w-4 h-4" />
            Cart
            {selectedItems.length > 0 && (
              <span className="text-xs font-normal text-gray-500 ml-auto notranslate">
                {selectedItems.length} item(s)
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-2 bg-white">
          {renderCartContent()}
        </CardContent>
      </Card>

      {/* Mobile Cart */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="sm:hidden fixed top-[5.3rem] right-5 w-14 h-14 border rounded-full transition-all duration-200 flex items-center justify-center z-50">
            <ShoppingCart className="w-6 h-6" />
            {selectedItems.length > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white notranslate">
                {selectedItems.length}
              </div>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto w-[90vw] rounded-xl [&>button]:hidden p-0">
          <DialogHeader className="px-5 py-3 bg-white sticky top-0 z-10">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-4 h-4" />
              Cart
              {selectedItems.length > 0 && (
                <span className="text-xs font-normal text-gray-500 ml-auto">
                  {selectedItems.length} item(s)
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:pb-4 pt-0">{renderCartContent()}</div>

          <div className="sm:border-t pt-0 sm:pt-4 px-4 pb-4 bg-white sticky bottom-0">
            <Button
              variant="outline"
              className="w-full"
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
