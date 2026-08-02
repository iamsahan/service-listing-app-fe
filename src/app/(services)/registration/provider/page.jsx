"use client";
import React, { useState } from "react";
import Image from "next/image";
import IndividualProviderInquiryForm from "@components/forms/InquiryForms/IndividualProviderInquiryForm";
import BusinessProviderInquiryForm from "@components/forms/InquiryForms/BusinessProviderInquiryForm";
import { Badge } from "@/components/ui/badge";
import RegistrationSectionMain from "@/components/registration/SectionMain";
import GetStartedSection from "@/components/registration/GetStarted";
import { Sparkles, Users, Award, Briefcase } from "lucide-react";

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
    <div className="pb-24">
      {/* Full-width brand hero */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/provider-arrive.jpg"
            alt="Registration Illustration"
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
        </div>

        <div className="absolute -top-24 -right-16 w-[420px] h-[420px] bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-[380px] h-[380px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative container mx-auto px-6 max-w-7xl pt-16 pb-28 md:pt-24 md:pb-36 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-emerald-400 mx-auto mb-6">
            <Award className="size-3.5 text-amber-400" />
            Trusted by 1,000+ partners
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight max-w-3xl mx-auto">
            Scale your earnings <br />
            with <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent">ProHive</span>
          </h1>

          <p className="text-neutral-300 max-w-xl mx-auto leading-relaxed text-sm sm:text-base mt-5">
            Register as an independent pro or service business. Gain access to verified
            customers, set your timings, and receive secure payouts automatically.
          </p>

          <div className="flex items-center justify-center gap-10 sm:gap-14 pt-10 mt-10 border-t border-white/10 max-w-lg mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">1,000+</div>
              <div className="text-neutral-400 text-xs uppercase font-bold tracking-wider mt-1">Active Pros</div>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">50K+</div>
              <div className="text-neutral-400 text-xs uppercase font-bold tracking-wider mt-1">Completed Jobs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating registration card */}
      <div className="container mx-auto px-6 max-w-3xl -mt-16 md:-mt-20 relative z-10">
        <div className="bg-white border border-neutral-200/60 shadow-2xl rounded-[2.5rem] p-6 sm:p-10">
          {/* Header info */}
          <div className="mb-8 text-left">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Provider Application
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-2.5">
              Apply as a Specialist
            </h2>
            <p className="text-neutral-500 text-sm">
              Choose your registration track below and input credentials to open your account.
            </p>
          </div>

          {/* Selector Segment Tabs */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 border border-neutral-200/50 rounded-2xl">
              <button
                onClick={() => setProviderType("individual")}
                className={`px-6 py-3 text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  providerType === "individual"
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Users className="size-4" />
                Individual
              </button>

              <button
                onClick={() => setProviderType("business")}
                className={`px-6 py-3 text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  providerType === "business"
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Briefcase className="size-4" />
                Business
              </button>
            </div>
          </div>

          {/* Render form templates dynamically */}
          <div className="bg-neutral-50/30 border border-neutral-100 p-6 rounded-3xl">
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

      <div className="container mx-auto px-6 max-w-7xl space-y-24 mt-24">
        <RegistrationSectionMain />
        <GetStartedSection />
      </div>
    </div>
  );
};

export default ProviderReg;
