"use client";

import React from "react";
import mammoth from "mammoth";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";

export default function TermsAndConditionsDialog({ trigger }) {
  const [html, setHtml] = React.useState("");

  React.useEffect(() => {
    const loadDocx = async () => {
      try {
        const response = await fetch("/assets/docs/terms.docx");
        const arrayBuffer = await response.arrayBuffer();

        const result = await mammoth.convertToHtml({ arrayBuffer });
        const cleanHtml = DOMPurify.sanitize(result.value);
        setHtml(cleanHtml);
      } catch (error) {
        console.error("Failed to load or convert DOCX file:", error);
      }
    };

    loadDocx();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] rounded-lg md:max-w-xl">
        <DialogHeader className="space-y-6">
          <DialogTitle className="font-bold text-xl">
            Terms and Conditions
          </DialogTitle>
          <DialogDescription className="text-left">
            <div
              className="docx-html prose prose-indigo text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
