"use client";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, MapPin, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddressSelector = ({ isOpen, onClose, addresses, onSelect }) => {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const cityName = params ? params.get("cityName") : "";

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home":
        return <Home className="size-4 text-emerald-600" />;
      case "work":
      case "office":
        return <Building2 className="size-4 text-emerald-600" />;
      default:
        return <MapPin className="size-4 text-emerald-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-sm md:max-w-lg w-full border-none bg-white shadow-2xl p-0 gap-0 rounded-[2.5rem] overflow-hidden">
        {/* Header */}
        <div className="relative bg-white border-b border-neutral-100 p-6 text-left">
          <DialogTitle className="text-xl font-black text-neutral-900 uppercase tracking-tight">
            Choose Address
          </DialogTitle>
          <p className="text-xs text-neutral-500 mt-1">
            Select an operational service address or set up a new location.
          </p>
        </div>

        <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto">
          {/* Add New Address Trigger (High-Contrast B&W style) */}
          <div
            onClick={() =>
              onSelect({ value: "__add_new_address__", location: null })
            }
            className="group relative overflow-hidden rounded-2xl bg-black hover:bg-neutral-800 p-4 cursor-pointer transition-all duration-300 shadow-md flex items-center justify-between"
          >
            <div className="relative z-10 flex items-center gap-3 text-white">
              <div className="size-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/10">
                <Plus className="size-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-white text-sm uppercase tracking-wide">
                  Add New Address
                </p>
                <p className="text-[10px] text-neutral-400 font-semibold">
                  Configure a new location marker
                </p>
              </div>
            </div>
            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2">
              Setup &rarr;
            </span>
          </div>

          {/* Saved Addresses list */}
          {addresses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px bg-neutral-200/60 flex-1" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                  Saved Locations
                </span>
                <div className="h-px bg-neutral-200/60 flex-1" />
              </div>

              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() =>
                      onSelect({
                        value: `${addr.line1}${
                          addr.line2 ? ", " + addr.line2 : ""
                        }, ${addr.city}, ${addr.state} ${addr.postal_code}`,
                        location: addr.location,
                        type: addr.type,
                        city: addr.city,
                      })
                    }
                    className="group relative overflow-hidden rounded-2xl bg-white hover:bg-emerald-50/10 border border-neutral-200/60 hover:border-emerald-500/30 p-4 cursor-pointer transition-all duration-300 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          {getAddressIcon(addr.type)}
                        </div>

                        <p className="font-extrabold text-neutral-900 text-xs uppercase tracking-wide capitalize">
                          {addr.type || "Address"}
                        </p>
                      </div>

                      {addr.city?.toLowerCase() !==
                        cityName?.toLowerCase()?.replace("_", " ") && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                          Different City
                        </span>
                      )}
                    </div>

                    {/* Address Detail Info */}
                    <div className="mt-2.5 pl-0.5">
                      <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wide">
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty Placeholder Frame */}
          {addresses.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="relative mx-auto w-fit">
                <div className="size-16 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-center mx-auto">
                  <MapPin className="size-8 text-neutral-400" />
                </div>
                <div className="absolute -top-1 -right-1 size-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white shadow-sm">
                  <Plus className="size-3 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-neutral-800 text-sm uppercase tracking-wide">
                  No saved addresses
                </h3>
                <p className="text-neutral-450 text-xs font-semibold max-w-[200px] mx-auto leading-relaxed">
                  Add your first service address to proceed with checkout.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer cancel actions */}
        <div className="bg-neutral-50 border-t border-neutral-100 p-5 sticky bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-neutral-200 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider rounded-xl py-3.5 h-auto"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSelector;
