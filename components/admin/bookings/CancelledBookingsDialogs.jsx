"use client";
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  CreditCard,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  FileText,
} from "lucide-react";

const CancelledBookingsDialogs = ({
  openDialog,
  setOpenDialog,
  openWaveOffDialog,
  setOpenWaveOffDialog,
  openDetailsDialog,
  setOpenDetailsDialog,
  selectedBooking,
  selectedType,
  setSelectedType,
  waveOffType,
  setWaveOffType,
  waveOffAmount,
  setWaveOffAmount,
  onUpdatePenalty,
  onWaveOffPenalty,
  penaltyStatuses,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const getPenaltyStatusColor = (status) => {
    const statusColors = {
      no_penalty: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      fully_settled_advance: "bg-blue-100 text-blue-800",
      partially_settled_advance: "bg-orange-100 text-orange-800",
      apply_next_booking: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const formatPenaltyStatus = (status) => {
    const statusLabels = {
      no_penalty: "No Penalty",
      pending: "Pending",
      fully_settled_advance: "Fully Settled (Advance)",
      partially_settled_advance: "Partially Settled (Advance)",
      apply_next_booking: "Apply to Next Booking",
      completed: "Completed",
    };
    return statusLabels[status] || status;
  };

  return (
    <>
      {/* Update Penalty Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Penalty Status</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Booking Information</h4>
              <p>
                <strong>Booking ID:</strong> {selectedBooking?.booking_id}
              </p>
              <p>
                <strong>Customer:</strong> {selectedBooking?.customer?.name}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                <Badge
                  className={getPenaltyStatusColor(
                    selectedBooking?.penalty_status
                  )}
                >
                  {formatPenaltyStatus(selectedBooking?.penalty_status)}
                </Badge>
              </p>
            </div>

            <FormControl component="fieldset">
              <RadioGroup
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {penaltyStatuses.map((status) => (
                  <FormControlLabel
                    key={status}
                    value={status}
                    control={<Radio />}
                    label={formatPenaltyStatus(status)}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={onUpdatePenalty}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Wave Off Dialog */}
      <Dialog
        open={openWaveOffDialog}
        onClose={() => setOpenWaveOffDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Wave Off Penalty</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Booking Information</h4>
              <p>
                <strong>Booking ID:</strong> {selectedBooking?.booking_id}
              </p>
              <p>
                <strong>Customer:</strong> {selectedBooking?.customer?.name}
              </p>
              <p>
                <strong>Penalty Amount:</strong>{" "}
                {formatCurrency(selectedBooking?.penalty_amount)}
              </p>
            </div>

            <FormControl component="fieldset">
              <RadioGroup
                value={waveOffType}
                onChange={(e) => setWaveOffType(e.target.value)}
              >
                <FormControlLabel
                  value="full"
                  control={<Radio />}
                  label="Full Wave Off"
                />
                <FormControlLabel
                  value="partial"
                  control={<Radio />}
                  label="Partial Wave Off"
                />
              </RadioGroup>
            </FormControl>

            {waveOffType === "partial" && (
              <TextField
                label="Wave Off Amount"
                type="number"
                value={waveOffAmount}
                onChange={(e) => setWaveOffAmount(e.target.value)}
                fullWidth
                inputProps={{
                  max: selectedBooking?.penalty_amount || 0,
                  min: 0,
                }}
              />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWaveOffDialog(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={onWaveOffPenalty}>Wave Off</Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <div className="space-y-6 pt-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Booking Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <strong>Booking ID:</strong> {selectedBooking.booking_id}
                    </p>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <strong>Date:</strong>{" "}
                      {formatDate(selectedBooking.booking_date)}
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <strong>Time:</strong> {selectedBooking.start_time} -{" "}
                      {selectedBooking.end_time}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge className="ml-2">{selectedBooking.status}</Badge>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedBooking.customer?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedBooking.customer?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Mobile:</strong>{" "}
                      {selectedBooking.customer?.mobile || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              {selectedBooking.provider && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    Provider Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p>
                        <strong>Business Name:</strong>{" "}
                        {selectedBooking.provider.business_name || "N/A"}
                      </p>
                      <p>
                        <strong>Provider Name:</strong>{" "}
                        {selectedBooking.provider.User?.name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedBooking.provider.User?.email || "N/A"}
                      </p>
                      <p>
                        <strong>Mobile:</strong>{" "}
                        {selectedBooking.provider.User?.mobile || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Information */}
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-lg flex items-center text-red-800">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Cancellation Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p>
                      <strong>Cancelled At:</strong>{" "}
                      {formatDate(selectedBooking.cancellation_time)}
                    </p>
                    <p>
                      <strong>Cancelled By:</strong>{" "}
                      {selectedBooking.cancelled_by}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Penalty Status:</strong>{" "}
                      <Badge
                        className={getPenaltyStatusColor(
                          selectedBooking.penalty_status
                        )}
                      >
                        {formatPenaltyStatus(selectedBooking.penalty_status)}
                      </Badge>
                    </p>
                    {selectedBooking.penalty_amount && (
                      <p className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <strong>Penalty Amount:</strong>{" "}
                        {formatCurrency(selectedBooking.penalty_amount)}
                      </p>
                    )}
                  </div>
                </div>
                {selectedBooking.cancellation_reason && (
                  <div>
                    <strong>Reason:</strong>
                    <p className="mt-1 p-2 bg-white rounded border">
                      {selectedBooking.cancellation_reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              {selectedBooking.BookingPayment && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p>
                        <strong>Total Amount:</strong>{" "}
                        {formatCurrency(
                          selectedBooking.BookingPayment.total_amount
                        )}
                      </p>
                      <p>
                        <strong>Advance Payment:</strong>{" "}
                        {formatCurrency(
                          selectedBooking.BookingPayment.advance_payment
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong>Payment Method:</strong>{" "}
                        {selectedBooking.BookingPayment.payment_method}
                      </p>
                      <p>
                        <strong>Payment Status:</strong>{" "}
                        <Badge>
                          {selectedBooking.BookingPayment.payment_status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Address */}
              {selectedBooking.service_address && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Service Address
                  </h4>
                  <p className="p-2 bg-gray-50 rounded border">
                    {selectedBooking.service_address}
                  </p>
                </div>
              )}

              {/* Booking Items */}
              {selectedBooking.BookingItems &&
                selectedBooking.BookingItems.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Booking Items</h4>
                    <div className="space-y-2">
                      {selectedBooking.BookingItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {item.serviceItem?.name ||
                                item.packageItem?.name ||
                                item.custom_item_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.total_price)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Unit: {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelledBookingsDialogs;
