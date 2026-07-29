"use client";
import { providerAPI } from "@/api/provider";
import { DockIcon, ImageIcon } from "lucide-react";
import React, { useState } from "react";
import {
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaUpload,
} from "react-icons/fa";
import FilePreviewModel from "../FilePreviewModel";
import { useAuth } from "@/src/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const ProviderDocuments = ({ provider }) => {
  const { user } = useAuth();
  const [currentFile, setCurrentFile] = useState(null);
  const [documents, setDocuments] = useState(
    provider?.ServiceProviderDocuments || []
  );
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [uploadMetadata, setUploadMetadata] = useState({
    verification_notes: "Document updated by admin",
  });

  // Document types for dropdown
  const documentTypes = [
    { value: "id_proof", label: "ID Proof" },
    { value: "aadhar", label: "Aadhar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "address_proof", label: "Address Proof" },
    { value: "qualification_proof", label: "Qualification Proof" },
    { value: "service_certificate", label: "Service Certificate" },
    { value: "license", label: "License" },
    { value: "logo", label: "Profile Picture" },
    { value: "business_registration", label: "Business Registration" },
    { value: "insurance", label: "Insurance" },
    { value: "agreement", label: "Agreement" },
    { value: "terms_acceptance", label: "Terms Acceptance" },
  ];

  if (!documents.length) {
    return <p className="text-gray-500 text-center">No documents available.</p>;
  }

  const isImage = (url) => /\.(jpg|jpeg|png|webp)$/i.test(url);
  const isPDF = (url) => /\.pdf$/i.test(url);

  // Handle file selection and preview generation
  const handleFileSelect = (file) => {
    setSelectedFile(file);

    if (file) {
      const fileURL = URL.createObjectURL(file);
      setFilePreview({
        url: fileURL,
        type: file.type,
        name: file.name,
        size: file.size,
      });
    } else {
      setFilePreview(null);
    }
  };

  // Clean up preview URL when dialog closes
  const resetUploadDialog = () => {
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
    setShowUploadDialog(false);
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedDocumentType("");
    setUploadMetadata({
      verification_notes: "Document updated by admin",
    });
  };

  const getStatusBadge = (status) => {
    const lowerStatus = status?.toLowerCase();
    const statuses = {
      verified: {
        color: "bg-green-100 text-green-800 border-green-400",
        icon: <FaCheckCircle className="mr-1 text-green-600" />,
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-400",
        icon: <FaClock className="mr-1 text-yellow-600" />,
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-400",
        icon: <FaTimesCircle className="mr-1 text-red-600" />,
      },
    };

    return (
      statuses[lowerStatus] || {
        color: "bg-gray-100 text-gray-800 border-gray-400",
        icon: null,
      }
    );
  };

  // Admin upload function for provider documents
  const handleAdminUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDocumentType) {
      toast({
        title: "Error",
        description: "Please select a document type.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingFile(true);

      const formData = new FormData();

      // Append the file
      formData.append("document", selectedFile);

      // Append document metadata according to the API structure
      formData.append("document_type", selectedDocumentType);
      formData.append("verification_notes", uploadMetadata.verification_notes);

      const response = await providerAPI.uploadProviderDocument(
        provider.provider_id,
        formData
      );

      if (response?.data) {
        toast({
          title: "Success!",
          description: "Document uploaded successfully.",
          variant: "default",
        });

        // Update the documents list with the new document
        if (response.data.document) {
          setDocuments((prev) => {
            // Check if document type already exists, update it, otherwise add new
            const existingIndex = prev.findIndex(
              (doc) => doc.document_type === selectedDocumentType
            );

            if (existingIndex !== -1) {
              // Update existing document
              const updatedDocs = [...prev];
              updatedDocs[existingIndex] = {
                ...updatedDocs[existingIndex],
                ...response.data.document,
              };
              return updatedDocs;
            } else {
              // Add new document
              return [...prev, response.data.document];
            }
          });
        }

        // Reset dialog and metadata
        resetUploadDialog();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to upload document.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <>
      <div className=" mx-auto p-10">
        {/* Admin Upload Button */}
        {user?.role === "admin" && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              title="Upload new document as admin"
            >
              <FaUpload />
              Upload Document
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => {
            const documentUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}${doc.document_url}`;
            const statusBadge = getStatusBadge(doc.verification_status);

            return (
              <div
                key={doc.document_id}
                className="border rounded-lg shadow-md bg-white p-5 transition-transform transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {isImage(doc.document_url) && (
                      <ImageIcon className="w-6 h-6" />
                    )}
                    {isPDF(doc.document_url) && (
                      <DockIcon className="w-6 h-6 text-red-500" />
                    )}
                    <p className="font-medium text-gray-900 capitalize">
                      {doc.document_type.replace("_", " ")}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${statusBadge.color} flex items-center`}
                  >
                    {statusBadge.icon}
                    {doc.verification_status}
                  </span>
                </div>

                {/* Document Preview */}
                <div className="mb-4">
                  {isImage(doc.document_url) ? (
                    <img
                      src={documentUrl}
                      crossOrigin="anonymous"
                      alt={doc.document_type}
                      className="w-full h-40 object-cover rounded-lg shadow-sm"
                    />
                  ) : isPDF(doc.document_url) ? (
                    <embed
                      src={documentUrl}
                      type="application/pdf"
                      width="100%"
                      height="160px"
                      className="rounded-lg shadow-sm"
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Preview not available for this file type.
                    </p>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <span
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    onClick={() => setCurrentFile(doc)}
                  >
                    <FaEye />
                  </span>

                  <a
                    href={documentUrl}
                    download
                    className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FaDownload />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentFile && (
        <FilePreviewModel
          isOpen={!!currentFile}
          type={currentFile.document_url.includes(".pdf") ? "pdf" : "image"}
          previewURL={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${currentFile.document_url}`}
          onOpenChange={() => setCurrentFile(null)}
        />
      )}

      {/* Admin Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>

            <div className="space-y-4">
              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Selection */}
              <div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Document File *
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleFileSelect(file);
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    required
                  />
                </div>

                {selectedFile && (
                  <div className="mt-3">
                    <p className="text-sm text-green-600 mb-2">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>

                    {/* File Preview */}
                    {filePreview && (
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Preview:
                        </p>
                        {filePreview.type.startsWith("image/") ? (
                          <img
                            src={filePreview.url}
                            alt="File preview"
                            className="max-w-full h-32 object-contain rounded border"
                          />
                        ) : filePreview.type === "application/pdf" ? (
                          <div className="flex items-center justify-center h-32 bg-red-100 rounded border">
                            <div className="text-center">
                              <DockIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <p className="text-sm text-red-700">
                                PDF Document
                              </p>
                              <p className="text-xs text-gray-600">
                                {filePreview.name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 bg-gray-100 rounded border">
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                              <p className="text-sm text-gray-700">Document</p>
                              <p className="text-xs text-gray-600">
                                {filePreview.name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Notes
                </label>
                <textarea
                  value={uploadMetadata.verification_notes}
                  onChange={(e) =>
                    setUploadMetadata((prev) => ({
                      ...prev,
                      verification_notes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Enter verification notes"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={resetUploadDialog}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                disabled={uploadingFile}
              >
                Cancel
              </button>
              <button
                onClick={handleAdminUpload}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                disabled={
                  uploadingFile || !selectedFile || !selectedDocumentType
                }
              >
                {uploadingFile ? "Updating..." : "Update"}
              </button>
            </div>

            {uploadingFile && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-purple-600 bg-purple-100">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderDocuments;
