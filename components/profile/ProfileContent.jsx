"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  BookCheck,
  Calendar,
  Clock,
  Shield,
  Trophy,
  UserCheck,
  MapPin,
  Eye,
  RefreshCw,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/bookingUtils";
import { profileAPI } from "@/api/profile";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ProfileContent = ({ userData, stats }) => {
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [balanceLogs, setBalanceLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchBalanceLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await profileAPI.getAccountBalanceLogs();
      setBalanceLogs(response.data.data.logs || []);
    } catch (error) {
      console.error("Error fetching balance logs:", error);
      setBalanceLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleViewLogs = () => {
    setShowLogsModal(true);
    fetchBalanceLogs();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      booking_payment: "bg-neutral-100 text-neutral-800 border-neutral-200/60",
      booking_refund: "bg-emerald-50 text-emerald-800 border-emerald-150",
      booking_penalty: "bg-red-50 text-red-800 border-red-150",
      admin_adjustment: "bg-purple-50 text-purple-800 border-purple-150",
      credit: "bg-emerald-50 text-emerald-800 border-emerald-150",
      debit: "bg-red-50 text-red-850 border-red-150",
      refund: "bg-emerald-50 text-emerald-800 border-emerald-150",
      penalty: "bg-amber-50 text-amber-800 border-amber-150",
    };
    return colors[type] || "bg-neutral-50 text-neutral-800 border-neutral-200";
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      booking_payment: "Payment",
      booking_refund: "Refund",
      booking_penalty: "Penalty",
      admin_adjustment: "Admin Adjustment",
    };
    return labels[type] || type?.charAt(0).toUpperCase() + type?.slice(1);
  };

  const getProfileCompletion = () => {
    const requiredFields = ["email", "gender", "dob", "mobile", "photo"];
    const optionalFields = ["email_verified", "mobile_verified"];

    const requiredScore =
      requiredFields.filter((field) => userData[field]).length * 15;
    const optionalScore =
      optionalFields.filter((field) => userData[field]).length * 10;

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
    const missing = [];
    if (!userData.email) missing.push("Email Address");
    if (!userData.email_verified) missing.push("Email Verification");
    if (!userData.gender) missing.push("Gender");
    if (!userData.dob) missing.push("Date of Birth");
    if (!userData.mobile) missing.push("Mobile Number");
    if (!userData.mobile_verified) missing.push("Mobile Verification");
    if (!userData.photo) missing.push("Profile Photo");
    return missing;
  };

  const formatLastBookingDate = (booking) => {
    if (!booking || !booking.created_at) return "No bookings found";
    try {
      const date = new Date(booking.created_at);
      if (isNaN(date.getTime())) return "No bookings found";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return "No bookings found";
    }
  };

  const bookings = stats?.overview?.bookings;
  const totals = stats?.overview?.totals;
  const lastBooking = Array.isArray(stats?.recent_bookings)
    ? stats?.recent_bookings[0]
    : null;

  return (
    <div className="max-w-5xl space-y-6 text-left w-full mx-auto">
      
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Completion Overview */}
        <Card className="md:col-span-2 border border-neutral-200/60 shadow-sm rounded-[2rem] bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider pl-0.5">
                Profile Overview
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Trophy
                        className={cn(
                          "size-5",
                          completionPercentage === 100
                            ? "text-amber-500 fill-amber-500/10"
                            : "text-neutral-300"
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-neutral-900 text-white rounded-lg p-2 text-xs font-semibold">
                    <p>Status: {getProfileStatus()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Profile Completion
                  </span>
                  <span className="text-xs font-black text-neutral-800">
                    {completionPercentage}%
                  </span>
                </div>
                <Progress 
                  value={completionPercentage} 
                  className="h-1.5 bg-neutral-100 rounded-full [&>div]:bg-emerald-500" 
                />
              </div>

              {getMissingFields().length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-left">
                  <AlertCircle className="size-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">
                      Complete Your Profile
                    </h4>
                    <ul className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getMissingFields().map((field) => (
                        <li
                          key={field}
                          className="text-[10px] font-bold text-amber-700 flex items-center gap-1.5"
                        >
                          <span className="size-1.5 rounded-full bg-amber-400 shrink-0" />
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Dynamic Account Balance & Statistics card */}
        <div className="space-y-6">
          <Card className="border border-neutral-200/60 shadow-sm rounded-[2rem] bg-white p-6">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
              Account Balance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Wallet className="size-5.5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-neutral-450 uppercase tracking-wider">Available Balance</p>
                  <p className="text-xl font-black text-neutral-900 tracking-tight notranslate">
                    {formatCurrency(userData?.acc_balance ?? 0)}
                  </p>
                </div>
              </div>

              {userData?.acc_balance > 0 ? (
                <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">
                  This amount will be applied as credit for your next booking.
                </p>
              ) : (
                <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">
                  You will be charged for the next service booking.
                </p>
              )}

              {/* Hold account warning details */}
              {userData?.hold_acc_balance &&
                parseFloat(userData.hold_acc_balance) > 0 && (
                  <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-2xl text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                          Hold Balance
                        </span>
                      </div>
                      <span className="text-sm font-black text-amber-800 notranslate">
                        {formatCurrency(userData.hold_acc_balance)}
                      </span>
                    </div>
                    <p className="text-[9px] text-amber-700 leading-relaxed font-bold">
                      <AlertTriangle className="h-3 w-3 inline mr-1 -mt-0.5 text-amber-650" />
                      Hold balance is locked and pending bank transfer.
                    </p>
                  </div>
                )}

              <Button
                onClick={handleViewLogs}
                variant="outline"
                className="w-full mt-3 border-neutral-200 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider py-3 rounded-xl h-auto"
              >
                <Eye className="h-4 w-4 mr-1.5 text-emerald-500" />
                View Logs
              </Button>
            </div>
          </Card>

          {/* Activity counts */}
          <Card className="border border-neutral-200/60 shadow-sm rounded-[2rem] bg-white p-6">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
              Activity Overview
            </h3>
            <div className="space-y-3.5">
              <Link href="/profile/customer/bookings" className="block group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookCheck className="size-4.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-950 transition-colors uppercase tracking-wide">Total Bookings</span>
                  </div>
                  <span className="text-xs font-black text-neutral-800 bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 rounded-full notranslate">
                    {totals?.total_bookings || 0}
                  </span>
                </div>
              </Link>

              <Link href="/profile/customer/addresses" className="block group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-neutral-500 group-hover:text-neutral-950 transition-colors uppercase tracking-wide">Saved Locations</span>
                  </div>
                  <span className="text-xs font-black text-neutral-800 bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 rounded-full notranslate">
                    {totals?.total_addresses || 0}
                  </span>
                </div>
              </Link>
            </div>
          </Card>
        </div>

      </div>

      {/* Lower Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Activity card */}
        <Card className="border border-neutral-200/60 shadow-sm rounded-[2rem] bg-white p-6 text-left">
          <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
            Recent Activity
          </h3>
          <Link href="/profile/customer/bookings">
            <div className="space-y-3">
              {bookings?.confirmed > 0 && (
                <div className="flex items-center gap-3 p-3.5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
                  <Calendar className="size-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                      {bookings.upcoming} Upcoming{" "}
                      {bookings.upcoming === 1 ? "Booking" : "Bookings"}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Check date and time slots</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200/60 bg-white">
                <Clock className="size-5 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs font-black text-neutral-700 uppercase tracking-wide">Last Booking On</p>
                  <p className="text-[10px] font-bold text-neutral-400 mt-0.5">
                    {formatLastBookingDate(lastBooking)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </Card>

        {/* Security verification details */}
        <Card className="border border-neutral-200/60 shadow-sm rounded-[2rem] bg-white p-6 text-left">
          <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
            Account Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pl-0.5">
              <div className="flex items-center gap-2.5">
                <Shield className="size-4.5 text-neutral-400 shrink-0" />
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Email Verification</span>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border",
                  userData.email_verified
                    ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                    : "bg-red-50 border-red-150 text-red-700"
                )}
              >
                {userData.email_verified ? "Verified" : "Not Verified"}
              </span>
            </div>

            <div className="flex items-center justify-between pl-0.5">
              <div className="flex items-center gap-2.5">
                <UserCheck className="size-4.5 text-neutral-400 shrink-0" />
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Mobile Verification</span>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border",
                  userData.mobile_verified
                    ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                    : "bg-red-50 border-red-150 text-red-700"
                )}
              >
                {userData.mobile_verified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Support trigger */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Need help? Our customer support is active 24/7.
        </p>
        <Button variant="link" className="text-emerald-600 hover:text-emerald-700 mt-1.5 text-xs font-extrabold uppercase tracking-wider" asChild>
          <Link href="/support">Contact Support</Link>
        </Button>
      </div>

      {/* Account Balance Logs Modal popup */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="w-[90vw] max-w-lg md:max-w-3xl max-h-[80vh] flex flex-col border-none bg-white shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
          <DialogHeader className="p-6 border-b border-neutral-100 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-neutral-900 uppercase tracking-tight">
              <Wallet className="size-5.5 text-emerald-500 shrink-0" />
              Account Balance Logs
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-1">
              Transaction history showing payments, refunds, penalties, and adjustments.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0 p-6">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Transaction Logs
              </p>
              <Button
                onClick={fetchBalanceLogs}
                variant="outline"
                disabled={logsLoading}
                className="border-neutral-200 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl h-auto flex items-center gap-1.5"
              >
                <RefreshCw className={cn("size-3.5", logsLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 max-h-[48vh]">
              {logsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <RefreshCw className="size-6 animate-spin text-emerald-500" />
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider animate-pulse">Loading log details...</span>
                </div>
              ) : balanceLogs.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Wallet className="size-10 text-neutral-350 mx-auto" />
                  <p className="text-xs font-bold text-neutral-450 uppercase tracking-wider">No transaction logs recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {balanceLogs.map((log, index) => (
                    <Card key={log.log_id || index} className="p-4 border border-neutral-250/50 shadow-sm rounded-2xl bg-white text-left">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <Badge
                              className={cn(
                                "w-fit text-[9px] font-black uppercase tracking-wide border px-2 py-0.5 rounded-full",
                                getTransactionTypeColor(log.transaction_type)
                              )}
                            >
                              {getTransactionTypeLabel(log.transaction_type)}
                            </Badge>

                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                              {formatDate(log.created_at)}
                            </span>
                          </div>

                          <p className="text-xs font-extrabold text-neutral-800 leading-snug mb-1">
                            {log.description}
                          </p>

                          {log.reference_id && (
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">
                              Reference: {log.reference_id}
                            </p>
                          )}
                          
                          {log.metadata && (
                            <p className="text-[9px] font-bold text-neutral-400/80 leading-normal mt-1">
                              {log.metadata.payment_id && `Payment ID: ${log.metadata.payment_id}`}
                              {log.metadata.refund_reason && `Reason: ${log.metadata.refund_reason}`}
                              {log.metadata.penalty_reason && `Reason: ${log.metadata.penalty_reason}`}
                              {log.metadata.adjustment_reason && `Reason: ${log.metadata.adjustment_reason}`}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={cn(
                              "text-sm font-black notranslate",
                              parseFloat(log.amount) > 0
                                ? "text-emerald-700"
                                : "text-red-700"
                            )}
                          >
                            {parseFloat(log.amount) > 0 ? "+" : ""}
                            {formatCurrency(parseFloat(log.amount))}
                          </p>
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                            Bal: {formatCurrency(parseFloat(log.new_balance))}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileContent;
