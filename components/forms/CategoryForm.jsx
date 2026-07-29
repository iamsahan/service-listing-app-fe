import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { serviceAPI } from "../../api/services";
import SelectR from "react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@hooks/use-toast";
import Image from "next/image";

const buildIconSrc = (iconUrl) => {
  if (!iconUrl) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_ENDPOINT || "";

  try {
    const apiBaseUrl = apiBase ? new URL(apiBase) : null;
    const parsed = new URL(iconUrl, apiBaseUrl || undefined);
    const hostsMatch =
      apiBaseUrl &&
      parsed.hostname === apiBaseUrl.hostname &&
      (parsed.port || "") === (apiBaseUrl.port || "");

    if (hostsMatch && parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname;
    }

    if (iconUrl.startsWith("/uploads/")) {
      return iconUrl;
    }

    return parsed.toString();
  } catch (error) {
    return iconUrl.startsWith("/uploads/") ? iconUrl : `/${iconUrl}`;
  }
};

export const CategoryForm = ({ mode, data, onClose }) => {
  const [formData, setFormData] = useState({
    name: data?.name || "",
    slug: data?.slug || "",
    display_order: data?.display_order || 0,
    minimumCartValue:
      data?.cityMinimumCartValues?.map((pricing) => ({
        city_id: pricing.city_id,
        minimum_cart_value: pricing.minimum_cart_value,
      })) || [],
  });

  const serviceCities = data?.categoryMappings?.map((mapping) => ({
    value: mapping.city.city_id,
    label: mapping.city.name,
  }));

  const [selectedCities, setSelectedCities] = useState(serviceCities || []);
  const [image, setImage] = useState(null);
  const [cities, setCities] = useState([]);
  const iconPreviewSrc = buildIconSrc(data?.icon_url);

  console.log("Selected Cities:", selectedCities);
  console.log("Minimum Cart Value:", formData.minimumCartValue);

  const addMinimumCartValue = () => {
    setFormData((prev) => ({
      ...prev,
      minimumCartValue: [
        ...prev.minimumCartValue,
        { city_id: "", minimum_cart_value: "" },
      ],
    }));
  };

  const removeMinimumCartValue = (index) => {
    setFormData((prev) => {
      const updatedMinimumCartValue = prev.minimumCartValue.filter(
        (_, i) => i !== index
      );
      console.log("After removal, minimumCartValue:", updatedMinimumCartValue);
      return {
        ...prev,
        minimumCartValue: updatedMinimumCartValue,
      };
    });
  };

  const updateMinimumCartValue = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      minimumCartValue: prev.minimumCartValue.map((pricing, i) =>
        i === index ? { ...pricing, [field]: value } : pricing
      ),
    }));
  };

  const isCitySelected = (cityId) => {
    return (
      formData.minimumCartValue &&
      formData.minimumCartValue.some((pricing) => pricing.city_id === cityId)
    );
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await serviceAPI.getCities();
        const cityOptions = response.data.map((city) => ({
          value: city.city_id,
          label: city.name,
        }));
        setCities(cityOptions);
      } catch (error) {
        console.error("Error fetching cities:", error);
        toast({
          title: "Error",
          description: "Failed to load cities. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("slug", formData.slug);
    formDataToSend.append("display_order", formData.display_order);

    const cityIds = selectedCities.map((city) => city.value);
    formDataToSend.append("cities", JSON.stringify(cityIds));

    formData.minimumCartValue.forEach((pricing, index) => {
      formDataToSend.append(
        `minimumCartValue[${index}][city_id]`,
        pricing.city_id
      );
      formDataToSend.append(
        `minimumCartValue[${index}][minimum_cart_value]`,
        pricing.minimum_cart_value
      );
    });

    if (image) {
      formDataToSend.append("image", image);
    }

    try {
      let response;

      if (mode === "edit" && data?.category_id) {
        response = await serviceAPI.updateCategory(
          data.category_id,
          formDataToSend
        );
      } else {
        response = await serviceAPI.createCategory(formDataToSend);
      }

      toast({
        title: "Success!",
        description: `Category ${
          mode === "edit" ? "updated" : "created"
        } successfully!`,
        variant: "default",
      });

      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || `Failed to ${mode} category!`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (data?.category_id) {
        await serviceAPI.deleteCategory(data.category_id);

        toast({
          title: "Success!",
          description: "Category deleted successfully!",
          variant: "default",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: "No category selected for deletion!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category!",
        variant: "destructive",
      });
    }
  };

  if (mode === "delete") {
    return (
      <div className="space-y-4">
        <p>Are you sure you want to delete this category?</p>
        <div className="flex space-x-4">
          <Button className="flex-1" onClick={handleDelete}>
            Confirm
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          placeholder="Category Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          placeholder="Slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          placeholder="Display Order"
          value={formData.display_order}
          onChange={(e) =>
            setFormData({
              ...formData,
              display_order: parseInt(e.target.value) || 0,
            })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cities">Select Cities</Label>
        <SelectR
          id="cities"
          options={cities}
          isMulti
          value={selectedCities}
          onChange={setSelectedCities}
        />
      </div>

      <div className="space-y-4">
        <div className="flex gap-5 justify-between items-center">
          <Label>Minimum Cart Value</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMinimumCartValue}
          >
            <Plus size={16} className="mr-2" />
            Add Minimum Cart Value
          </Button>
        </div>

        {formData?.minimumCartValue?.map((pricing, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1">
              <Select
                value={pricing.city_id || ""}
                onValueChange={(value) =>
                  updateMinimumCartValue(index, "city_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cities
                    .filter(
                      (city) =>
                        !isCitySelected(city.value) ||
                        pricing.city_id === city.value
                    )
                    .map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Minimum Cart Value"
                value={pricing.minimum_cart_value || ""}
                onChange={(e) =>
                  updateMinimumCartValue(
                    index,
                    "minimum_cart_value",
                    e.target.value
                  )
                }
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeMinimumCartValue(index)}
            >
              <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Category Icon</Label>
        {iconPreviewSrc && (
          <div className="py-2">
            <div className="mb-2 relative w-32 h-24 mx-auto">
              <Image
                src={iconPreviewSrc}
                alt="Current icon"
                fill
                className="object-cover rounded-md"
                sizes="128px"
                unoptimized
                onError={(e) => (e.target.src = "/default-icon.png")}
              />
            </div>
          </div>
        )}
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" className="flex-1">
          {mode === "edit" ? "Update" : "Create"} Category
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
