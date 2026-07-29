"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProviderProfileSidebar() {
  const pathname = usePathname();

  const sections = [
    { label: "Service Area", href: "/profile/provider/settings/service-area" },
    { label: "Change Email", href: "/profile/provider/settings/email" },
    { label: "Change Password", href: "/profile/provider/settings/password" },
    { label: "Contact Info", href: "/profile/provider/settings/contact" },
  ];

  return (
    <nav className="w-64 pb-4 pr-4 border-r h-full">
      <ul className="space-y-2">
        {sections.map((sec) => (
          <li key={sec.href}>
            <Link href={sec.href}>
              <span
                className={`block px-4 py-2 rounded hover:bg-gray-100 ${
                  pathname === sec.href ? "bg-gray-200/75 font-semibold" : ""
                }`}
              >
                {sec.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
