"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  Copy,
  Users,
  Building,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { ticketAPI } from "@/api/ticketService";
import SectionBadge from "@/components/home/SectionBadge";

const whatsappLink = "https://wa.me/+916301614932";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name || name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!contactNumber || !/^\d{10}$/.test(contactNumber))
      newErrors.contactNumber = "Enter a valid 10-digit number";
    if (!subject || subject.trim().length === 0)
      newErrors.subject = "Subject is required";
    if (!message || message.trim().length < 10)
      newErrors.message = "Message must be at least 10 characters";
    return newErrors;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSuccess("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await ticketAPI.sendContactEmail({
        name,
        mobile: contactNumber,
        subject,
        message,
      });
      setSuccess("Your support ticket has been opened successfully!");
      setName("");
      setContactNumber("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setSuccess("Failed to submit request. Please verify connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("contact@prohive.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white text-neutral-900 min-h-screen">
      {/* Hero Header Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-neutral-950 text-white">
        <div className="absolute top-[-80px] right-[15%] w-[380px] h-[380px] bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-60px] left-[10%] w-[340px] h-[340px] bg-amber-500/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
            Support Center
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
            How can we <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">help you</span> today?
          </h1>

          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Connect with our team to resolve queries, report booking problems, or explore provider partnership workflows.
          </p>
        </div>
      </section>

      {/* Segment Selection Grid (Customer, Partner, Press Paths) */}
      <section className="py-12 relative z-20 -mt-8 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Path 1 */}
          <div className="p-6 bg-white border border-neutral-200 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="size-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="size-5" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 group-hover:text-emerald-600 transition-colors">Booking Support</h3>
            <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
              Need assistance with ongoing orders, refunds, cancellations, or rescheduling?
            </p>
            <a href="#message-board" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-800 hover:text-black uppercase tracking-wider mt-4">
              Open ticket
              <ArrowRight className="size-3.5 text-emerald-500" />
            </a>
          </div>

          {/* Path 2 */}
          <div className="p-6 bg-white border border-neutral-200 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="size-10 bg-amber-50 border border-amber-100 text-amber-500 rounded-xl flex items-center justify-center mb-4">
              <Building className="size-5" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 group-hover:text-amber-500 transition-colors">Become a Partner</h3>
            <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
              Want to scale your business, manage listings, or set up provider commission payouts?
            </p>
            <a href="/registration/provider" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-800 hover:text-black uppercase tracking-wider mt-4">
              Join ProHive
              <ArrowRight className="size-3.5 text-amber-500" />
            </a>
          </div>

          {/* Path 3 */}
          <div className="p-6 bg-white border border-neutral-200 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="size-10 bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 group-hover:text-neutral-800 transition-colors">Trust & Safety</h3>
            <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
              Report policy violations, query escrow rules, or verify provider background standards.
            </p>
            <a href="#message-board" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-800 hover:text-black uppercase tracking-wider mt-4">
              Submit report
              <ArrowRight className="size-3.5 text-neutral-500" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Split Grid Section */}
      <section id="message-board" className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Side: Help Desk Dashboard */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="space-y-4">
                <SectionBadge>Get in touch</SectionBadge>
                <h2 className="text-3xl font-extrabold tracking-tight">Direct Helpdesk</h2>
                
                {/* Average response indicator */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Average response: 8 minutes
                </div>
              </div>

              {/* Direct channels */}
              <div className="space-y-4">
                {/* Phone */}
                <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-white border border-neutral-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Direct Call</span>
                    <p className="font-extrabold text-sm text-neutral-900">+91 63016 14932</p>
                  </div>
                </div>

                {/* WhatsApp Chat Link */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center justify-between gap-4 hover:border-emerald-500/20 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-white border border-neutral-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                      <MessageSquare className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">WhatsApp Chat</span>
                      <p className="font-extrabold text-sm text-neutral-900 group-hover:text-emerald-600 transition-colors">Start Conversation</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-neutral-400 group-hover:translate-x-1.5 transition-transform text-emerald-500" />
                </a>

                {/* Email with copy hook */}
                <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-white border border-neutral-200 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Official Support</span>
                      <p className="font-extrabold text-sm text-neutral-900">contact@prohive.com</p>
                    </div>
                  </div>
                  <button
                    onClick={copyEmail}
                    className="p-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black transition-colors"
                    title="Copy email to clipboard"
                  >
                    {copied ? (
                      <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Work Hours Alert */}
              <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex items-start gap-3">
                <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-neutral-800">Support Availability</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Chat & phone lines are staffed Mon-Sat, 9:00 AM - 6:00 PM IST. Tickets opened outside these hours are checked first thing in the morning.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Message Submission Form Card */}
            <div className="lg:col-span-7 bg-white p-8 border border-neutral-200 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
              
              <form className="space-y-6 relative z-10 text-left" onSubmit={handleSendMessage}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className={`w-full p-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm ${
                        errors.name
                          ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                          : "border-neutral-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({
                          ...prev,
                          name:
                            e.target.value.trim().length < 2
                              ? "Name must be at least 2 characters"
                              : "",
                        }));
                      }}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[11px] mt-1 pl-2">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone Input with +91 Block */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 font-semibold text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        placeholder="10-digit mobile"
                        className={`w-full pl-14 p-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm ${
                          errors.contactNumber
                            ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                            : "border-neutral-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                        }`}
                        value={contactNumber}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setContactNumber(value);
                          setErrors((prev) => ({
                            ...prev,
                            contactNumber: /^\d{10}$/.test(value)
                              ? ""
                              : "Enter a valid 10-digit number",
                          }));
                        }}
                      />
                    </div>
                    {errors.contactNumber && (
                      <p className="text-red-500 text-[11px] mt-1 pl-2">
                        {errors.contactNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Booking support, payout question..."
                    className={`w-full p-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.subject
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-neutral-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        subject:
                          e.target.value.trim().length === 0
                            ? "Subject is required"
                            : "",
                      }));
                    }}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-[11px] mt-1 pl-2">{errors.subject}</p>
                  )}
                </div>

                {/* Message Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider pl-1">Message</label>
                  <textarea
                    rows="5"
                    placeholder="Describe your inquiry in detail (minimum 10 characters)..."
                    className={`w-full p-4 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.message
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-neutral-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        message:
                          e.target.value.trim().length < 10
                            ? "Message must be at least 10 characters"
                            : "",
                      }));
                    }}
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-[11px] mt-1 pl-2">{errors.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                >
                  {loading ? "Opening ticket..." : "Open Support Ticket"}
                </button>

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm mt-3 font-semibold justify-center">
                    <CheckCircle className="size-4 shrink-0 text-emerald-600" />
                    {success}
                  </div>
                )}
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Map location and address card */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-neutral-100 text-left">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Map details Card */}
          <div className="lg:col-span-4 space-y-6">
            <SectionBadge>HQ Location</SectionBadge>
            <h2 className="text-3xl font-extrabold tracking-tight">Visit Our Office</h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-neutral-800">Physical Address</h4>
                  <p className="text-neutral-500 text-xs leading-relaxed">
                    Kondapur Main Road, Sri Sarath Willow Block,<br />
                    Hyderabad, TS, India
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="size-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-neutral-800">Transit Guidelines</h4>
                  <p className="text-neutral-500 text-xs leading-relaxed">
                    Located 10 minutes walk from Hitech City Metro Station. Visitor parking slots are available inside the gate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Embed Map Frame */}
          <div className="lg:col-span-8 w-full h-80 rounded-[2.5rem] overflow-hidden border border-neutral-200 shadow-xl">
            <iframe
              title="Company Location"
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d237.87756317054357!2d78.35291242842558!3d17.45775111179087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93cd441d8f91%3A0x429199c24dc933c3!2sSri%20Sarath%20Willow!5e0!3m2!1sen!2ssg!4v1761890489420!5m2!1sen!2ssg"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
