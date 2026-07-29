"use client";

import React from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  User,
  ExternalLink,
} from "lucide-react";
import BannerFormDialog from "@/components/banners/BannerForm";
import { bannerAPI } from "@/api/bannerService";
import Image from "next/image";

export default function BannersManagement() {
  const [banners, setBanners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerAPI.getBanners();
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = () => {
    setShowForm(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await bannerAPI.deleteBanner(bannerId);
        setBanners(banners.filter((banner) => banner.banner_id !== bannerId));
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  const handleToggleStatus = async (bannerId) => {
    try {
      // await bannerAPI.toggleBanner(bannerId);
      setBanners(
        banners.map((banner) =>
          banner.banner_id === bannerId
            ? { ...banner, is_active: !banner.is_active }
            : banner
        )
      );
    } catch (error) {
      console.error("Error toggling banner status:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) return "bg-gray-100 text-gray-600";
    if (now < start) return "bg-yellow-100 text-yellow-700";
    if (now > end) return "bg-red-100 text-red-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusText = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) return "Inactive";
    if (now < start) return "Scheduled";
    if (now > end) return "Expired";
    return "Active";
  };

  const handleSubmit = async (formData, bannerId) => {
    setIsSubmitting(true);
    try {
      if (bannerId) {
        // Update existing banner
        await bannerAPI.updateBanner(bannerId, formData);
      } else {
        // Create new banner
        await bannerAPI.createBanner(formData);
      }

      setShowForm(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (segment) => {
    return segment ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${segment}` : "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Banner Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and organize your promotional banners
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Add Banner
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-6">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-600 font-semibold">
                  {banners.length}
                </span>
                <span className="text-blue-700 ml-1">Total Banners</span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-green-600 font-semibold">
                  {banners.filter((b) => b.is_active).length}
                </span>
                <span className="text-green-700 ml-1">Active</span>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-lg">
                <span className="text-red-600 font-semibold">
                  {banners.filter((b) => !b.is_active).length}
                </span>
                <span className="text-red-700 ml-1">Inactive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {banners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No banners found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first banner
              </p>
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors duration-200"
              >
                <Plus size={20} />
                Create Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.banner_id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group border border-gray-100"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={getImageUrl(
                        banner.image_variants?.web?.medium || banner.image_url
                      )}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      fill
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          banner.is_active,
                          banner.start_date,
                          banner.end_date
                        )}`}
                      >
                        {getStatusText(
                          banner.is_active,
                          banner.start_date,
                          banner.end_date
                        )}
                      </span>
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(banner.banner_id)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-colors duration-200"
                        title={banner.is_active ? "Deactivate" : "Activate"}
                      >
                        {banner.is_active ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(banner)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-colors duration-200"
                        title="Edit Banner"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.banner_id)}
                        className="bg-white/20 hover:bg-red-500/50 backdrop-blur-sm text-white p-2 rounded-lg transition-colors duration-200"
                        title="Delete Banner"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {banner.title}
                      </h3>
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                          title="Open link"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {banner.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={14} />
                        <span>{banner.city?.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {banner.position.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>

                      {banner.start_date && banner.end_date ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={14} />
                          <span>
                            {formatDate(banner.start_date)} -{" "}
                            {formatDate(banner.end_date)}
                          </span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-2 text-gray-500">
                        <User size={14} />
                        <span>{banner.creator?.name}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg font-medium transition-colors duration-200 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(banner.banner_id)}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors duration-200 text-sm ${
                          banner.is_active
                            ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                            : "bg-green-50 hover:bg-green-100 text-green-700"
                        }`}
                      >
                        {banner.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(banner.banner_id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg font-medium transition-colors duration-200 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BannerFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        banner={editingBanner}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </>
  );
}
