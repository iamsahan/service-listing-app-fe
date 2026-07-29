"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
} from "react-icons/fa";
import Image from "next/image";
import { ticketAPI } from "@/api/ticketService";

const whatsappLink = "https://wa.me/+916301614932";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

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
      setSuccess("Message sent successfully!");
      setName("");
      setContactNumber("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setSuccess("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white text-center py-36 px-6"
        style={{ backgroundImage: "url('/assets/images/contact-us.jpg')" }}
      >
        <Image
          src="/assets/images/contact-us.jpg"
          alt="Contact Us"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-4xl sm:text-5xl font-extrabold z-10"
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-lg mt-4 max-w-3xl mx-auto z-10"
        >
          Got a question or need assistance? Reach out to us, and we'll be happy
          to help!
        </motion.p>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center">Get in Touch</h2>
          <p className="text-center text-gray-600 mt-2">
            Fill out the form below, and we'll get back to you as soon as
            possible.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSendMessage}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <input
                  type="text"
                  placeholder="Your Name*"
                  className={`w-full p-3 border rounded-full focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500"
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
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Contact Number Field with +91 Prefix */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Contact Number*"
                    className={`w-full pl-14 p-3 border rounded-full focus:outline-none focus:ring-2 transition-all ${
                      errors.contactNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contactNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <input
                type="text"
                placeholder="Subject*"
                className={`w-full p-3 border rounded-full focus:outline-none focus:ring-2 transition-all ${
                  errors.subject
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500"
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
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <textarea
                rows="5"
                placeholder="Your Message*"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.message
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500"
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
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 rounded-full font-semibold transition-transform transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {success && (
              <p className="text-center text-green-600 mt-2">{success}</p>
            )}
          </form>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="py-16 px-6 md:px-16 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Contact Information</h2>
          <p className="text-gray-600 mt-2">
            You can also reach us through these channels:
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-8">
            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <FaPhoneAlt className="text-blue-600 text-3xl mb-2" />
              <p className="font-semibold mb-1">Phone</p>
              <p className="text-gray-600">+91 63016 14932</p>
            </motion.div>

            {/* WhatsApp */}
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <FaWhatsapp className="text-3xl mb-2 text-green-600" />
              <p className="font-semibold mb-1">WhatsApp</p>
              <p className="text-gray-600">+91 63016 14932</p>
            </motion.a>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <FaEnvelope className="text-3xl mb-2" />
              <p className="font-semibold mb-1">Email</p>
              <p className="text-gray-600">contact@qproz.com</p>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <FaMapMarkerAlt className="text-red-600 text-3xl mb-2" />
              <p className="font-semibold mb-1">Location</p>
              <p className="text-gray-600">Kondapur, Hyderabad</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="py-16 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center">Our Location</h2>
        <div className="mt-8 w-full h-72 rounded-lg overflow-hidden shadow-sm">
          <iframe
            title="Company Location"
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d237.87756317054357!2d78.35291242842558!3d17.45775111179087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93cd441d8f91%3A0x429199c24dc933c3!2sSri%20Sarath%20Willow!5e0!3m2!1sen!2ssg!4v1761890489420!5m2!1sen!2ssg"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
