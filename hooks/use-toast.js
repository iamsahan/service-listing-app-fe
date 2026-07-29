"use client";
import React from "react";
import { toast as sonnerToast } from "sonner";

function toast({ title, description, variant, ...props }) {
  const options = {
    description,
    ...props,
  };

  if (variant === "destructive") {
    sonnerToast.error(title || description, options);
  } else {
    sonnerToast.success(title || description, options);
  }

  return {
    id: String(Math.random()),
    dismiss: () => {},
    update: () => {},
  };
}

function useToast() {
  return {
    toast,
    toasts: [],
    dismiss: () => {},
  };
}

export { useToast, toast };
