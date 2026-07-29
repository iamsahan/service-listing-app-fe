"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { providerAPI } from "@/api/provider";
import { Package, ShoppingBag, Loader2, Save } from "lucide-react";
import Image from "next/image";
import { toast } from "@hooks/use-toast";

const ProviderServicesDialog = ({ open, onOpenChange, providerId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serviceData, setServiceData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedPackages, setSelectedPackages] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && providerId) {
      fetchProviderServices();
    }
  }, [open, providerId]);

  const fetchProviderServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await providerAPI.getProviderServiceCategories(
        providerId
      );
      const data = response.data.data || [];
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
      setError("Failed to load provider services");
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
    if (!providerId) {
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
                    providerId: providerId,
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
                  providerId: providerId,
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
          providerId: providerId,
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

      await providerAPI.updateProviderCategory(providerId, {
        selections: selectionData,
      });

      toast({
        title: "Success!",
        description: "Provider services updated successfully!",
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

  const renderServiceItems = (services, categoryId) => {
    if (!services || services.length === 0) return null;

    return services.map((service) => (
      <div key={service.service_id} className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {service.service_icon && (
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${service.service_icon}`}
                alt={service.service_name}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
          <div className="flex-1">
            <h5 className="font-semibold text-sm">{service.service_name}</h5>
            {service.description && (
              <p className="text-xs text-gray-600">{service.description}</p>
            )}
          </div>
        </div>

        {service.items && service.items.length > 0 && (
          <div className="ml-6 space-y-2">
            <p className="text-xs font-medium text-gray-700">Service Items:</p>
            <div className="grid grid-cols-1 gap-2">
              {service.items.map((item) => (
                <div
                  key={item.item_id}
                  className={`flex items-center justify-between p-2 border rounded-lg transition-colors cursor-pointer ${
                    selectedItems.has(item.item_id)
                      ? "bg-green-50 border-green-400"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() =>
                    handleItemToggle(
                      item.item_id,
                      categoryId,
                      service.service_id
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    {item.icon_url && (
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${item.icon_url}`}
                          alt={item.item_name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.item_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {item.base_duration_minutes && (
                          <span>{item.base_duration_minutes} mins</span>
                        )}
                        {item.is_featured && (
                          <Badge variant="secondary" className="text-xs">
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
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ));
  };

  const renderPackages = (packages, categoryId) => {
    if (!packages || packages.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Packages:
        </p>
        <div className="grid grid-cols-1 gap-2">
          {packages.map((pkg) => (
            <div
              key={pkg.package_id}
              className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                selectedPackages.has(pkg.package_id)
                  ? "bg-purple-50 border-purple-400"
                  : "bg-white border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => handlePackageToggle(pkg.package_id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {pkg.package_icon && (
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${pkg.package_icon}`}
                        alt={pkg.package_name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{pkg.package_name}</p>
                    {pkg.total_price && (
                      <p className="text-xs text-green-600 font-medium">
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
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
              </div>
              {pkg.description && (
                <p className="text-xs text-gray-600 mb-2">{pkg.description}</p>
              )}
              {pkg.sections && pkg.sections.length > 0 && (
                <div className="mt-2 space-y-1">
                  {pkg.sections.map((section) => (
                    <details key={section.section_id} className="text-xs">
                      <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                        {section.section_name} ({section.items?.length || 0}{" "}
                        items)
                      </summary>
                      <div className="ml-4 mt-1 space-y-1">
                        {section.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-gray-600"
                          >
                            <span>
                              {item.item_name} x{item.quantity}
                            </span>
                            {item.unit_price && <span>₹{item.unit_price}</span>}
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
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[50vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Provider Services & Subscriptions
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading services...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={fetchProviderServices}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : serviceData.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No service subscriptions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedItems.size}</span>{" "}
                  items and{" "}
                  <span className="font-semibold">{selectedPackages.size}</span>{" "}
                  packages selected
                </div>
              </div>

              {serviceData.map((category) => (
                <Card key={category.category_id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {category.category_name}
                      <Badge variant="outline" className="ml-auto">
                        {category.subscribed_services?.items?.length || 0}{" "}
                        Items,{" "}
                        {category.subscribed_services?.packages?.length || 0}{" "}
                        Packages
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category.available_services?.subcategories?.length > 0 ? (
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-2"
                      >
                        {category.available_services.subcategories.map(
                          (subCategory) => (
                            <AccordionItem
                              key={subCategory.sub_category_id}
                              value={subCategory.sub_category_id}
                            >
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {subCategory.sub_category_name}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {subCategory.service_types?.length || 0}{" "}
                                    Types
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                {subCategory.service_types?.map(
                                  (serviceType) => (
                                    <div
                                      key={serviceType.service_type_id}
                                      className="ml-4 mt-3 space-y-4"
                                    >
                                      <div className="font-medium text-sm text-gray-700 border-b pb-2">
                                        {serviceType.service_type_name}
                                      </div>

                                      {serviceType.services &&
                                        serviceType.services.length > 0 && (
                                          <div className="space-y-4">
                                            {renderServiceItems(
                                              serviceType.services,
                                              category.category_id
                                            )}
                                          </div>
                                        )}

                                      {serviceType.packages &&
                                        serviceType.packages.length > 0 && (
                                          <div className="mt-4">
                                            {renderPackages(
                                              serviceType.packages,
                                              category.category_id
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  )
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          )
                        )}
                      </Accordion>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No services available in this category
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-black hover:bg-gray-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProviderServicesDialog;
