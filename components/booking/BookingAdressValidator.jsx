import React, { useEffect, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { serviceAPI } from "@/api/services";

const BookingAddressValidator = ({
  city,
  mismatchedCity,
  handleCityMismatchCancel,
  category,
  subCategory,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formatSlug = (slug) => {
    return decodeURIComponent(slug)
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/-/g, " ")
      .trim();
  };

  const categorySlug = encodeURIComponent(category);
  const subCategorySlug = formatSlug(subCategory);
  const categoryName = formatSlug(category);

  useEffect(() => {
    const checkAvailability = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const res = await serviceAPI.getCategoryBySlug(
          categorySlug,
          mismatchedCity || city
        );

        const data = await res.data;

        if (!data.SubCategories || data.SubCategories.length === 0) {
          setErrorMessage(
            `The category "${categoryName}" is not available in ${mismatchedCity}.`
          );
          setAvailable(false);
          return;
        }

        const subExists = data.SubCategories.some(
          (sub) => sub.slug === subCategorySlug
        );

        if (subExists) {
          setAvailable(true);
        } else {
          setErrorMessage(
            `The subcategory "${subCategorySlug}" is not available in ${mismatchedCity}.`
          );
          setAvailable(false);
        }
      } catch (err) {
        setErrorMessage(
          `An error occurred while checking availability. Please try again later.`
        );
        setAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [category, subCategory, mismatchedCity]);

  const handleConfirm = () => {
    router.push(`/services/${mismatchedCity}/${category}/${subCategory}`);
  };

  return (
    <DialogContent className="rounded-xl shadow-lg bg-white max-w-md w-full">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-red-600">
          City Mismatch
        </DialogTitle>
        <DialogDescription className="mt-2 text-gray-600">
          {city !== mismatchedCity ? (
            <>
              You selected an address in{" "}
              <span className="font-medium">{mismatchedCity}</span>, but you're
              browsing services in <span className="font-medium">{city}</span>.
            </>
          ) : (
            <>
              You selected an address in{" "}
              <span className="font-medium">{city}</span>.
            </>
          )}
          {loading ? (
            <div className="mt-2 text-sm text-blue-500">
              Checking availability...
            </div>
          ) : errorMessage ? (
            <div className="mt-2 text-sm text-red-500">{errorMessage}</div>
          ) : (
            <>
              Would you like to switch to{" "}
              <span className="font-medium text-blue-600">
                {mismatchedCity}
              </span>{" "}
              for <span className="capitalize">{subCategorySlug}</span>{" "}
              services?
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={handleCityMismatchCancel}
          className="border-gray-300"
        >
          Stay on {city}
        </Button>
        <Button
          onClick={handleConfirm}
          className="bg-[#5f60b9] hover:bg-[#4d4eb3] text-white"
          disabled={!available || loading}
        >
          {loading
            ? "Checking..."
            : available
            ? `Switch to ${mismatchedCity}`
            : "Not Available"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default BookingAddressValidator;
