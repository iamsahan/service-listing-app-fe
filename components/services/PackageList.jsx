import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { serviceAPI } from "@/api/services";
import { useToast } from "@/hooks/use-toast";
import PackageDetails from "../packages/PackageDetails";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export function PackageList({
  typeId,
  cityId,
  addToCart,
  diplayHeader,
  selectedItems,
  onQuantityChange,
}) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeId) {
      fetchPackages();
    }
  }, [typeId]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceAPI.getPackagesByType(typeId, cityId);

      const packagesData = response.data?.data || response.data;

      if (Array.isArray(packagesData)) {
        setPackages(packagesData);
      } else {
        console.error("Unexpected packages data format:", packagesData);
        setPackages([]);
        toast({
          title: "Error",
          description: "Received invalid package data format",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError(error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to load packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (url) {
      return `${process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`;
    }
    return "/default-icon.png";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package size={20} />
          <h3 className="text-lg font-medium">Packages</h3>
        </div>

        <div className="space-y-4">
          {[1, 2].map((index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        <p>Failed to load packages. Please try again later.</p>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <div>
      {diplayHeader && (
        <div className="flex items-center gap-2 mb-3 pl-2 border-b pb-4">
          <Package size={20} className="text-[var(--color-primary)]" />
          <h3 className="font-medium">Packages ({packages.length})</h3>
        </div>
      )}

      <div className="grid gap-4 py-3 px-1.5">
        {packages.map((pkg, index) => (
          <React.Fragment key={pkg.package_id}>
            <div className="flex items-center gap-3 mb-3 border p-2 rounded-lg">
              <Image
                src={getImageUrl(
                  pkg.image_variants?.thumbnail ||
                    pkg.image_variants?.default?.thumbnail?.url
                )}
                alt={pkg.name || "Service"}
                width={48}
                height={48}
                className="rounded-md aspect-square object-cover size-12 bg-gray-100"
                unoptimized
                crossOrigin="anonymous"
              />
              <div>
                <h3 className="font-medium text-[0.94rem]">{pkg.name}</h3>
                <p className="text-gray-600 text-xs mt-0.5">
                  {pkg.description}
                </p>
              </div>
            </div>

            <PackageDetails
              pkg={pkg}
              addToCart={addToCart}
              cartItems={selectedItems}
              onQuantityChange={onQuantityChange}
            />
            {index < packages.length - 1 && <hr className="my-2" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
