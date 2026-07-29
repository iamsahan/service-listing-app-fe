import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { serviceAPI } from "../../api/services";
import { toast } from "@hooks/use-toast";

export const SubCategoryForm = ({
  mode = "create",
  data,
  onClose,
  selectedData,
}) => {
  const [formData, setFormData] = useState({
    name: data?.name || "",
    slug: data?.slug || "",
    display_order: data?.display_order || 0,
    category_id: selectedData?.categoryId || "",
    allow_multiple_concurrent: data?.allow_multiple_concurrent || false,
    max_concurrent_bookings: data?.max_concurrent_bookings || 1,
  });
  const [image, setImage] = useState();
  const [isUnlimited, setIsUnlimited] = useState(
    data?.max_concurrent_bookings === 1 && data?.allow_multiple_concurrent
  );

  // Validation check moved after Hooks
  if (!selectedData?.categoryId) {
    return (
      <div className="p-4 text-red-500">
        Error: Category ID is required to create/edit a subcategory.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("slug", formData.slug);
    formDataToSend.append("display_order", formData.display_order);
    formDataToSend.append("category_id", formData.category_id);
    formDataToSend.append(
      "allow_multiple_concurrent",
      formData.allow_multiple_concurrent
    );
    // If unlimited, send 1; otherwise send the actual value (must be >= 2)
    const maxConcurrentValue = isUnlimited
      ? 1
      : formData.max_concurrent_bookings;
    formDataToSend.append("max_concurrent_bookings", maxConcurrentValue);

    if (image) {
      formDataToSend.append("image", image);
    }

    try {
      if (mode === "edit" && data?.sub_category_id) {
        await serviceAPI.updateSubCategory(
          data.sub_category_id,
          formDataToSend
        );
        toast({
          title: "Success!",
          description: "SubCategory updated successfully!",
          variant: "default",
        });
      } else {
        await serviceAPI.createSubCategory(formDataToSend);
        toast({
          title: "Success!",
          description: "SubCategory created successfully!",
          variant: "default",
        });
      }
      onClose();
    } catch (error) {
      console.error("Error submitting subcategory:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to save subcategory!",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (data?.sub_category_id) {
        await serviceAPI.deleteSubCategory(data.sub_category_id);
        toast({
          title: "Success!",
          description: "Sub-Category deleted successfully!",
          variant: "default",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: "No sub-category selected for deletion!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting sub-category:", error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category!",
        variant: "destructive",
      });
    }
  };

  if (mode === "delete") {
    return (
      <div className="space-y-4">
        <p>Are you sure you want to delete this sub-category?</p>
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
        <Label htmlFor="name">SubCategory Name</Label>
        <Input
          id="name"
          placeholder="SubCategory Name"
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
        <div className="flex items-center space-x-2">
          <input
            id="allow_multiple_concurrent"
            type="checkbox"
            checked={formData.allow_multiple_concurrent}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setFormData({
                ...formData,
                allow_multiple_concurrent: isChecked,
                // Reset max_concurrent_bookings to 1 when disabled
                max_concurrent_bookings: isChecked
                  ? formData.max_concurrent_bookings
                  : 1,
              });
              // Reset unlimited state when disabling concurrent bookings
              if (!isChecked) {
                setIsUnlimited(false);
              }
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="allow_multiple_concurrent" className="cursor-pointer">
            Allow Multiple Concurrent Bookings
          </Label>
        </div>
        <p className="text-sm text-gray-500">
          Whether provider can start multiple bookings at the same time for this
          subcategory
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_concurrent_bookings">Max Concurrent Bookings</Label>

        <div className="flex items-center space-x-2 mb-2">
          <input
            id="isUnlimited"
            type="checkbox"
            checked={isUnlimited}
            onChange={(e) => {
              setIsUnlimited(e.target.checked);
              if (e.target.checked) {
                // When unlimited is checked, set to 1 (will be sent to API)
                setFormData({
                  ...formData,
                  max_concurrent_bookings: 1,
                });
              } else {
                // When unchecked, set to minimum allowed (2)
                setFormData({
                  ...formData,
                  max_concurrent_bookings: 2,
                });
              }
            }}
            disabled={!formData.allow_multiple_concurrent}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <Label
            htmlFor="isUnlimited"
            className={`cursor-pointer ${
              !formData.allow_multiple_concurrent ? "text-gray-400" : ""
            }`}
          >
            Unlimited
          </Label>
        </div>

        <Input
          id="max_concurrent_bookings"
          type="number"
          min="2"
          placeholder="Enter number (2 or more)"
          value={isUnlimited ? "" : formData.max_concurrent_bookings}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setFormData({
              ...formData,
              max_concurrent_bookings: value || 2,
            });
          }}
          disabled={!formData.allow_multiple_concurrent || isUnlimited}
          className={
            !formData.allow_multiple_concurrent || isUnlimited
              ? "bg-gray-100 cursor-not-allowed"
              : ""
          }
          required={formData.allow_multiple_concurrent && !isUnlimited}
        />
        <p className="text-sm text-gray-500">
          {isUnlimited
            ? "Unlimited concurrent bookings allowed"
            : "Enter 2 or more for specific limit (or check Unlimited)"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Sub Category Icon</Label>
        {data?.icon_url && (
          <div className="py-2">
            <div className="mb-2 relative w-32 h-24 mx-auto">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${
                  data.icon_url?.includes("/") ? data.icon_url : ""
                }`}
                alt="Current icon"
                fill
                className="object-cover rounded-md"
                sizes="128px"
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
          {mode === "edit" ? "Update" : "Create"} SubCategory
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
