"use client";

export default function ProviderprofileHeader({ title }) {
  return (
    <header className="mb-6 border-b pb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-500 text-sm mt-1">
        Manage your account settings below.
      </p>
    </header>
  );
}
