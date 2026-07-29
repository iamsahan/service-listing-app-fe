"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle } from "lucide-react";
import { providerAPI } from "@/api/provider";
import { toast } from "@/hooks/use-toast";

const BookingStartModal = ({ booking, onConfirm, onClose }) => {
  const [step, setStep] = useState(1); // 1: OTP, 2: Image Upload
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isOtpValid = await providerAPI.bookingStartVerify({
        bookingId: booking.id || booking?.booking_id,
        otp: otp,
      });

      console.log(isOtpValid);

      if (isOtpValid?.data?.success) {
        // Move to image upload step
        setStep(2);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload and start booking
  const handleUploadAndStart = async () => {
    if (!imageFile) {
      setError("Please select an image to upload");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("booking_id", booking.id || booking?.booking_id);
      formData.append("provider_id", booking.provider_id);
      formData.append("image_type", "before");
      if (notes) {
        formData.append("notes", notes);
      }

      const response = await providerAPI.uploadBookingProofImage(formData);

      if (response?.data?.status === "success") {
        toast({
          title: "Success",
          description: "Service proof uploaded successfully",
          variant: "default",
        });

        // Call the onConfirm callback to start the booking
        onConfirm(booking);
        onClose();
      } else {
        setError("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err?.response?.data?.message ||
          "An error occurred during upload. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DialogContent
      className="w-full max-w-[95vw] rounded-lg sm:max-w-md p-6"
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {step === 1 ? "Confirm Booking Start" : "Upload Service Proof"}
        </DialogTitle>
      </DialogHeader>

      {step === 1 ? (
        // Step 1: OTP Verification
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please enter the 6-digit OTP sent to your registered mobile number
            to start the booking.
          </p>

          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            className="text-center text-lg font-semibold"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            className="w-full"
            onClick={handleVerifyOtp}
            disabled={isLoading || !otp || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify OTP
              </>
            )}
          </Button>
        </div>
      ) : (
        // Step 2: Image Upload
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please upload a photo of the service area before starting the work.
          </p>

          <div className="space-y-2">
            <Label htmlFor="proof-image">Before Service Photo *</Label>

            {imagePreview && (
              <div className="relative w-full h-48 mb-2 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={imagePreview}
                  alt="Service proof preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 448px) 100vw, 448px"
                />
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="proof-image"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG (MAX. 5MB)
                  </p>
                </div>
                <Input
                  id="proof-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the service area condition..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
              disabled={isUploading}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleUploadAndStart}
              disabled={isUploading || !imageFile}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Upload & Start Service
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default BookingStartModal;
