"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

export function LanguagePicker({ text }) {
  const [selectedLang, setSelectedLang] = useState("en");

  // Load saved
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang");
    if (savedLang) {
      setSelectedLang(savedLang);
    }
  }, []);

  const clearGoogleTranslateCookies = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const rootDomain = parts.slice(-2).join(".");

    const domains = [hostname, `.${rootDomain}`];
    const paths = ["/", ""];

    domains.forEach((domain) => {
      paths.forEach((path) => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
      });
    });

    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    // Save
    localStorage.setItem("selectedLang", lang);

    const select = document.querySelector(".goog-te-combo");

    if (lang === "en") {
      clearGoogleTranslateCookies();
      setTimeout(() => window.location.reload(), 100);
      return;
    }

    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const selectedLanguage = languages.find((l) => l.code === selectedLang);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="notranslate h-9 pl-2 pr-0 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
          translate="no"
        >
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-[#5f60b9]" />
            <span
              className={cn("font-medium", {
                "text-sm": text === "sm",
              })}
            >
              {selectedLanguage?.code.toUpperCase()}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="notranslate min-w-[180px] mt-3 p-1 bg-white border border-gray-200 shadow-lg rounded-md"
        translate="no"
        align="end"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => handleLanguageChange(lang.code)}
            className={`notranslate px-3 py-2 text-sm cursor-pointer rounded-sm transition-colors focus:outline-none ${
              selectedLang === lang.code
                ? "bg-blue-50 text-blue-900 font-medium"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
            translate="no"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{lang.nativeLabel}</span>
              <span className="text-xs text-gray-500 ml-2">{lang.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
