"use client";
import { AuthProvider } from "@src/context/AuthContext";
import { Suspense } from "react";

export default function AuthWrapper({ children }) {
  return (
    <Suspense>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
}
