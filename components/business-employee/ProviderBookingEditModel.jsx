"use client";
import React, { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { serviceAPI } from "@/api/services";
import { providerAPI } from "@/api/provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "../ui/label";
import { io } from "socket.io-client";

const ProviderBookingEditModel = ({ booking, onConfirm, onClose }) => {
  const [category, setCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [preCheckedItems, setPreCheckedItems] = useState(new Set());
  const [itemQuantities, setItemQuantities] = useState(new Map());
  const [step, setStep] = useState("edit");
  const [otp, setOtp] = useState("");
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItems, setCustomItems] = useState([]);
  const [socket, setSocket] = useState(null);

  console.log(booking);
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (booking) {
          const categoryId =
            booking?.subCategory?.ServiceCategory?.category_id ||
            booking.itemHierarchicalRel[0].categoryId;
          const cityId = booking?.city_id;
          if (categoryId) {
            const response = await serviceAPI.getCategoryById(
              categoryId,
              cityId
            );
            setCategory(response.data);

            if (booking?.BookingItems?.length > 0) {
              const preCheckedSet = new Set(
                booking.BookingItems.map((item) => item.item_id)
              );
              setPreCheckedItems(preCheckedSet);
              setSelectedItems(new Set());

              const initialQuantities = new Map();
              booking.BookingItems.forEach((item) => {
                initialQuantities.set(item.item_id, item.quantity || 1);
              });
              setItemQuantities(initialQuantities);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
    fetchCategory();
  }, [booking]);

  useEffect(() => {
    if (booking) {
      setStep("edit");
      setOtp("");
      setSelectedItems(new Set());
      setCustomItems([]);
      setShowCustomItemForm(false);
      setCustomItemName("");
      setCustomItemPrice("");
    }
  }, [booking]);

  const handleItemToggle = (item) => {
    if (preCheckedItems.has(item.item_id)) {
      return;
    }

    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(item)) {
        newSelected.delete(item);
        setItemQuantities((prev) => {
          const newQuantities = new Map(prev);
          newQuantities.delete(item.item_id);
          return newQuantities;
        });
      } else {
        newSelected.add(item);
        setItemQuantities((prev) => {
          const newQuantities = new Map(prev);
          newQuantities.set(item.item_id, 1);
          return newQuantities;
        });
      }
      return newSelected;
    });
  };

  const handleQuantityChange = (itemId, quantity) => {
    const numQuantity = parseInt(quantity) || 1;

    let minQuantity = 1;
    if (preCheckedItems.has(itemId)) {
      const originalItem = booking?.BookingItems?.find(
        (item) => item.item_id === itemId
      );
      minQuantity = originalItem?.quantity || 1;
    }

    setItemQuantities((prev) => {
      const newQuantities = new Map(prev);
      newQuantities.set(itemId, Math.max(minQuantity, numQuantity));
      return newQuantities;
    });
  };

  const findItemFromCategory = (itemId) => {
    if (!category) return null;

    for (const subCategory of category.SubCategories || []) {
      for (const serviceType of subCategory.ServiceTypes || []) {
        for (const service of serviceType.Services || []) {
          for (const item of service.ServiceItems || []) {
            if (item.item_id === itemId) {
              return item;
            }
          }
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
      {
        path: "/socket.io/",
        withCredentials: true,
        transports: ["websocket", "polling"],
      }
    );

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const handleAddCustomItem = () => {
    if (customItemName && customItemPrice) {
      const newItem = {
        item_id: `custom-${Date.now()}`,
        name: customItemName,
        base_price: parseFloat(customItemPrice),
        isCustom: true,
      };

      setCustomItems([...customItems, newItem]);
      setSelectedItems(new Set([...selectedItems, newItem]));
      setItemQuantities((prev) => {
        const newQuantities = new Map(prev);
        newQuantities.set(newItem.item_id, 1);
        return newQuantities;
      });
      setCustomItemName("");
      setCustomItemPrice("");
      setShowCustomItemForm(false);
    }
  };

  const handleConfirmEdit = async () => {
    try {
      const newlySelectedItems = Array.from(selectedItems);

      const updatedExistingItems = [];
      preCheckedItems.forEach((itemId) => {
        const currentQuantity = itemQuantities.get(itemId) || 1;
        const originalItem = booking?.BookingItems?.find(
          (item) => item.item_id === itemId
        );
        const originalQuantity = originalItem?.quantity || 1;

        if (currentQuantity > originalQuantity) {
          const itemObj = findItemFromCategory(itemId);
          if (itemObj) {
            updatedExistingItems.push({
              item_id: itemId,
              name: itemObj.name,
              base_price: itemObj.base_price,
              special_pricing: itemObj.SpecialPricing || null,
              city_specific_pricing: itemObj.CitySpecificPr || null,
              quantity: currentQuantity - originalQuantity,
            });
          }
        }
      });

      const allAddOns = [
        ...newlySelectedItems.map((item) => ({
          item_id: item.item_id,
          name: item.name,
          base_price: item.base_price,
          special_pricing: item.SpecialPricing || null,
          city_specific_pricing: item.CitySpecificPr || null,
          quantity: itemQuantities.get(item.item_id) || 1,
          is_custom: item.isCustom,
        })),
        ...updatedExistingItems,
      ];

      await providerAPI.sendBookingEditOtp({
        mobile: booking?.customer?.mobile,
        bookingId: booking?.booking_id,
        userId: booking?.user_id,
        addOns: allAddOns,
      });
      setStep("otp");

      if (socket) {
        socket.emit("join-booking", booking.user_id);
      }
    } catch (error) {
      console.error("Error sending OTP", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const newlySelectedItems = Array.from(selectedItems);

      const updatedExistingItems = [];
      preCheckedItems.forEach((itemId) => {
        const currentQuantity = itemQuantities.get(itemId) || 1;
        const originalItem = booking?.BookingItems?.find(
          (item) => item.item_id === itemId
        );
        const originalQuantity = originalItem?.quantity || 1;

        if (currentQuantity > originalQuantity) {
          const itemObj = findItemFromCategory(itemId);
          if (itemObj) {
            updatedExistingItems.push({
              item_id: itemId,
              name: itemObj.name,
              base_price: itemObj.base_price,
              special_pricing: itemObj.SpecialPricing || null,
              city_specific_pricing: itemObj.CitySpecificPr || null,
              quantity: currentQuantity - originalQuantity,
            });
          }
        }
      });

      const allAddOns = [
        ...newlySelectedItems.map((item) => ({
          item_id: item.item_id,
          name: item.name,
          base_price: item.base_price,
          special_pricing: item.SpecialPricing || null,
          city_specific_pricing: item.CitySpecificPr || null,
          quantity: itemQuantities.get(item.item_id) || 1,
          is_custom: item.isCustom,
        })),
        ...updatedExistingItems,
      ];

      await providerAPI.bookingEditVerify({
        bookingId: booking?.booking_id,
        addOns: allAddOns,
        otp,
      });
      setStep("success");
    } catch (error) {
      console.error("Error verifying OTP", error);
    }
  };

  return (
    <DialogContent className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-6xl p-4 sm:p-8 lg:p-12 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200">
      <DialogHeader className="pb-4 border-b border-gray-200 mb-4">
        <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
          Add New Service Items
        </DialogTitle>
      </DialogHeader>

      <AnimatePresence mode="wait">
        {step === "edit" && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6 lg:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              {category ? (
                <div className="py-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                    Category
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {category.category_id}: {category.name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Loading category...</p>
              )}

              <Button
                onClick={() => setShowCustomItemForm(!showCustomItemForm)}
                className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
              >
                {showCustomItemForm ? "Cancel" : "Add Custom Item"}
              </Button>
            </div>

            {showCustomItemForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 mb-4">
                  <div>
                    <Label htmlFor="customItemName" className="text-sm">
                      Item Name
                    </Label>
                    <Input
                      id="customItemName"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      placeholder="Enter custom item name"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customItemPrice" className="text-sm">
                      Price
                    </Label>
                    <Input
                      id="customItemPrice"
                      type="number"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      placeholder="Enter price"
                      className="text-sm"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddCustomItem}
                  disabled={!customItemName || !customItemPrice}
                  className="w-full text-sm"
                >
                  Add Item
                </Button>
              </motion.div>
            )}

            {customItems.length > 0 && (
              <div className="p-3 sm:p-4 lg:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></span>
                  Custom Items
                </h3>
                <div className="space-y-3">
                  {customItems.map((item) => (
                    <div
                      key={item.item_id}
                      className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedItems.has(item)}
                          onCheckedChange={() => handleItemToggle(item)}
                          className="cursor-pointer mt-1 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                              {item.name}
                            </h4>
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium whitespace-nowrap">
                              Custom
                            </span>
                          </div>

                          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 inline-block mt-2">
                            ₹{item.base_price}
                          </span>
                        </div>
                      </div>

                      {selectedItems.has(item) && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-8 sm:pl-0">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                              Qty:
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-sm"
                                onClick={() => {
                                  const currentQty =
                                    itemQuantities.get(item.item_id) || 1;
                                  if (currentQty > 1) {
                                    handleQuantityChange(
                                      item.item_id,
                                      currentQty - 1
                                    );
                                  }
                                }}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={itemQuantities.get(item.item_id) || 1}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.item_id,
                                    e.target.value
                                  )
                                }
                                className="w-16 sm:w-20 h-7 sm:h-8 text-center font-semibold text-sm"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-sm"
                                onClick={() => {
                                  const currentQty =
                                    itemQuantities.get(item.item_id) || 1;
                                  handleQuantityChange(
                                    item.item_id,
                                    currentQty + 1
                                  );
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500">Total:</p>
                            <p className="text-base sm:text-lg font-bold text-blue-600">
                              ₹
                              {(
                                item.base_price *
                                (itemQuantities.get(item.item_id) || 1)
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {category?.SubCategories?.map((sub) => (
              <div
                key={sub.sub_category_id}
                className="p-3 sm:p-4 bg-gray-100 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3">
                  {sub.name}
                </p>
                {sub.ServiceTypes?.map((type) => (
                  <div
                    key={type.type_id}
                    className="p-3 sm:p-4 bg-white rounded-lg shadow-md border border-gray-300 hover:shadow-lg transition-shadow mt-2"
                  >
                    <p className="text-sm sm:text-base font-medium text-gray-700 mb-3">
                      {type.name}
                    </p>
                    {type.Services?.map((service) => (
                      <div key={service.service_id} className="mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm font-medium text-white p-2 rounded-md bg-black mb-3 sm:mb-4">
                          {service.name}
                        </p>
                        {service.ServiceItems?.map((item) => (
                          <div
                            key={item.item_id}
                            className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 mb-3"
                          >
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={
                                  selectedItems.has(item) ||
                                  preCheckedItems.has(item.item_id)
                                }
                                onCheckedChange={() => handleItemToggle(item)}
                                disabled={preCheckedItems.has(item.item_id)}
                                className="cursor-pointer mt-1 flex-shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start gap-2">
                                  <h4
                                    className={`font-semibold text-sm sm:text-base text-gray-900 leading-snug break-words ${
                                      preCheckedItems.has(item.item_id)
                                        ? "opacity-60"
                                        : ""
                                    }`}
                                  >
                                    {item.name}
                                  </h4>
                                  {preCheckedItems.has(item.item_id) && (
                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap">
                                      In booking
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {item.SpecialPricing ||
                                  item.CitySpecificPr ? (
                                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                                      ₹
                                      {item.SpecialPricing ||
                                        item.CitySpecificPr}
                                    </span>
                                  ) : (
                                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                      ₹{item.base_price}
                                    </span>
                                  )}

                                  {(item.duration_hours > 0 ||
                                    item.duration_minut > 0) && (
                                    <div className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                                      <svg
                                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-1.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      <span className="text-xs sm:text-sm font-semibold text-blue-800 tracking-wide">
                                        {item.duration_hours > 0 && (
                                          <span className="text-blue-900">
                                            {item.duration_hours}
                                            <span className="text-xs text-blue-600 ml-0.5">
                                              hr
                                            </span>
                                          </span>
                                        )}
                                        {item.duration_hours > 0 &&
                                          item.duration_minut > 0 && (
                                            <span className="mx-1 text-blue-400">
                                              •
                                            </span>
                                          )}
                                        {item.duration_minut > 0 && (
                                          <span className="text-blue-900">
                                            {item.duration_minut}
                                            <span className="text-xs text-blue-600 ml-0.5">
                                              min
                                            </span>
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {(selectedItems.has(item) ||
                              preCheckedItems.has(item.item_id)) && (
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-8 sm:pl-0">
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`qty-${item.item_id}`}
                                    className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap"
                                  >
                                    Qty:
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-sm"
                                      onClick={() => {
                                        const currentQty =
                                          itemQuantities.get(item.item_id) || 1;
                                        const minQty = preCheckedItems.has(
                                          item.item_id
                                        )
                                          ? booking?.BookingItems?.find(
                                              (bookingItem) =>
                                                bookingItem.item_id ===
                                                item.item_id
                                            )?.quantity || 1
                                          : 1;
                                        if (currentQty > minQty) {
                                          handleQuantityChange(
                                            item.item_id,
                                            currentQty - 1
                                          );
                                        }
                                      }}
                                    >
                                      -
                                    </Button>
                                    <Input
                                      id={`qty-${item.item_id}`}
                                      type="number"
                                      min={
                                        preCheckedItems.has(item.item_id)
                                          ? booking?.BookingItems?.find(
                                              (bookingItem) =>
                                                bookingItem.item_id ===
                                                item.item_id
                                            )?.quantity || 1
                                          : 1
                                      }
                                      value={
                                        itemQuantities.get(item.item_id) || 1
                                      }
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          item.item_id,
                                          e.target.value
                                        )
                                      }
                                      className="w-16 sm:w-20 h-7 sm:h-8 text-center font-semibold text-sm"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-sm"
                                      onClick={() => {
                                        const currentQty =
                                          itemQuantities.get(item.item_id) || 1;
                                        handleQuantityChange(
                                          item.item_id,
                                          currentQty + 1
                                        );
                                      }}
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>

                                <div className="text-left sm:text-right">
                                  <p className="text-xs text-gray-500">
                                    Total:
                                  </p>
                                  <p className="text-base sm:text-lg font-bold text-blue-600">
                                    ₹
                                    {(
                                      (item.SpecialPricing ||
                                        item.CitySpecificPr ||
                                        item.base_price) *
                                      (itemQuantities.get(item.item_id) || 1)
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            <Button
              className="w-full py-3 text-sm sm:text-base rounded-lg hover:bg-gray-700 hover:shadow-lg transition"
              onClick={handleConfirmEdit}
            >
              Confirm
            </Button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
              Enter OTP
            </p>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-2 text-sm sm:text-base"
              placeholder="Enter OTP"
            />
            <Button
              className="w-full bg-green-600 text-white mt-4 py-3 text-sm sm:text-base rounded-lg hover:bg-green-700 hover:shadow-lg transition"
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </Button>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 bg-green-100 text-green-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="text-base sm:text-lg font-semibold">
              Successfully updated your booking with {selectedItems.size} new
              items and quantity changes!
            </p>
            <Button
              className="w-full mt-4 py-3 text-sm sm:text-base text-white rounded-lg transition"
              onClick={onClose}
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContent>
  );
};

export default ProviderBookingEditModel;
