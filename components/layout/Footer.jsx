"use client";

import Link from "next/link";
import { BiWorld } from "react-icons/bi";
import { FaFacebook, FaLinkedin, FaInstagram, FaTwitter } from "react-icons/fa";
import Image from "next/image";

const sections = [
  {
    title: "QProz Jobs",
    items: [
      {
        name: "Become A Provider",
        url: "/registration/provider",
      },
      { name: "Book Service", url: "/login/user" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { name: "Home", url: "/" },
      { name: "About Us", url: "/about" },
      { name: "Services", url: "/services" },
      { name: "Contact", url: "/contact" },
      { name: "Provider Login", url: "/login/service-provider" },
    ],
  },
  {
    title: "Legal",
    items: [
      { name: "Terms and Conditions", url: "/terms-and-conditions" },
      { name: "Privacy Policy", url: "/privacy-policy" },
    ],
  },
];

const socialLinks = [
  { Icon: FaFacebook, url: "#", label: "Facebook" },
  { Icon: FaLinkedin, url: "#", label: "LinkedIn" },
  { Icon: FaInstagram, url: "#", label: "Instagram" },
  { Icon: FaTwitter, url: "#", label: "Twitter" },
  { Icon: BiWorld, url: "#", label: "Website" },
];

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#5f60b9] via-[#6870c4] to-[#7178ce] mt-auto">
      <div className="container mx-auto px-6 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block">
              <div className="relative w-32 h-16 bg-white/80 rounded-full p-2">
                <Image
                  src="/assets/images/qproz.png"
                  alt="QProz Logo"
                  fill
                  className="object-contain p-1"
                  sizes="128px"
                />
              </div>
            </Link>

            <p className="text-white/80 text-[15px] leading-relaxed mt-5 max-w-sm">
              Your trusted partner for seamless and efficient solutions. We
              specialize in delivering high-quality services tailored to your
              needs.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ Icon, url, label }, index) => (
                <a
                  key={index}
                  href={url}
                  aria-label={label}
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-[#5f60b9] transition-all duration-300 hover:scale-110"
                >
                  <Icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-6 lg:gap-8">
            {sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold text-base mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <Link
                        href={item.url}
                        className="text-white/70 text-[14px] hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/70 text-sm">
            <p>&copy; {new Date().getFullYear()} QProz. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms-and-conditions"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
