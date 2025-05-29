"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/reports", label: "Past Reports" },
  { href: "/book-a-test", label: "Book a Test" },
  { href: "/help", label: "Help with Results" },
  { href: "/profile", label: "My Profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-8">
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
