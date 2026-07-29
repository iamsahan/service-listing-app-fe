"use client";
import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  MapPin,
  User,
  UserCheck,
  CreditCard,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const containerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
};

const centerFallback = {
  lat: 6.9271,
  lng: 79.8612,
};

const statusIcons = {
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  assigned: <UserCheck className="h-4 w-4 text-blue-500" />,
};

const BookingDetailsModal = ({ booking }) => {
  if (!booking) return null;

  const serviceLocation = booking?.service_location?.coordinates;
  const serviceLatLng = serviceLocation
    ? { lat: serviceLocation[1], lng: serviceLocation[0] }
    : centerFallback;

  const openInGoogleMaps = () => {
    if (serviceLatLng) {
      const url = `https://www.google.com/maps?q=${serviceLatLng.lat},${serviceLatLng.lng}`;
      window.open(url, "_blank");
    }
  };

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${booking.start_time}`);
    const end = new Date(`2000-01-01T${booking.end_time}`);
    const diff = (end - start) / (1000 * 60);
    return `${diff} minutes`;
  };

  const displayContactInfo =
    booking.booking_date &&
    booking.start_time &&
    !["assigned", "cancelled", "completed", "refunded"].includes(
      booking.status
    ) &&
    (booking.max_buffer_time === 0 ||
      (() => {
        // Combine booking date with start time
        const bookingDateTime = new Date(
          `${booking.booking_date}T${booking.start_time}`
        );

        // Subtract minutes from the bookingDateTime
        const graceDateTime = new Date(bookingDateTime);
        graceDateTime.setMinutes(
          bookingDateTime.getMinutes() - booking.max_buffer_time
        );

        const now = new Date();
        return now >= graceDateTime;
      })());

  return (
    <DialogContent className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-4xl p-4 sm:p-6">
      <DialogHeader className="space-y-3">
        <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-lg sm:text-xl font-bold">
            Booking #{booking.booking_id}
          </span>
          <Badge
            variant="outline"
            className="flex items-center gap-1 py-1 px-3 border-2 w-fit"
          >
            {statusIcons[booking.status] || <Clock className="h-4 w-4" />}
            <span className="font-medium capitalize">{booking.status}</span>
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-3 sm:gap-4 mt-4">
        {/* Main Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Customer Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs sm:text-sm p-3 sm:p-6 pt-0">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-right break-words">
                  {booking.customer?.name}
                </span>
              </div>

              {displayContactInfo && (
                <>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-right break-all">
                      {booking.customer?.email}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">
                      {booking.customer?.mobile}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Schedule Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Service Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs sm:text-sm p-3 sm:p-6 pt-0">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium text-right">
                  {booking?.booking_date
                    ? format(new Date(booking.booking_date), "PPP")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium text-right">
                  {booking?.start_time
                    ? format(
                        new Date(`2000-01-01T${booking.start_time}`),
                        "hh:mm a"
                      )
                    : "-"}
                  {" - "}
                  {booking?.end_time
                    ? format(
                        new Date(`2000-01-01T${booking.end_time}`),
                        "hh:mm a"
                      )
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{calculateDuration()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Employee Card */}
          {booking?.employee && (
            <Card className="shadow-sm md:col-span-2">
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Assigned Employee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm p-3 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex justify-between sm:justify-start gap-2">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">
                      {booking.employee?.employee_id}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {booking.employee?.User?.name}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-start gap-2">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">
                      {booking.employee?.User?.mobile}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Location Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-xs sm:text-sm">Address</h4>
                <p className="text-xs sm:text-sm">{booking.service_address}</p>
                <p className="text-xs sm:text-sm">
                  <span className="text-muted-foreground">City:</span>{" "}
                  <span className="font-medium">{booking.City?.name}</span>
                </p>
                <Button
                  size="sm"
                  className="mt-2 w-full sm:w-auto text-xs sm:text-sm"
                  onClick={openInGoogleMaps}
                >
                  Open in Google Maps
                </Button>
              </div>

              <div className="w-full">
                <LoadScript
                  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}
                >
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={serviceLatLng}
                    zoom={15}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    <Marker
                      position={serviceLatLng}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      }}
                    />
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>

            {booking.customer_notes && (
              <div className="mt-3 sm:mt-4">
                <h4 className="font-medium text-xs sm:text-sm mb-2">
                  Customer Notes
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                  {booking.customer_notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Section */}
        {booking.BookingItems && booking.BookingItems.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <span>Service Details</span>
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  {booking.BookingItems.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {/* Mobile: Card Layout */}
              <div className="block sm:hidden space-y-2 px-3 pb-3">
                {booking.BookingItems.map((item) => (
                  <Card key={item.id} className="p-3 shadow-sm">
                    <div className="space-y-2 text-xs">
                      <div className="font-medium text-sm">
                        {item.serviceItem?.name || item.packageItem?.name}
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.item_type.replace("_", " ")}
                        </Badge>
                        <span className="text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">
                          ₹{parseFloat(item.total_price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booking.BookingItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.serviceItem?.name || item.packageItem?.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.item_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{parseFloat(item.total_price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment & Commission Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Payment Summary Overview */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold text-slate-800">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <span className="text-sm sm:text-base">Payment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {/* Key Financial Metrics */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {/* Total Amount */}
                <Card className="bg-blue-50 border-blue-200 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center sm:text-center sm:flex-col">
                      <div className="text-xs sm:text-sm font-medium text-blue-700 mb-0 sm:mb-1">
                        Total Amount
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-900">
                        ₹
                        {parseFloat(
                          booking.payment_summary?.total_amount || 0
                        ).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Commission */}
                <Card className="bg-green-50 border-green-200 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center sm:text-center sm:flex-col">
                      <div className="text-xs sm:text-sm font-medium text-green-700 mb-0 sm:mb-1">
                        Service Commission for ProHive
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-green-900">
                        ₹
                        {parseFloat(
                          booking.payment_summary?.total_service_commission || 0
                        ).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Income for Provider */}
                <Card className="bg-green-50 border-green-200 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center sm:text-center sm:flex-col">
                      <div className="text-xs sm:text-sm font-medium text-green-700 mb-0 sm:mb-1">
                        Income for provider
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-green-900">
                        ₹
                        {(
                          parseFloat(
                            booking.payment_summary?.total_amount || 0
                          ) -
                          parseFloat(
                            booking.payment_summary?.total_service_commission ||
                              0
                          )
                        ).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DialogContent>
  );
};

export default BookingDetailsModal;
