"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { documentAPI } from "@/api/documentService";
import { Loader2, AlertCircle } from "lucide-react";

const PolicyPage = ({ documentType, title, mobileMode = false }) => {
  const [html, setHtml] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [documentTitle, setDocumentTitle] = React.useState(title);

  React.useEffect(() => {
    const loadDocument = async () => {
      try {
        console.log(
          "PolicyPage: Starting document load for type:",
          documentType
        );
        setLoading(true);
        setError(null);

        console.log("PolicyPage: Making API call to getPublicDocument...");
        const response = await documentAPI.getPublicDocument(documentType);
        console.log("PolicyPage: API response received:", response);

        if (response.data.data?.document) {
          console.log("PolicyPage: Document found, setting content");
          setHtml(response.data.data.document.content);
          setDocumentTitle(response.data.data.document.title || title);
        } else {
          console.error("PolicyPage: No document found in response");
          throw new Error("Document not found");
        }
      } catch (error) {
        console.error("PolicyPage: Failed to load document:", error);
        console.error("PolicyPage: Error details:", error.response);
        setError(
          error.response?.data?.data?.message || "Failed to load document"
        );
      } finally {
        setLoading(false);
      }
    };

    if (documentType) {
      console.log("PolicyPage: Document type provided:", documentType);
      loadDocument();
    } else {
      console.warn("PolicyPage: No document type provided");
    }
  }, [documentType, title]);

  if (loading) {
    return (
      <div
        className={cn("min-h-screen flex items-center justify-center", {
          "bg-gray-100": !mobileMode,
        })}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn("min-h-screen flex items-center justify-center", {
          "bg-gray-100": !mobileMode,
        })}
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Document Not Available
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            {error}. Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("min-h-screen", {
        "bg-gray-100 py-10 px-4 sm:px-6 lg:px-8": !mobileMode,
      })}
    >
      <div
        className={cn(
          "container mx-auto p-6 sm:p-8 lg:p-12 prose prose-indigo",
          {
            "mt-10 rounded-lg shadow-lg bg-white": !mobileMode,
          }
        )}
      >
        <h1 className="text-center">{title}</h1>
        <div className="docx-html" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default PolicyPage;
