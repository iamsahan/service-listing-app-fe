"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import {
  AlertCircle,
  BookCheck,
  Calendar as CalendarIcon,
  Clock,
  Heart,
  MapPin,
  Shield,
  Trophy,
  UserCheck,
  Bell,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { AccountBalance } from "@mui/icons-material";
import { formatCurrency } from "@/utils/bookingUtils";
import { profileAPI } from "@/api/profile";
import { providerAPI } from "@/api/provider";
import { toast } from "@/hooks/use-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";
import BookingDetailsModal from "../booking/BookingDetailsModal";
import RazorpayPayoutHandler from "../payout/RazorpayPayoutHandler";

const ProfileOverview = ({ userData, onSettle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityOverview, setActivityOverview] = useState(null);
  const [bookingDates, setBookingDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  // Commission payment states
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  const localizer = momentLocalizer(moment);
  const formats = {
    dayFormat: "ddd DD/MM",
    weekdayFormat: "dddd",
    monthHeaderFormat: "MMMM YYYY",
    dayHeaderFormat: "dddd DD MMMM",
    dayRangeHeaderFormat: ({ start, end }, culture, local) =>
      `${local.format(start, "MMMM DD", culture)} - ${local.format(
        end,
        "MMMM DD",
        culture
      )}`,
    agendaDateFormat: "ddd MMM DD",
    timeGutterFormat: "HH:mm",
    eventTimeRangeFormat: ({ start, end }, culture, local) =>
      `${local.format(start, "HH:mm", culture)} - ${local.format(
        end,
        "HH:mm",
        culture
      )}`,
  };

  const handleViewChange = useCallback((newView) => {
    console.log("View changed to:", newView);
    setView(newView);
  }, []);

  const handleNavigate = useCallback((newDate) => {
    console.log("Navigating to:", newDate);
    setDate(newDate);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedBooking(event.details);
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    fetchActivityOverview();
    fetchProviderBookings();
  }, [userData?.provider_id]);

  const fetchActivityOverview = async () => {
    try {
      const response = await providerAPI.getActivityOverview();
      setActivityOverview(response.data);
      console.log("Activity overview:", response.data);
    } catch (error) {
      console.error("Error fetching activity overview:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load activity overview",
      });
    }
  };

  const fetchProviderBookings = async () => {
    if (!userData?.provider_id) return;
    try {
      const response = await providerAPI.getProviderBookings(
        userData.provider_id
      );
      console.log("Bookings response:", response.data);
      if (Array.isArray(response.data)) {
        setBookings(response.data);
        const formattedBookings = response.data
          .map((booking) => {
            const start = new Date(
              `${booking.booking_date}T${booking.start_time}`
            );
            const end = new Date(`${booking.booking_date}T${booking.end_time}`);
            if (isNaN(start) || isNaN(end)) {
              console.warn("Invalid date for booking:", booking);
              return null;
            }
            return {
              id: booking.booking_id,
              title: `Booking #${booking.booking_id}`,
              start,
              end,
              details: booking,
            };
          })
          .filter(Boolean);
        setBookingDates(formattedBookings);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No bookings found",
        });
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bookings",
      });
    }
  };

  const getProfileCompletion = () => {
    const requiredFields = ["email", "gender", "dob", "mobile", "photo"];
    const optionalFields = ["email_verified", "mobile_verified"];
    const requiredScore =
      requiredFields.filter((field) => userData.User[field]).length * 16;
    const optionalScore =
      optionalFields.filter((field) => userData.User[field]).length * 10;
    return Math.min(requiredScore + optionalScore, 100);
  };

  const completionPercentage = getProfileCompletion();

  const getProfileStatus = () => {
    if (completionPercentage === 100) return "Complete";
    if (completionPercentage >= 70) return "Almost Complete";
    if (completionPercentage >= 40) return "In Progress";
    return "Just Started";
  };

  const getMissingFields = () => {
    const fields = [
      { key: "email", label: "Email Address" },
      { key: "email_verified", label: "Email Verification" },
      { key: "gender", label: "Gender" },
      { key: "dob", label: "Date of Birth" },
      { key: "mobile", label: "Mobile Number" },
      { key: "mobile_verified", label: "Mobile Verification" },
      { key: "photo", label: "Profile Photo" },
    ];
    return fields
      .filter(({ key }) => !userData.User[key])
      .map(({ label }) => label);
  };

  const handlePaymentSuccess = (paymentResponse, verificationData) => {
    console.log(
      "Payment completed successfully:",
      paymentResponse,
      verificationData
    );

    // Refresh user data
    if (onSettle) {
      onSettle();
    }

    // Close the modal
    setIsModalOpen(false);

    // Optionally reload the page to reflect updated commission status
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    // Modal will remain open so user can try again
  };

  const handlePaymentClose = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Profile Overview</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Trophy
                        className={`h-5 w-5 ${
                          completionPercentage === 100
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profile Status: {getProfileStatus()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Profile Completion
                  </span>
                  <span className="text-sm text-gray-500">
                    {completionPercentage}%
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              {getMissingFields().length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Complete Your Profile
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {getMissingFields().map((field) => (
                          <li
                            key={field}
                            className="text-sm text-yellow-700 flex items-center gap-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            {field}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          <div className="space-y-5">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Balance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AccountBalance className="h-10 w-10 text-[#5f60b9]" />
                    <p className="text-xl font-bold">
                      {formatCurrency(userData?.User?.acc_balance ?? 0)}
                    </p>
                  </div>
                </div>
                <p>
                  Last Updated at:{" "}
                  <span>
                    {userData?.User?.balance_updated_at
                      ? new Date(
                          userData.User.balance_updated_at
                        ).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </span>
                </p>
              </div>
            </Card>
            {/* Commission Payment Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Commission Payment</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <span className="text-sm">Pending Commission</span>
                  </div>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(userData?.pending_commission || 0)}
                  </span>
                </div>
                {userData?.pending_commission > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">
                          Commission Payment Required
                        </h4>
                        <p className="text-sm text-orange-700 mt-1">
                          You have pending commission payments. Please pay to
                          continue receiving bookings.
                        </p>
                        <Button
                          onClick={() => setIsCommissionModalOpen(true)}
                          className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                          size="sm"
                        >
                          Pay Commission
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {(!userData?.pending_commission ||
                  userData?.pending_commission === 0) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium text-green-800">
                          All Commissions Paid
                        </h4>
                        <p className="text-sm text-green-700">
                          You have no pending commission payments.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activityOverview?.acceptedCount > 0 ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-[#5f60b9]" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {activityOverview.acceptedCount} Accepted{" "}
                      {activityOverview.acceptedCount === 1
                        ? "Booking"
                        : "Bookings"}
                    </p>
                    <Link href="/profile/provider/orders">
                      <p className="text-xs text-[#5f60b9] underline cursor-pointer">
                        Check your schedule
                      </p>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-[#5f60b9]" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      No Accepted Bookings Found
                    </p>
                    <p className="text-xs text-[#5f60b9]">
                      Check your schedule
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Next Booking</p>
                  {activityOverview?.nextBooking ? (
                    <p className="text-xs text-gray-500">
                      {new Date(
                        activityOverview.nextBooking.booking_date
                      ).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No Scheduled Booking Found
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">Email Verification</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    userData.User?.email_verified
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {userData.User?.email_verified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">Mobile Verification</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    userData.User?.mobile_verified
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {userData.User?.mobile_verified ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </Card>
        </div>
        <Card className="p-3 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Booking Calendar</h3>{" "}
          </div>
          <Calendar
            className="bg-white rounded-lg shadow max-w-[320px] md:max-w-full w-full"
            localizer={localizer}
            formats={formats}
            events={bookingDates}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={() => ({
              style: {
                backgroundColor: "#5f60b9",
                color: "white",
                borderRadius: "4px",
                border: "none",
              },
            })}
          />
          <p className="text-sm text-gray-500 mt-4">
            View and manage your booking schedule.
          </p>
        </Card>
        <div className="text-center p-6">
          <p className="text-sm text-gray-500">
            Need help? Our support team is available 24/7
          </p>
          <Button variant="link" className="text-[#5f60b9] mt-1">
            Contact Support
          </Button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Pay Commission to ProHive
            </h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to proceed with commission payment of{" "}
              <span className="font-bold text-orange-600">
                {formatCurrency(userData?.pending_commission || 0)}
              </span>
              ?
            </p>

            <RazorpayPayoutHandler
              userData={userData}
              amount={userData?.pending_commission || 0}
              description="Commission Payment to ProHive"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onClose={handlePaymentClose}
              buttonText="Proceed to Payment"
              buttonClass="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg"
              showDebugInfo={true}
              companyName="ProHive"
              companyLogo="/assets/images/prohive_logo.png"
              theme="#10b981"
            />
          </div>
        </div>
      )}

      {/* Commission Payment Modal */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Pay Commission to ProHive
            </h2>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Commission Amount:
                <span className="font-bold text-orange-600 ml-2">
                  {formatCurrency(userData?.pending_commission || 0)}
                </span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                This payment will settle all your pending commission payments to
                ProHive.
              </p>
            </div>

            <RazorpayPayoutHandler
              userData={userData}
              amount={userData?.pending_commission || 0}
              description="Commission Payment to ProHive"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onClose={() => setIsCommissionModalOpen(false)}
              buttonText="Proceed to Payment"
              buttonClass="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg"
              showDebugInfo={false}
              companyName="ProHive"
              companyLogo="/assets/images/prohive_logo.png"
              theme="#10b981"
            />
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <BookingDetailsModal booking={selectedBooking} />
      </Dialog>
    </main>
  );
};

export default ProfileOverview;
