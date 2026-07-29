import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PenaltyDetailsModal = ({
  open,
  onClose,
  penaltyDetails,
  onConfirm,
  onCancel,
}) => {
  if (!penaltyDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] rounded-lg sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Booking Cancellation Review
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Please review the penalty details before proceeding with
            cancellation
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Booking Summary Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Booking Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Booking ID
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {penaltyDetails.booking_details?.booking_id}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Customer
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {penaltyDetails.booking_details?.customer_name}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Amount
                </div>
                <div className="text-xl font-bold text-gray-900">
                  ₹{penaltyDetails.booking_details?.total_amount}
                </div>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Scheduled Time
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {penaltyDetails.booking_details?.booking_datetime_formatted}
              </div>
            </div>
          </div>

          {/* Cancellation Analysis */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Timing Analysis
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Hours Until Booking
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {penaltyDetails.cancellation_analysis
                    ?.time_until_booking_formatted || 0}{" "}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Grace Period Until
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {penaltyDetails.cancellation_analysis?.grace_time_until || ""}{" "}
                </div>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  Penalty Status
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    penaltyDetails.cancellation_analysis?.penalty_applicable
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {penaltyDetails.cancellation_analysis?.penalty_applicable
                    ? "Penalty Applicable"
                    : "No Penalty"}
                </div>
              </div>
            </div>
          </div>

          {/* Penalty Details */}
          {penaltyDetails.cancellation_analysis?.penalty_applicable && (
            <div className="border border-red-200 rounded-lg p-6 bg-red-50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900">
                  Penalty Information
                </h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-700">
                    Penalty Amount
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    ₹{penaltyDetails.penalty_details?.penalty_amount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Messages */}
          {penaltyDetails.warning_messages &&
            penaltyDetails.warning_messages.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Important Information
                  </h3>
                </div>
                <div className="space-y-3">
                  {penaltyDetails.warning_messages.map((message, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm"
            >
              {penaltyDetails.cancellation_analysis?.penalty_applicable
                ? `Proceed with ₹${penaltyDetails.penalty_details?.penalty_amount} Penalty`
                : "Proceed with Cancellation"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PenaltyDetailsModal;
