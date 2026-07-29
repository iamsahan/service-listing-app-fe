"use client";
import React, { useState } from "react";
import Image from "next/image";
import IndividualProviderInquiryForm from "@components/forms/InquiryForms/IndividualProviderInquiryForm";
import BusinessProviderInquiryForm from "@components/forms/InquiryForms/BusinessProviderInquiryForm";
import { Badge } from "@/components/ui/badge";
import RegistrationSectionMain from "@/components/registration/SectionMain";
import GetStartedSection from "@/components/registration/GetStarted";

const ProviderReg = () => {
  const [providerType, setProviderType] = useState("individual");
  const [individualFormData, setIndividualFormData] = useState({
    type: "individual",
    name: "",
    email: "",
    mobile: "",
    gender: "",
    business_type: "individual",
    dob: "",
    years_experience: 0,
    categories: [],
    cities: [],
    location: "",
    skills: "",
  });

  const [businessFormData, setBusinessFormData] = useState({
    type: "business",
    business_name: "",
    name: "", // Authorized Person Name
    mobile: "", // Authorized Person Contact
    email: "",
    gender: "", // Authorized Person Gender
    dob: "",
    business_type: "sole_proprietorship",
    website: "",
    location: "",
    categories: [],
    cities: [],
    no_of_employee: "",
  });

  const handleIndividualFormDataChange = (data) => {
    setIndividualFormData(data);
  };

  const handleBusinessFormDataChange = (data) => {
    setBusinessFormData(data);
  };

  return (
    <div className="container mx-auto my-10 space-y-20 px-5">
      <div className="flex flex-col gap-10 lg:gap-0 lg:flex-row">
        {/* Left */}
        <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-full overflow-hidden rounded-xl">
          <div className="absolute inset-0">
            <Image
              src="/assets/images/provider-arrive.jpg"
              alt="Registration Illustration"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-700"
              priority
            />
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

          {/* Text with enhanced animations */}
          <div className="relative z-10 hidden lg:flex flex-col justify-end h-full text-white px-12 pb-16 space-y-6">
            <Badge className="mb-2 w-fit bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25 transition-all duration-300 px-4 py-1.5 text-sm font-medium shadow-lg">
              ✨ Trusted by 1000+ providers
            </Badge>
            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Grow Your Business
              <br />
              <span className="text-white/90">with Us</span>
            </h2>
            <p className="text-white/80 max-w-lg leading-relaxed text-base">
              Join our trusted platform and connect with thousands of customers
              looking for quality services.
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-white/70 text-sm">Active Providers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-white/70 text-sm">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="w-full lg:w-1/2 bg-white overflow-y-auto flex flex-col justify-center">
          <div className="w-full max-w-2xl mx-auto px-2 sm:px-8 lg:px-16 flex flex-col">
            {/* Header */}
            <div className="mb-10 flex-shrink-0">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-full">
                <div className="size-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                  Get Started
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Register as a Service Provider
              </h1>
              <p className="text-gray-500 text-base">
                Choose your provider type and fill in your details
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-8 flex-shrink-0">
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setProviderType("individual")}
                  className={`relative px-6 py-3.5 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    providerType === "individual"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Individual
                </button>

                <button
                  onClick={() => setProviderType("business")}
                  className={`relative px-6 py-3.5 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    providerType === "business"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Business
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1">
              {providerType === "individual" ? (
                <IndividualProviderInquiryForm
                  formData={individualFormData}
                  onFormDataChange={handleIndividualFormDataChange}
                />
              ) : (
                <BusinessProviderInquiryForm
                  formData={businessFormData}
                  onFormDataChange={handleBusinessFormDataChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <RegistrationSectionMain />
      <GetStartedSection />
    </div>
  );
};

export default ProviderReg;
