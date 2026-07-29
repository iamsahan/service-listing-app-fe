import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  Phone,
  Mail,
  ImageIcon,
} from "lucide-react";
import { cartService } from "@/api/cartService";

export const AdminBookingDetailsModal = ({
  open,
  onOpenChange,
  id: booking_id,
}) => {
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [proofImages, setProofImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && booking_id) {
      setLoading(true);
      cartService
        .getBookingDataById(booking_id)
        .then((res) => {
          setBooking(res?.booking);
          setPayment(res?.payment_summary);
          setProofImages(res?.booking?.proofImages || []);
        })
        .catch((err) => {
          console.error("Failed to fetch booking details:", err);
          setBooking(null);
        })
        .finally(() => setLoading(false));
    } else {
      setBooking(null);
      setProofImages([]);
    }
  }, [open, booking_id]);

  // Calculate the final total
  const accountBalance = Number(payment?.acc_balance_used || 0);

  const calculatedTotal = useMemo(() => {
    const backendTotal = Number(payment?.total_amount || 0);
    return (
      backendTotal -
      (accountBalance > 0 ? accountBalance : 0) +
      (accountBalance < 0 ? Math.abs(accountBalance) : 0)
    );
  }, [payment?.total_amount, accountBalance]);

  if (!open) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>Booking Details</span>
            {booking_id && (
              <Badge variant="outline" className="text-sm font-mono capitalize">
                #{booking_id}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : !booking ? (
          <div className="p-6 text-center text-gray-500">
            No booking details found
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">
                  {formatDate(booking.booking_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">
                  {formatTime(booking.start_time)}
                </span>
              </div>
              <Badge className="capitalize">
                {booking.status?.replace("_", " ")}
              </Badge>
            </div>

            {/* Customer and Service */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 px-6 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">
                        {booking.customer?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-medium text-gray-900">
                        {booking.customer?.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {booking.customer?.mobile || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Service Address
                    </p>
                    <p className="text-gray-900 leading-relaxed">
                      {booking.service_address || "No address provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Date
                      </p>
                      <p className="text-gray-900">
                        {formatDate(booking.booking_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Time
                      </p>
                      <p className="text-gray-900">
                        {formatTime(booking.start_time)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Booked Services & Items
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">
                          Service/Item Name
                        </TableHead>
                        {/* <TableHead className="font-semibold">Type</TableHead> */}
                        <TableHead className="font-semibold text-center">
                          Quantity
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Price
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.BookingItems?.length ? (
                        booking.BookingItems.map((item, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {item.serviceItem?.name ||
                                item.packageItem?.name ||
                                item.custom_item_name ||
                                "N/A"}
                            </TableCell>
                            {/* <TableCell>
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                              >
                                {item.item_type?.replace("_", " ") || "N/A"}
                              </Badge>
                            </TableCell> */}
                            <TableCell className="text-center font-medium">
                              {item.quantity || 0}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.total_price)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-gray-500"
                          >
                            No items found for this booking
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(payment?.total_subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax Amount</span>
                    <span className="font-medium">
                      {formatCurrency(payment?.total_tax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tip Amount</span>
                    <span className="font-medium">
                      {formatCurrency(payment?.total_tip_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Penalty Amount</span>
                    <span className="font-medium">
                      {formatCurrency(booking.penalty_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium">
                      - {formatCurrency(payment.total_discount_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Advance Payment</span>
                    <span className="font-medium">
                      - {formatCurrency(payment?.total_advance_payment)}
                    </span>
                  </div>

                  {accountBalance != 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {accountBalance > 0
                          ? "Acc Balance Deducted"
                          : "Acc Balance Added"}
                      </span>
                      <span className="font-medium">
                        {accountBalance > 0
                          ? `- ${formatCurrency(accountBalance)}`
                          : `+ ${formatCurrency(Math.abs(accountBalance))}`}
                      </span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-green-600">
                      {formatCurrency(calculatedTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge className="capitalize">
                      {payment?.latest_payment_status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Service Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">
                      {formatCurrency(payment?.total_service_commission)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <Badge className="capitalize">
                      {booking.BookingPayment?.commition_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Proof Images */}
            {proofImages && proofImages.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Service Proof Images
                    <Badge variant="secondary" className="ml-2">
                      {proofImages.length}{" "}
                      {proofImages.length === 1 ? "Image" : "Images"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proofImages.map((proof, index) => (
                      <div
                        key={proof.proof_id || index}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="relative w-full h-64 bg-gray-100">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${proof.image_url}`}
                            alt={`${proof.image_type} service proof`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        <div className="p-4 space-y-2 bg-white">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                proof.image_type === "before"
                                  ? "default"
                                  : "secondary"
                              }
                              className="capitalize"
                            >
                              {proof.image_type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(proof.uploaded_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          {proof.notes && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-gray-600 mb-1">
                                Notes:
                              </p>
                              <p className="text-sm text-gray-700">
                                {proof.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
