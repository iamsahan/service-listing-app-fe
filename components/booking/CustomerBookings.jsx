"use client";

import { useSocketNotifications } from "@/src/context/SocketNotificationContext";
import { CustomerBookingsSkeleton } from "../skeletons/CustomerBookingsSkeleton";
import BookingStatus, { statusGroups } from "@components/booking/BookingStatus";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { cartService } from "@api/cartService";
import Link from "next/link";
import Image from "next/image";

const CustomerBookings = ({ baseUrl }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { bookingUpdatedEvent } = useSocketNotifications();
  const [bookingData, setBookingData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("upcoming");

  useEffect(() => {
    const fetchBookingData = async () => {
      setIsLoading(true);
      try {
        const response = await cartService.getCustomerBookings();
        setBookingData(response || []);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookingData();
  }, [bookingUpdatedEvent]);

  const getImageUrl = useCallback((booking) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const path = booking?.subCategory?.icon_url;
    return path && path.startsWith("/") && apiUrl ? `${apiUrl}${path}` : null;
  }, []);

  // Formatter
  const formatBookingDate = useCallback((booking) => {
    if (!booking?.booking_date) return null;
    return new Date(booking.booking_date).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const formatStartTime = useCallback((booking) => {
    if (!booking?.start_time) return null;
    return new Date(`1970-01-01T${booking.start_time}`).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  }, []);

  // Filter
  const filteredAndSortedBookings = useMemo(() => {
    const filtered = selectedGroup
      ? bookingData.filter((booking) =>
          statusGroups[selectedGroup]?.includes(booking.status)
        )
      : bookingData;

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
  }, [bookingData, selectedGroup]);

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <BookingStatus
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
      />

      <div className="flex-1">
        {isLoading ? (
          <CustomerBookingsSkeleton />
        ) : filteredAndSortedBookings.length > 0 ? (
          <div className="space-y-4 sm:space-y-5">
            {filteredAndSortedBookings.map((booking) => (
              <Link
                key={booking.booking_id}
                href={`${baseUrl}/${booking.booking_id}`}
                className="block group"
              >
                <div className="bg-white border border-gray-200/75 sm:border-none rounded-xl p-3 hover:border-gray-300 transition-all duration-200 group-hover:bg-gray-50">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Image */}
                    <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {booking?.subCategory?.icon_url && (
                        <Image
                          src={getImageUrl(booking)}
                          alt="Booking item"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 64px, 80px"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 min-w-0 space-y-5 sm:space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                            {booking?.subCategory?.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600">
                            <span className="font-mono text-xs text-[#5f60b9] bg-[#5f60b9]/5 px-2 py-1 rounded-md whitespace-nowrap">
                              #{booking?.booking_id}
                            </span>

                            {/* Status */}
                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 capitalize whitespace-nowrap">
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5" />
                      </div>

                      {/* Date and Time */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 -ml-14 sm:ml-0">
                        {formatBookingDate(booking) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm">
                              {formatBookingDate(booking)}
                            </span>
                          </div>
                        )}

                        {formatStartTime(booking) && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm">
                              {formatStartTime(booking)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center mt-12 sm:mt-16">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#5f60b9]/10 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 stroke-1 text-[#5f60b9]" />
              </div>
              <div className="space-y-1 px-4">
                <p className="text-sm sm:text-base text-gray-900 font-medium">
                  No {selectedGroup.replace("_", " ")} bookings
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Your {selectedGroup.replace("_", " ")} bookings will appear
                  here
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookings;
