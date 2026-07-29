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
    <div className="container mx-auto mt-24 mb-16 space-y-24 px-6 max-w-7xl">
      <style>{`
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px),
                            linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
        }
      `}</style>

      {/* Main Registration Layout Wrapper */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
        
        {/* Left Side: Premium Illustration Cover Card */}
        <div className="relative w-full lg:w-1/2 min-h-[350px] lg:min-h-full overflow-hidden rounded-[2.5rem] border border-neutral-200/60 shadow-2xl flex flex-col justify-end">
          <div className="absolute inset-0">
            <Image
              src="/assets/images/provider-arrive.jpg"
              alt="Registration Illustration"
              fill
              className="object-cover scale-105 hover:scale-100 transition-transform duration-700"
              priority
            />
            {/* Dark gradient screens overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            {/* Glowing Accent Blobs */}
            <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse" />
          </div>

          {/* Cover card textual content */}
          <div className="relative z-10 hidden lg:flex flex-col justify-end h-full text-white px-12 pb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-emerald-400 w-fit">
              <Award className="size-3.5 text-amber-400" />
              Trusted by 1000+ partners
            </div>

            <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-white">
              Scale Your Earnings <br />
              with <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent">ProHive</span>
            </h2>

            <p className="text-neutral-300 max-w-sm leading-relaxed text-sm">
              Register as an independent pro or service business. Gain access to verified customers, set your timings, and receive secure payouts automatically.
            </p>

            {/* Counters */}
            <div className="flex gap-8 pt-6 border-t border-white/10 w-fit">
              <div>
                <div className="text-2xl font-black text-white">1,000+</div>
                <div className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Active Pros</div>
              </div>
              <div className="w-[1px] bg-white/15" />
              <div>
                <div className="text-2xl font-black text-white">50K+</div>
                <div className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Completed Jobs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Forms Selector Card */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center">
          <div className="w-full max-w-2xl mx-auto px-2 sm:px-6 lg:px-12 flex flex-col">
            
            {/* Header info */}
            <div className="mb-10 text-left">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Provider Application
                </span>
              </div>
              <h1 className="text-3xl font-black text-neutral-900 mb-2.5">
                Apply as a Specialist
              </h1>
              <p className="text-neutral-500 text-sm">
                Choose your registration track below and input credentials to open your account.
              </p>
            </div>

            {/* Selector Segment Tabs */}
            <div className="mb-8 flex-shrink-0">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 border border-neutral-200/50 rounded-2xl">
                <button
                  onClick={() => setProviderType("individual")}
                  className={`px-6 py-3 text-xs uppercase font-bold tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    providerType === "individual"
                      ? "bg-white text-black shadow-sm"
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
                      ? "bg-white text-black shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Briefcase className="size-4" />
                  Business
                </button>
              </div>
            </div>

            {/* Render form templates dynamically */}
            <div className="flex-1 bg-neutral-50/30 border border-neutral-100 p-6 rounded-3xl">
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
