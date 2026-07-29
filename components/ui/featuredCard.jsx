import React from "react";
import Image from "next/image";
import { Rating } from "@mui/material";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@components/ui/avatar";
import { Label } from "./label";
import { Button } from "./button";
import { ShoppingCart } from "lucide-react";

const FeaturedCard = ({
  className,
  imageSrc,
  badgeText,
  price,
  title,
  description,
  rating,
  providerAvatar,
  providerName,
  onClick,
  onBtnClick,
}) => {
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

  const safeImageSrc = isValidUrl(imageSrc) ? imageSrc : "/assets/images/card-1.jpg";

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "relative group bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 w-[260px] h-[300px] hover:shadow-lg hover:border-gray-300",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative" onClick={onClick}>
        <div className="relative w-[260px] h-[150px] overflow-hidden bg-gray-50">
          <Image
            src={safeImageSrc}
            alt={title || "card image"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="260px" // fixed width
            unoptimized
            crossOrigin="anonymous"
          />
        </div>

        {/* Price Badge */}
        {price && (
          <div className="absolute top-2 right-2">
            <div className="bg-white shadow-md text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">
              ₹{price}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 bg-white h-[150px] flex flex-col">
        <h3
          className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-1 hover:text-gray-700 transition-colors"
          onClick={onClick}
        >
          {title}
        </h3>

        <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2 mb-3">
            <Rating
              size="small"
              name="rating-read"
              value={rating}
              precision={0.5}
              readOnly
              sx={{
                fontSize: "0.875rem",
                "& .MuiRating-iconFilled": {
                  color: "#fbbf24",
                },
              }}
            />
            <span className="text-xs text-gray-500">
              {rating} ({badgeText})
            </span>
          </div>
        )}

        {/* Bottom Section */}
        <div className="mt-auto flex items-center justify-between gap-2">
          {/* Provider Info */}
          {providerAvatar && providerName && (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Avatar className="w-6 h-6 ring-1 ring-gray-200">
                <AvatarImage src={providerAvatar} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px] font-semibold">
                  {providerName
                    ? providerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "N/A"}
                </AvatarFallback>
              </Avatar>
              <Label className="text-xs text-gray-600 truncate">
                {providerName}
              </Label>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={onBtnClick}
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-3 py-1.5 h-auto rounded-md transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-3 h-3" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
