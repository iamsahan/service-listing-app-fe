"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Target,
  Clock,
  AlertTriangle,
  MapPin,
  Zap,
  AlertCircle,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { providerAPI } from "@/api/provider";
import ConfirmationModal from "@/components/serviceProvider/modals/ConfirmationModal";
import RejectBookingModal from "@/components/serviceProvider/modals/RejectBookingModal";
import EmployeeSelectionModal from "@/components/serviceProvider/modals/EmployeeSelectionModal";

const BookingAssignmentDialog = ({
  assignmentData,
  isAssignmentDialogOpen,
  assignmentCountdown,
  isProcessingAssignment,
  onClose,
  setIsProcessingAssignment,
}) => {
  // State for confirmation modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingToReject, setBookingToReject] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // State for employee selection (business service providers)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [user, setUser] = useState(null);
  const [providerId, setProviderId] = useState(null);

  // Get user role on component mount
  useEffect(() => {
    const fetchUserRole = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userData = storedUser ? JSON.parse(storedUser) : null;

        // Only set user if role is service_provider or business_service_provider
        if (
          userData?.role === "service_provider" ||
          userData?.role === "business_service_provider"
        ) {
          setUser(userData);
          setProviderId(userData?.providerId);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  // Assignment action handlers - same pattern as provider orders page
  const handleOrderAcceptence = async (booking) => {
    try {
      setSelectedBooking(booking);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error handling booking acceptance:", error);
    }
  };

  const handleOrderRejection = async (booking) => {
    try {
      setBookingToReject(booking);
      setShowRejectModal(true);
    } catch (error) {
      console.error("Error handling booking rejection:", error);
    }
  };

  // Actual API call for accepting booking - same as provider orders page
  const handleConfirmation = async () => {
    if (!selectedBooking?.bookingId) return;

    try {
      if (user?.role === "business_service_provider") {
        const employeesResponse = await providerAPI.getAvailableEmployees(
          providerId,
          selectedBooking.bookingId,
          selectedBooking.booking_date,
          selectedBooking.start_time,
          selectedBooking.end_time
        );

        setAvailableEmployees(employeesResponse.data.availableEmployees);
        setCurrentBookingId(selectedBooking.bookingId);
        setShowEmployeeModal(true);
      } else {
        setIsProcessingAssignment(true);
        await providerAPI.acceptProviderBookings(selectedBooking.bookingId, {
          providerId: providerId,
        });

        toast({
          title: "Assignment Accepted",
          description: `You have successfully accepted booking ${selectedBooking.bookingId}`,
          variant: "default",
        });

        setSelectedBooking(null);
        
        // Emit custom event to notify orders page to refresh
        window.dispatchEvent(new CustomEvent('booking-accepted', { 
          detail: { bookingId: selectedBooking.bookingId } 
        }));
        
        // Wait a bit before closing to ensure backend has processed
        setTimeout(() => {
          onClose?.();
        }, 1000);
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to accept assignment",
        variant: "destructive",
      });
    } finally {
      if (user?.role !== "business_service_provider") {
        setIsProcessingAssignment(false);
      }
    }
    setShowConfirmationModal(false);
  };

  // Handle employee confirmation for business service providers
  const handleEmployeeConfirmation = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingAssignment(true);
    try {
      await providerAPI.acceptProviderBookings(currentBookingId, {
        employee_id: selectedEmployee,
        providerId: providerId,
      });

      toast({
        title: "Assignment Accepted",
        description: `You have successfully accepted booking ${currentBookingId}`,
        variant: "default",
      });

      setShowEmployeeModal(false);
      setSelectedEmployee(null);
      setCurrentBookingId(null);
      setSelectedBooking(null);
      
      // Emit custom event to notify orders page to refresh
      window.dispatchEvent(new CustomEvent('booking-accepted', { 
        detail: { bookingId: currentBookingId } 
      }));
      
      // Wait a bit before closing to ensure backend has processed
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to accept assignment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAssignment(false);
    }
  };

  // Actual API call for rejecting booking - same as provider orders page
  const handleConfirmReject = async () => {
    if (!bookingToReject?.bookingId) return;

    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingAssignment(true);
    try {
      await providerAPI.RejectProviderBookings(bookingToReject.bookingId, {
        providerId: providerId,
        rejectionReason: rejectionReason.trim(),
      });

      toast({
        title: "Assignment Rejected",
        description: `You have rejected booking ${bookingToReject.bookingId}`,
        variant: "default",
      });

      setShowRejectModal(false);
      setRejectionReason("");
      setBookingToReject(null);
      
      // Emit custom event to notify orders page to refresh
      window.dispatchEvent(new CustomEvent('booking-rejected', { 
        detail: { bookingId: bookingToReject.bookingId } 
      }));
      
      // Wait a bit before closing to ensure backend has processed
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (error) {
      console.error("Error rejecting assignment:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reject assignment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAssignment(false);
    }
  };

  const handleAcceptAssignment = useCallback(() => {
    if (!assignmentData?.bookingId || isProcessingAssignment) return;
    handleOrderAcceptence(assignmentData);
  }, [assignmentData, isProcessingAssignment]);

  const handleRejectAssignment = useCallback(() => {
    if (!assignmentData?.bookingId || isProcessingAssignment) return;
    handleOrderRejection(assignmentData);
  }, [assignmentData, isProcessingAssignment]);

  if (!assignmentData) return null;

  return (
    <>
      <Dialog
        open={isAssignmentDialogOpen}
        onOpenChange={isProcessingAssignment ? undefined : onClose}
      >
        <DialogContent
          className="w-full max-w-md bg-white"
          onEscapeKeyDown={(e) => isProcessingAssignment && e.preventDefault()}
          onPointerDownOutside={(e) =>
            isProcessingAssignment && e.preventDefault()
          }
        >
          <DialogHeader className="space-y-4 pb-4">
            <DialogTitle className="text-2xl font-bold text-black flex items-center gap-3">
              <div className="p-3 rounded-full bg-indigo-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              New Booking Assignment
              {assignmentCountdown && assignmentCountdown <= 30 && (
                <AlertTriangle className="h-6 w-6 animate-pulse text-red-500" />
              )}
            </DialogTitle>

            <DialogDescription className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                  <p className="text-xl font-bold text-indigo-500">
                    #{assignmentData.bookingId}
                  </p>
                </div>

                {assignmentCountdown !== null && assignmentCountdown > 0 && (
                  <div className="text-center mb-4">
                    <div
                      className={`px-6 py-4 rounded-xl inline-block transition-all duration-300 ${
                        assignmentCountdown <= 30
                          ? "bg-red-500 text-white animate-pulse shadow-lg"
                          : "bg-indigo-500 text-white"
                      }`}
                    >
                      <div className="text-3xl font-bold flex items-center justify-center gap-2 mb-1">
                        <Clock className="h-6 w-6" />
                        {Math.floor(assignmentCountdown / 60)}:
                        {(assignmentCountdown % 60).toString().padStart(2, "0")}
                      </div>
                      <div className="text-sm font-medium">
                        {assignmentCountdown <= 30
                          ? "URGENT: Time running out!"
                          : "Time remaining"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  {assignmentCountdown <= 30 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg animate-pulse">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <span className="text-red-600 font-bold">
                        Assignment will auto-expire soon!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-4 pt-6">
            {/* <Button
              variant="outline"
              onClick={handleRejectAssignment}
              disabled={isProcessingAssignment}
              className="flex-1 h-12 border-2 border-gray-200 text-black hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 font-semibold"
            >
              {isProcessingAssignment ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <X className="h-5 w-5 mr-2" />
                  Reject
                </>
              )}
            </Button> */}

            <Button
              onClick={handleAcceptAssignment}
              disabled={isProcessingAssignment}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isProcessingAssignment ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Accept Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modals - same pattern as provider orders page */}
      <ConfirmationModal
        open={showConfirmationModal}
        onCancel={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmation}
      />
      <RejectBookingModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        booking={bookingToReject}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirm={handleConfirmReject}
      />
      <EmployeeSelectionModal
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        employees={availableEmployees}
        selectedEmployee={selectedEmployee}
        onSelect={setSelectedEmployee}
        onConfirm={handleEmployeeConfirmation}
      />
    </>
  );
};

export default BookingAssignmentDialog;
