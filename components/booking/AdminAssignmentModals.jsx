"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UserCheck,
  X,
  AlertCircle,
  MapPin,
  Star,
  Search,
  XCircle,
} from "lucide-react";
import { SyncDisabledTwoTone } from "@mui/icons-material";

const AdminAssignmentModals = ({
  // Assign Dialog
  assignDialogOpen,
  selectedBooking,
  eligibleProviders,
  providersLoading,
  assigning,
  assignError,
  onCloseAssignDialog,
  onProviderAssign,

  // Cancel Dialog
  cancelDialogOpen,
  bookingToCancel,
  cancelReason,
  cancelingBooking,
  onCancelDialogClose,
  onCancelReasonChange,
  onConfirmCancel,

  // Algorithm Dialog
  showAlgorithmConfirm,
  algorithmBooking,
  triggeringAlgorithm,
  onCloseAlgorithmConfirm,
  onTriggerAlgorithm,
}) => {
  const [providerSearch, setProviderSearch] = useState("");

  const filteredProviders = eligibleProviders.filter((provider) =>
    provider.name?.toLowerCase().includes(providerSearch.toLowerCase())
  );

  return (
    <>
      {/* Enhanced Assign Dialog */}
      {assignDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[400px] max-w-[90vw] max-h-[80vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  Assign Provider
                </h3>
                <p className="text-gray-600 mt-1">
                  Booking #{selectedBooking?.booking_id}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={onCloseAssignDialog}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {providersLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Finding eligible providers...
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Please wait while we search for available providers
                </p>
              </div>
            ) : eligibleProviders.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No Eligible Providers
                </h4>
                <p className="text-gray-500 mb-6">
                  Unfortunately, no providers are currently available for this
                  booking.
                </p>
                <Button
                  onClick={onCloseAssignDialog}
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Available Providers
                  </h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {filteredProviders.length}{" "}
                    {filteredProviders.length === 1 ? "provider" : "providers"}{" "}
                    found
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    placeholder="Search providers by name..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {providerSearch && (
                    <button
                      onClick={() => setProviderSearch("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                    >
                      <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Provider List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold text-gray-900">
                              {provider.name}
                            </div>
                            {provider.rating && (
                              <div className="flex items-center gap-1 text-amber-600">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < provider.rating
                                          ? "text-amber-400 fill-amber-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium">
                                  {provider.rating}/5
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{provider.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-3 w-3" />
                              <span>{provider.mobile}</span>
                            </div>
                            {provider.distance && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>{provider.distance}km away</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white ml-4 min-w-[100px]"
                          disabled={assigning}
                          onClick={() =>
                            onProviderAssign(selectedBooking, provider)
                          }
                        >
                          {assigning ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Assigning...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Assign
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {assignError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-red-800 text-sm font-medium">
                        {assignError}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={onCancelDialogClose}>
        <DialogContent className="w-full sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Cancel Booking #{bookingToCancel?.booking_id}
            </DialogTitle>
            <DialogDescription>
              Please provide a detailed reason for cancelling this booking. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please provide a clear reason for cancellation..."
                value={cancelReason}
                onChange={onCancelReasonChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be recorded and may be shared with the
                customer.
              </p>
            </div>
            {assignError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-800 text-sm font-medium">
                    {assignError}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={onCancelDialogClose}
              className="flex items-center gap-2"
            >
              <span>Keep Booking</span>
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 min-w-[120px]"
              disabled={cancelingBooking || !cancelReason.trim()}
              onClick={onConfirmCancel}
            >
              {cancelingBooking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Confirm Cancel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Algorithm Confirmation Dialog */}
      <Dialog
        open={showAlgorithmConfirm}
        onOpenChange={onCloseAlgorithmConfirm}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <SyncDisabledTwoTone className="w-5 h-5 text-purple-600" />
              </div>
              Trigger Algorithm
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to trigger the algorithm for booking #
              {algorithmBooking?.booking_id}?
              <br />
              <br />
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will automatically find and assign
                  the best available provider based on availability, distance,
                  and ratings. This action cannot be undone.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onCloseAlgorithmConfirm}
              disabled={triggeringAlgorithm}
              className="flex items-center gap-2"
            >
              <span>Cancel</span>
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 min-w-[140px]"
              disabled={triggeringAlgorithm}
              onClick={onTriggerAlgorithm}
            >
              {triggeringAlgorithm ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Triggering...
                </>
              ) : (
                <>
                  <SyncDisabledTwoTone className="h-4 w-4" />
                  Yes, Trigger Algorithm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminAssignmentModals;
