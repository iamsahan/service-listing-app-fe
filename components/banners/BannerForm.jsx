import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { serviceAPI } from "@/api/services";
import { Upload, X } from "lucide-react";
import Image from "next/image";

const POSITION_OPTIONS = [
  { value: "service_page_top", label: "Service Page Top" },
  { value: "home_page_bottom", label: "Home Page Bottom" },
  { value: "category_page_middle", label: "Category Page Middle" },
  { value: "category_page_top", label: "Category Page Top" },
  { value: "user_profile_overview", label: "User Profile Overview" },
  { value: "booking_details", label: "Booking Details Page Bottom" },
  { value: "mobile_home_screen_image", label: "Mobile App Home Screen Banner" },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "customers", label: "Customers" },
  { value: "providers", label: "Service Providers" },
];

const baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;

export default function BannerFormDialog({
  open,
  onOpenChange,
  banner = null,
  onSubmit,
  isLoading = false,
}) {
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    link_url: "",
    position: "",
    category_id: "",
    subcategory_id: "",
    city_ids: [],
    audience: "all",
    is_active: true,
    display_order: 1,
    start_date: "",
    end_date: "",
  });

  const [categories, setCategories] = React.useState([]);
  const [subcategories, setSubcategories] = React.useState([]);
  const [cities, setCities] = React.useState([]);
  const [webImage, setWebImage] = React.useState(null);
  const [mobileImage, setMobileImage] = React.useState(null);
  const [webImagePreview, setWebImagePreview] = React.useState("");
  const [mobileImagePreview, setMobileImagePreview] = React.useState("");
  const [errors, setErrors] = React.useState({});

  const webImageInputRef = React.useRef(null);
  const mobileImageInputRef = React.useRef(null);

  // Fetch categories/cities
  React.useEffect(() => {
    fetchCategories();
    fetchCities();
  }, []);

  // Fetch subcategories when category changes
  React.useEffect(() => {
    if (formData.category_id) fetchSubcategories(formData.category_id);
    else setSubcategories([]);
  }, [formData.category_id]);

  // Initialize form data when editing
  React.useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        description: banner.description || "",
        link_url: banner.link_url || "",
        position: banner.position || "",
        category_id: banner.category?.category_id || "",
        subcategory_id: banner.subcategory?.sub_category_id || "",
        audience: banner.audience || "all",
        is_active: banner.is_active ?? true,
        display_order: banner.display_order || 1,
        start_date: banner.start_date ? banner.start_date.split("T")[0] : "",
        end_date: banner.end_date ? banner.end_date.split("T")[0] : "",
        city_ids: banner.cities?.map((city) => city.city_id) || [],
      });

      // Set image previews with original variants
      if (banner.image_variants?.web_image?.variants?.original) {
        setWebImagePreview(
          baseUrl + banner.image_variants.web_image.variants.original
        );
      }
      if (banner.image_variants?.mobile_image?.variants?.original) {
        setMobileImagePreview(
          baseUrl + banner.image_variants.mobile_image.variants.original
        );
      }
    } else {
      resetForm();
    }
    setErrors({});
  }, [banner, open]);

  const fetchCategories = async () => {
    try {
      const res = await serviceAPI.getAllCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await serviceAPI.getSubCategories(categoryId);
      setSubcategories(res.data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await serviceAPI.getCities();
      setCities(res.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (type, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "web") {
        setWebImage(file);
        setWebImagePreview(e.target.result);
      } else {
        setMobileImage(file);
        setMobileImagePreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);

    if (errors[`${type}_image`])
      setErrors((prev) => ({ ...prev, [`${type}_image`]: "" }));
  };

  const removeImage = (type) => {
    if (type === "web") {
      setWebImage(null);
      setWebImagePreview("");
      webImageInputRef.current && (webImageInputRef.current.value = "");
    } else {
      setMobileImage(null);
      setMobileImagePreview("");
      mobileImageInputRef.current && (mobileImageInputRef.current.value = "");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.position) newErrors.position = "Position is required";
    if (!formData.city_ids || formData.city_ids.length === 0)
      newErrors.city_ids = "Select at least one city";

    // Required date fields
    if (!formData.start_date.trim()) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date.trim()) {
      newErrors.end_date = "End date is required";
    }

    // Date validation - only if both dates are provided
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    if (formData.display_order < 1 || formData.display_order > 100) {
      newErrors.display_order = "Display order must be between 1 and 100";
    }

    if (!banner) {
      if (!webImage) newErrors.web_image = "Web image is required";
      if (!mobileImage) newErrors.mobile_image = "Mobile image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "is_active")
        submitData.append(key, formData[key] ? "1" : "0");
      else if (key === "city_ids")
        formData.city_ids.forEach((id) => submitData.append("city_ids[]", id));
      else submitData.append(key, formData[key]);
    });

    if (webImage) submitData.append("web_image", webImage);
    if (mobileImage) submitData.append("mobile_image", mobileImage);

    onSubmit(submitData, banner?.banner_id);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link_url: "",
      position: "",
      category_id: "",
      subcategory_id: "",
      city_ids: [],
      audience: "all",
      is_active: true,
      display_order: 1,
      start_date: "",
      end_date: "",
    });
    setWebImage(null);
    setMobileImage(null);
    setWebImagePreview("");
    setMobileImagePreview("");
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {banner ? "Edit Banner" : "Create New Banner"}
          </DialogTitle>
          <DialogDescription>
            {banner
              ? "Update the banner information and images."
              : "Fill in the details below to create a new promotional banner."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter banner title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => handleInputChange("link_url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
              placeholder="Enter a description"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(val) => handleInputChange("category_id", val)}
              >
                <SelectTrigger
                  className={errors.category_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                disabled={!formData.category_id}
                value={formData.subcategory_id}
                onValueChange={(val) =>
                  handleInputChange("subcategory_id", val)
                }
              >
                <SelectTrigger
                  className={errors.subcategory_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem
                      key={sub.sub_category_id}
                      value={sub.sub_category_id}
                    >
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subcategory_id && (
                <p className="text-sm text-red-500">{errors.subcategory_id}</p>
              )}
            </div>
          </div>

          {/* Multi-city selection */}
          <div className="space-y-2">
            <Label>Cities *</Label>
            <div className="border rounded p-2 max-h-48 overflow-y-auto">
              {cities.map((city) => (
                <label
                  key={city.city_id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={formData.city_ids.includes(city.city_id)}
                    onChange={(e) => {
                      const newCityIds = e.target.checked
                        ? [...formData.city_ids, city.city_id]
                        : formData.city_ids.filter((id) => id !== city.city_id);
                      handleInputChange("city_ids", newCityIds);
                    }}
                  />
                  <span>{city.name}</span>
                </label>
              ))}
            </div>
            {errors.city_ids && (
              <p className="text-sm text-red-500">{errors.city_ids}</p>
            )}
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position *</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleInputChange("position", value)}
              >
                <SelectTrigger
                  className={errors.position ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Audience *</Label>
              <Select
                value={formData.audience}
                onValueChange={(value) => handleInputChange("audience", value)}
              >
                <SelectTrigger
                  className={errors.audience ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.audience && (
                <p className="text-sm text-red-500">{errors.audience}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order *</Label>
              <Input
                id="display_order"
                type="number"
                min="1"
                max="100"
                value={formData.display_order}
                onChange={(e) =>
                  handleInputChange(
                    "display_order",
                    parseInt(e.target.value) || 1
                  )
                }
                className={errors.display_order ? "border-red-500" : ""}
              />
              {errors.display_order && (
                <p className="text-sm text-red-500">{errors.display_order}</p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  handleInputChange("start_date", e.target.value)
                }
                className={errors.start_date ? "border-red-500" : ""}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                className={errors.end_date ? "border-red-500" : ""}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                handleInputChange("is_active", checked)
              }
            />
            <Label htmlFor="is_active">Active Banner</Label>
          </div>

          {/* Image Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Banner Images</h3>
            {/* Desktop Image (for web screens) */}
            <div className="space-y-2">
              <Label>Desktop Image {!banner && "*"}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {webImagePreview ? (
                  <div className="relative">
                    {webImage?.type === "image/svg+xml" ? (
                      <img
                        src={webImagePreview}
                        alt="Desktop banner preview (SVG)"
                        className="w-full h-40 object-contain rounded bg-white"
                      />
                    ) : (
                      <Image
                        src={webImagePreview}
                        alt="Desktop banner preview"
                        className="w-full h-40 object-cover rounded"
                        width={3200}
                        height={1000}
                      />
                    )}

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage("web")}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => webImageInputRef.current?.click()}
                      >
                        Choose Desktop Image
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.position === "service_page_top" &&
                        "Recommended: 2400×1000px, JPG/PNG/WebP, max 5MB"}
                      {formData.position === "category_page_top" &&
                        "Recommended: 3200×800px, JPG/PNG/WebP, max 5MB"}
                      {formData.position === "category_page_middle" &&
                        "Recommended: 3200×800px, JPG/PNG/WebP, max 5MB"}
                      {formData.position === "booking_details" &&
                        "Recommended: 2500×1000px, JPG/PNG/WebP, max 5MB"}
                      {![
                        "service_page_top",
                        "category_page_top",
                        "category_page_middle",
                        "booking_details",
                      ].includes(formData.position) &&
                        "Recommended: 3200×800px, JPG/PNG/WebP, max 5MB"}
                    </p>
                  </div>
                )}
                <input
                  ref={webImageInputRef}
                  type="file"
                  accept="image/*,image/svg+xml"
                  onChange={(e) => handleImageChange("web", e.target.files[0])}
                  className="hidden"
                />
              </div>
              {errors.web_image && (
                <p className="text-sm text-red-500">{errors.web_image}</p>
              )}
            </div>

            {/* Mobile Image (for mobile & mobile web) */}
            <div className="space-y-2">
              <Label>Mobile Image {!banner && "*"}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {mobileImagePreview ? (
                  <div className="relative">
                    {mobileImage?.type === "image/svg+xml" ? (
                      <img
                        src={mobileImagePreview}
                        alt="Mobile banner preview (SVG)"
                        className="w-full h-32 object-contain rounded bg-white"
                      />
                    ) : (
                      <Image
                        src={mobileImagePreview}
                        alt="Mobile banner preview"
                        className="w-full h-32 object-cover rounded"
                        width={1080}
                        height={600}
                      />
                    )}

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage("mobile")}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => mobileImageInputRef.current?.click()}
                      >
                        Choose Mobile Image
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.position === "service_page_top" &&
                        "Recommended: 900×500px, JPG/PNG/WebP, max 3MB"}
                      {formData.position === "category_page_top" &&
                        "Recommended: 900×600px, JPG/PNG/WebP, max 3MB"}
                      {formData.position === "category_page_middle" &&
                        "Recommended: 900×600px, JPG/PNG/WebP, max 3MB"}
                      {formData.position === "booking_details" &&
                        "Recommended: 900×600px, JPG/PNG/WebP, max 3MB"}
                      {![
                        "service_page_top",
                        "category_page_top",
                        "category_page_middle",
                        "booking_details",
                      ].includes(formData.position) &&
                        "Recommended: 900×600px, JPG/PNG/WebP, max 3MB"}
                    </p>
                  </div>
                )}
                <input
                  ref={mobileImageInputRef}
                  type="file"
                  accept="image/*,image/svg+xml"
                  onChange={(e) =>
                    handleImageChange("mobile", e.target.files[0])
                  }
                  className="hidden"
                />
              </div>
              {errors.mobile_image && (
                <p className="text-sm text-red-500">{errors.mobile_image}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : banner
              ? "Update Banner"
              : "Create Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
