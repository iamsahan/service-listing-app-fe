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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AccountBalance } from "@mui/icons-material";
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
      booking_payment: "bg-blue-100 text-blue-800",
      booking_refund: "bg-green-100 text-green-800",
      booking_penalty: "bg-red-100 text-red-800",
      admin_adjustment: "bg-purple-100 text-purple-800",
      // Legacy support
      credit: "bg-green-100 text-green-800",
      debit: "bg-red-100 text-red-800",
      refund: "bg-blue-100 text-blue-800",
      penalty: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
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

  // Calculate profile completion percentage
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

  // Get profile status and next steps
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

  const bookings = stats?.overview?.bookings;
  const totals = stats?.overview?.totals;
  const lastBooking = Array.isArray(stats?.recent_bookings)
    ? stats?.recent_bookings[0]
    : null;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Profile Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="sm:col-span-2 p-6">
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
                <span className="text-sm font-medium">Profile Completion</span>
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

        {/* Quick Stats Card */}
        <div className="space-y-5">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Balance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AccountBalance className="h-10 w-10 text-blue-500" />
                  <p className="text-xl font-bold">
                    {formatCurrency(userData?.acc_balance ?? 0)}
                  </p>
                </div>
              </div>
              {userData?.acc_balance > 0 ? (
                <p className="text-sm text-gray-600">
                  This amount will be reduced for the next booking.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  You will be charged for the next booking.
                </p>
              )}

              {/* Hold Account Balance Section */}
              {userData?.hold_acc_balance &&
                parseFloat(userData.hold_acc_balance) > 0 && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          Hold Balance
                        </span>
                      </div>
                      <span className="text-lg font-bold text-amber-800">
                        {formatCurrency(userData.hold_acc_balance)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-amber-700">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        You cannot use this balance for booking payments.
                      </p>
                      <p className="text-xs text-amber-700">
                        This amount will be transferred to your bank account.
                      </p>
                    </div>
                  </div>
                )}

              <Button
                onClick={handleViewLogs}
                variant="outline"
                size="sm"
                className="w-full mt-3"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Logs
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
            <div className="space-y-4">
              <Link href="/profile/customer/bookings" className="block">
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <BookCheck className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Total Bookings</span>
                  </div>
                  <span className="font-medium">
                    {totals?.total_bookings || 0}
                  </span>
                </div>
              </Link>

              <Link href="/profile/customer/addresses" className="block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Saved Locations</span>
                  </div>
                  <span className="font-medium">
                    {totals?.total_addresses || 0}
                  </span>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity & Upcoming Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <Link href="/profile/customer/bookings">
            <div className="space-y-4">
              {bookings?.confirmed > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {bookings.upcoming} Upcoming{" "}
                      {bookings.upcoming === 1 ? "Booking" : "Bookings"}
                    </p>
                    <p className="text-xs text-blue-700">Check your schedule</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Last Booking On</p>
                  <p className="text-xs text-gray-500">
                    {new Date(lastBooking?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </Card>

        {/* Account Security Status */}
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
                  userData.email_verified ? "text-green-600" : "text-red-600"
                }`}
              >
                {userData.email_verified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Mobile Verification</span>
              </div>
              <span
                className={`text-sm font-medium ${
                  userData.mobile_verified ? "text-green-600" : "text-red-600"
                }`}
              >
                {userData.mobile_verified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Help & Support */}
      <div className="text-center p-6">
        <p className="text-sm text-gray-500">
          Need help? Our support team is available 24/7
        </p>
        <Button variant="link" className="text-primary mt-1" asChild>
          <Link href="/support">Contact Support</Link>
        </Button>
      </div>

      {/* Account Balance Logs Modal */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="w-full max-w-full sm:max-w-2xl md:max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <AccountBalance className="h-5 w-5" />
              Account Balance Logs
            </DialogTitle>
            <DialogDescription>
              View your account balance transaction history including payments,
              refunds, penalties, and adjustments.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <p className="text-sm text-gray-600">
                Transaction history for your account balance
              </p>
              <Button
                onClick={fetchBalanceLogs}
                variant="outline"
                size="sm"
                disabled={logsLoading}
              >
                {logsLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 max-h-[60vh] sm:max-h-[70vh]">
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading logs...</span>
                </div>
              ) : balanceLogs.length === 0 ? (
                <div className="text-center py-8">
                  <AccountBalance className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No transaction logs found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {balanceLogs.map((log, index) => (
                    <Card key={log.log_id || index} className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <Badge
                              className={cn(
                                "w-fit",
                                getTransactionTypeColor(log.transaction_type)
                              )}
                            >
                              {getTransactionTypeLabel(log.transaction_type)}
                            </Badge>

                            <span className="hidden md:inline-block text-sm text-gray-500">
                              {formatDate(log.created_at)}
                            </span>
                          </div>

                          <p className="text-sm font-medium mb-1">
                            {log.description}
                          </p>

                          <span className="block mb-1 md:hidden text-sm text-gray-500">
                            {formatDate(log.created_at)}
                          </span>

                          {log.reference_id && (
                            <p className="text-xs text-gray-500">
                              Reference: {log.reference_id}
                            </p>
                          )}
                          {log.metadata && (
                            <p className="text-xs text-gray-400">
                              {log.metadata.payment_id &&
                                `Payment ID: ${log.metadata.payment_id}`}
                              {log.metadata.refund_reason &&
                                log.metadata.refund_reason}
                              {log.metadata.penalty_reason &&
                                log.metadata.penalty_reason}
                              {log.metadata.adjustment_reason &&
                                log.metadata.adjustment_reason}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              parseFloat(log.amount) > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {parseFloat(log.amount) > 0 ? "+" : ""}
                            {formatCurrency(parseFloat(log.amount))}
                          </p>
                          <p className="text-xs text-gray-500">
                            Balance:{" "}
                            {formatCurrency(parseFloat(log.new_balance))}
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
