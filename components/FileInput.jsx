"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import FilePreviewModel from "./FilePreviewModel";

const FileInput = ({
  name,
  label,
  required = false,
  file,
  onFileChange,
  disabled,
  onFileRemove,
}) => {
  const [previewURL, setPreviewURL] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewURL(null);
      return;
    }

    // Handle case where file is a URL string (from API)
    if (typeof file === "string") {
      // If it's a relative path from API, prepend backend endpoint
      const properURL = file.startsWith("http")
        ? file
        : `${process.env.NEXT_PUBLIC_API_ENDPOINT}${file}`;
      setPreviewURL(properURL);
      return;
    }

    // Handle case where file is a File object (newly uploaded)
    const objectUrl = URL.createObjectURL(file);
    setPreviewURL(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selected.size > maxSize) {
      toast({
        title: "File too large",
        description: "Select a file under 5MB.",
        variant: "destructive",
      });
      return;
    }

    onFileChange(e);
    e.target.value = null;
  };

  const handleRemove = () => {
    onFileRemove?.();
    if (inputRef.current) inputRef.current.value = null;
    setPreviewURL(null);
  };

  const getSafeFileName = (file) => {
    if (!file) return "";
    const name = typeof file === "string" ? file.split("/").pop() : file.name;

    if (name.length <= 20) return name;

    const extIndex = name.lastIndexOf(".");
    const extension = extIndex !== -1 ? name.slice(extIndex) : "";
    const baseName = name.slice(0, extIndex !== -1 ? extIndex : name.length);
    return `${baseName.slice(0, 15)}...${extension}`;
  };

  return (
    <div className="space-y-2 w-full">
      <label>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-center gap-3">
        {/* Preview Section */}
        {file && previewURL && (
          <div
            className="w-28 h-28 shrink-0 relative cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {(() => {
              // Determine file type for both File objects and URL strings
              let fileType = "";
              if (typeof file === "string") {
                // Extract type from URL extension
                const extension = file.split(".").pop()?.toLowerCase();
                if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
                  fileType = "image";
                } else if (extension === "pdf") {
                  fileType = "pdf";
                }
              } else {
                // Use File object's type property
                fileType = file.type;
              }

              if (fileType.includes("image")) {
                return (
                  <img
                    src={previewURL}
                    crossOrigin="anonymous"
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                );
              } else if (fileType.includes("pdf")) {
                return (
                  <img
                    src="/assets/images/pdf-icon.png"
                    alt="pdf"
                    className="w-full h-full object-fit"
                  />
                );
              } else {
                return (
                  <img
                    src="/assets/images/docx_icon.png"
                    alt="doc"
                    className="w-full h-full object-fit"
                  />
                );
              }
            })()}
          </div>
        )}

        {/* File Action Section */}
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            {file ? "Change File" : "Upload File"}
          </Button>

          {file && (
            <>
              <span className="text-sm">{getSafeFileName(file)}</span>

              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-red-500 text-left"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        name={name}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Modal Preview */}
      {file && (
        <FilePreviewModel
          isOpen={isModalOpen}
          type={typeof file === "string" ? undefined : file.type}
          previewURL={previewURL}
          onOpenChange={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default FileInput;
