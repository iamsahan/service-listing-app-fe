"use client";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, MapPin, Home, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddressSelector = ({ isOpen, onClose, addresses, onSelect }) => {
  const params = new URLSearchParams(window.location.search);
  const cityName = params.get("cityName");

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home":
        return <Home className="size-4" />;
      case "work":
      case "office":
        return <Building2 className="size-4" />;
      default:
        return <MapPin className="size-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-sm md:max-w-lg w-full border-0 bg-white/95 backdrop-blur-xl shadow-2xl p-0 gap-0 rounded-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-50 to-gray-50/80 backdrop-blur-sm border-b border-gray-100/50 p-6 rounded-t-2xl">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Choose Address
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Select or add a service location
          </p>
        </div>

        <div className="px-5 pb-5 space-y-4 max-h-96 overflow-y-auto">
          {/* Add */}
          <div
            onClick={() =>
              onSelect({ value: "__add_new_address__", location: null })
            }
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#5f60b9] to-[#7c7ce6] p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-[#5f60b9]/25 active:scale-[0.98]"
          >
            <div className="relative z-10 flex items-center gap-3 text-white">
              <div className="size-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Plus className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-white">Add New Address</p>
                <p className="text-xs text-white/80">
                  Set up a new service location
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
          </div>

          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Saved Locations
                </span>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1" />
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
                    className="group relative overflow-hidden rounded-xl bg-gray-50/80 hover:bg-white border border-gray-100/80 hover:border-[#5f60b9]/20 p-4 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-gradient-to-br from-[#5f60b9]/10 to-[#7c7ce6]/10 border border-[#5f60b9]/10 flex items-center justify-center group-hover:border-[#5f60b9]/20 group-hover:bg-gradient-to-br group-hover:from-[#5f60b9]/15 group-hover:to-[#7c7ce6]/15 transition-all duration-300">
                        {getAddressIcon(addr.type)}
                      </div>

                      <p className="font-semibold text-gray-900 capitalize">
                        {addr.type || "Address"}
                      </p>

                      {addr.city?.toLowerCase() !==
                        cityName?.toLowerCase()?.replace("_", " ") && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Different City
                        </span>
                      )}
                    </div>

                    {/* Address details */}
                    <div className="ml-13 mt-2">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {addr.city}, {addr.state} {addr.postal_code}
                      </p>
                    </div>

                    {/* hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#5f60b9]/0 via-[#5f60b9]/2 to-[#5f60b9]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {addresses.length === 0 && (
            <div className="text-center py-12">
              <div className="relative mx-auto mb-4">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200/80 flex items-center justify-center mx-auto">
                  <MapPin className="size-8 text-gray-400" />
                </div>
                <div className="absolute -top-1 -right-1 size-6 rounded-full bg-gradient-to-r from-[#5f60b9] to-[#7c7ce6] flex items-center justify-center">
                  <Plus className="size-3 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                No saved addresses
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first address to get started quickly
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/50 backdrop-blur-sm border-t border-gray-100/50 p-6 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all duration-200"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSelector;
