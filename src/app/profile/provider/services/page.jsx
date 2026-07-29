"use client";
import React, { useState, useEffect } from "react";
import { providerAPI } from "@/api/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@hooks/use-toast";
import { Package, ShoppingBag, Loader2, Save } from "lucide-react";
import Image from "next/image";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceData, setServiceData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedPackages, setSelectedPackages] = useState(new Set());
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    setProvider(user);

    if (user) {
      fetchProviderServices();
    }
  }, []);

  const fetchProviderServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await providerAPI.getMyServiceCategories();

      console.log("Full API Response:", response);
      console.log("Response Data:", response.data);

      // Check if response.data is an array or if the actual data is nested
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      console.log("Processed Data:", data);

      setServiceData(data);

      // Initialize selected items and packages from subscribed data
      const items = new Set();
      const packages = new Set();

      data.forEach((category) => {
        category.subscribed_services?.items?.forEach((item) => {
          items.add(item.item_id);
        });
        category.subscribed_services?.packages?.forEach((pkg) => {
          packages.add(pkg.package_id);
        });
      });

      setSelectedItems(items);
      setSelectedPackages(packages);
    } catch (err) {
      console.error("Error fetching provider services:", err);
      setError("Failed to load services");
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId, categoryId, serviceId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handlePackageToggle = (packageId) => {
    setSelectedPackages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!provider?.providerId) {
      toast({
        title: "Error",
        description: "Provider ID not found",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const selectionData = [];

      // Process selected items
      serviceData.forEach((category) => {
        category.available_services?.subcategories?.forEach((subCategory) => {
          subCategory.service_types?.forEach((serviceType) => {
            serviceType.services?.forEach((service) => {
              service.items?.forEach((item) => {
                if (selectedItems.has(item.item_id)) {
                  selectionData.push({
                    providerId: provider.providerId,
                    categoryId: category.category_id,
                    serviceId: service.service_id,
                    itemId: item.item_id,
                    experience_years: 0,
                    is_primary: false,
                    price_adjustment: null,
                    status: "active",
                    packageId: null,
                  });
                }
              });
            });

            // Process selected packages
            serviceType.packages?.forEach((pkg) => {
              if (selectedPackages.has(pkg.package_id)) {
                selectionData.push({
                  providerId: provider.providerId,
                  categoryId: category.category_id,
                  serviceId: null,
                  itemId: null,
                  experience_years: 0,
                  is_primary: false,
                  price_adjustment: null,
                  status: "active",
                  packageId: pkg.package_id,
                });
              }
            });
          });
        });
      });

      // If no items or packages are selected, send a default entry with null serviceId and itemId
      if (selectionData.length === 0 && serviceData.length > 0) {
        const firstCategory = serviceData[0];
        selectionData.push({
          providerId: provider.providerId,
          categoryId: firstCategory.category_id,
          serviceId: null,
          itemId: null,
          experience_years: 0,
          is_primary: false,
          price_adjustment: null,
          status: "active",
          packageId: null,
        });
      }

      await providerAPI.updateProviderCategory(provider.providerId, {
        selections: selectionData,
      });

      toast({
        title: "Success!",
        description: "Services updated successfully!",
        variant: "default",
      });

      // Refresh data
      await fetchProviderServices();
    } catch (error) {
      console.error("Error updating services:", error);
      toast({
        title: "Error",
        description: "Failed to update services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (path) => {
    return path && path.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`
      : null;
  };

  const renderServiceItems = (services, categoryId) => {
    if (!services || services.length === 0) return null;

    return services.map((service) => (
      <div
        key={service.service_id}
        className="mb-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Service Header */}
        <div className="flex items-center gap-3 mb-4">
          {service.service_icon && (
            <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src={getImageUrl(service.service_icon)}
                alt={service.service_name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h5 className="font-bold text-base text-gray-900">
              {service.service_name}
            </h5>
            {service.description && (
              <p className="text-xs text-gray-600 mt-1">
                {service.description}
              </p>
            )}
          </div>
        </div>

        {/* Service Items */}
        {service.items && service.items.length > 0 && (
          <div className="space-y-2">
            {service.items.map((item) => (
              <div
                key={item.item_id}
                className={`group relative flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedItems.has(item.item_id)
                    ? "bg-green-50 border-green-400 shadow-md"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
                onClick={() =>
                  handleItemToggle(item.item_id, categoryId, service.service_id)
                }
              >
                <div className="flex items-center gap-3 flex-1">
                  {item.icon_url && (
                    <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={getImageUrl(item.icon_url)}
                        alt={item.item_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        selectedItems.has(item.item_id)
                          ? "text-green-900"
                          : "text-gray-900"
                      }`}
                    >
                      {item.item_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.base_duration_minutes && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.base_duration_minutes} mins
                        </span>
                      )}
                      {item.is_featured && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-100 text-yellow-800"
                        >
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Checkbox
                  checked={selectedItems.has(item.item_id)}
                  onCheckedChange={(checked) =>
                    handleItemToggle(
                      item.item_id,
                      categoryId,
                      service.service_id
                    )
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 w-5 h-5"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  const renderPackages = (packages, categoryId) => {
    if (!packages || packages.length === 0) return null;

    return (
      <div className="space-y-3">
        {packages.map((pkg) => (
          <div
            key={pkg.package_id}
            className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedPackages.has(pkg.package_id)
                ? "bg-purple-50 border-purple-400 shadow-md"
                : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm"
            }`}
            onClick={() => handlePackageToggle(pkg.package_id)}
          >
            {/* Package Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                {pkg.package_icon && (
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <Image
                      src={getImageUrl(pkg.package_icon)}
                      alt={pkg.package_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${
                      selectedPackages.has(pkg.package_id)
                        ? "text-purple-900"
                        : "text-gray-900"
                    }`}
                  >
                    {pkg.package_name}
                  </p>
                  {pkg.total_price && (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      ₹{pkg.total_price}
                    </p>
                  )}
                </div>
              </div>
              <Checkbox
                checked={selectedPackages.has(pkg.package_id)}
                onCheckedChange={(checked) =>
                  handlePackageToggle(pkg.package_id)
                }
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 w-5 h-5"
              />
            </div>

            {/* Package Description */}
            {pkg.description && (
              <p className="text-xs text-gray-600 mb-3 pl-1">
                {pkg.description}
              </p>
            )}

            {/* Package Sections */}
            {pkg.sections && pkg.sections.length > 0 && (
              <div className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Package Includes:
                </p>
                {pkg.sections.map((section) => (
                  <details
                    key={section.section_id}
                    className="text-xs group/details"
                  >
                    <summary className="cursor-pointer font-medium text-gray-800 hover:text-purple-700 list-none flex items-center gap-2 p-2 rounded hover:bg-purple-50 transition-colors">
                      <span className="group-open/details:rotate-90 transition-transform">
                        ▶
                      </span>
                      <span>{section.section_name}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {section.items?.length || 0}{" "}
                        {section.items?.length === 1 ? "item" : "items"}
                      </Badge>
                    </summary>
                    <div className="ml-6 mt-2 space-y-1.5 pl-2 border-l-2 border-purple-200">
                      {section.items?.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex justify-between items-center text-gray-700 p-2 bg-white rounded hover:bg-purple-50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                            {item.item_name}{" "}
                            <span className="text-gray-500">
                              x{item.quantity}
                            </span>
                          </span>
                          {item.unit_price && (
                            <span className="font-medium text-green-600">
                              ₹{item.unit_price}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <span className="ml-3 text-gray-600 mt-4 block">
            Loading services...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProviderServices} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ShoppingBag className="h-7 w-7 text-white" />
                </div>
                Configure Your Services
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Select the services and packages you want to offer to your
                customers
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge
                variant="outline"
                className="text-base px-4 py-2.5 bg-green-50 border-green-300 text-green-700 font-semibold"
              >
                {selectedItems.size} Items Selected
              </Badge>
              <Badge
                variant="outline"
                className="text-base px-4 py-2.5 bg-purple-50 border-purple-300 text-purple-700 font-semibold"
              >
                {selectedPackages.size} Packages Selected
              </Badge>
            </div>
          </div>
        </div>

        {serviceData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">
              No service categories available
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please contact support to set up your services
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {serviceData.map((category) => (
              <Card
                key={category.category_id}
                className="overflow-hidden shadow border border-gray-200 bg-white"
              >
                <CardHeader className="pb-4 bg-black text-white">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span className="font-bold">{category.category_name}</span>
                    <div className="flex gap-2">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {category.subscribed_services?.items?.length || 0} Items
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {category.subscribed_services?.packages?.length || 0}{" "}
                        Packages
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {category.available_services?.subcategories?.length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-3">
                      {category.available_services.subcategories.map(
                        (subCategory) => (
                          <AccordionItem
                            key={subCategory.sub_category_id}
                            value={subCategory.sub_category_id}
                            className="border rounded-lg overflow-hidden bg-white"
                          >
                            <AccordionTrigger className="hover:no-underline  bg-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                                  <ShoppingBag className="h-4 w-4" />
                                </div>
                                <span className="font-semibold  text-gray-900">
                                  {subCategory.sub_category_name}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              {subCategory.service_types?.map((serviceType) => (
                                <div
                                  key={serviceType.service_type_id}
                                  className="mt-4"
                                >
                                  <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                    <h3 className="font-bold text-base text-gray-800">
                                      {serviceType.service_type_name}
                                    </h3>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Side - Services */}
                                    <div>
                                      {serviceType.services &&
                                        serviceType.services.length > 0 && (
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <div className="bg-blue-100 p-1.5 rounded-lg">
                                                <ShoppingBag className="h-4 w-4 text-blue-600" />
                                              </div>
                                              <h4 className="text-sm font-bold text-gray-800">
                                                Available Services
                                              </h4>
                                            </div>
                                            {renderServiceItems(
                                              serviceType.services,
                                              category.category_id
                                            )}
                                          </div>
                                        )}
                                    </div>

                                    {/* Right Side - Packages */}
                                    <div>
                                      {serviceType.packages &&
                                        serviceType.packages.length > 0 && (
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <div className="bg-purple-100 p-1.5 rounded-lg">
                                                <Package className="h-4 w-4 text-purple-600" />
                                              </div>
                                              <h4 className="text-sm font-bold text-gray-800">
                                                Available Packages
                                              </h4>
                                            </div>
                                            {renderPackages(
                                              serviceType.packages,
                                              category.category_id
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                      No services available in this category
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Save Button */}
        <div className="fixed bottom-10 right-10 z-50">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            size="lg"
            className="shadow-2xl bg-black hover:bg-gray-800 text-white font-bold px-8 py-6 text-base rounded-lg transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-6 w-6 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
