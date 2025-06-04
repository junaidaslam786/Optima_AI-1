// components/main/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface NavLink {
  href: string;
  label: string;
}

// Top‐level (non‐dropdown) links
const TOP_LINKS: NavLink[] = [
  { href: "/", label: "Dashboard" },
  { href: "/reports", label: "Past Reports" },
  { href: "/purchase", label: "Purchase a Test Kit" },
  { href: "/partner-management", label: "Partner Management" },
];

// Submenu items for Extras
const EXTRAS_SUBMENU: NavLink[] = [
  { href: "/contact", label: "Contact" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/become-a-partner", label: "Become a Partner" },
  { href: "/terms-of-service", label: "Terms of Service" },
];

// Submenu items for Resources
const RESOURCES_SUBMENU: NavLink[] = [
  { href: "/learn", label: "Learn" },
  { href: "/guides", label: "Guides on Markers" },
  { href: "/help", label: "Help with Results" },
];

// Submenu items for Profile
const PROFILE_SUBMENU: NavLink[] = [
  { href: "/profile", label: "My Profile" },
  { href: "/profile/contact-preferences", label: "Contact Preferences" },
  { href: "/profile/privacy", label: "Privacy" },
  { href: "/profile/payment-details", label: "Payment Details" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isExtrasRoute = EXTRAS_SUBMENU.some((link) => link.href === pathname);
  const isResourcesRoute = RESOURCES_SUBMENU.some(
    (link) => link.href === pathname
  );
  const isProfileRoute = PROFILE_SUBMENU.some(
    (link) => link.href === pathname
  );

  function toggleMenu(menuName: string) {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  }

  return (
    <div ref={wrapperRef}>
      <nav className="relative">
        <ul className="flex space-x-8">
          {/* Dashboard & Past Reports only when signed in */}
          {session && (
            <>
              <li key="/">
                <Link
                  href="/"
                  className={
                    pathname === "/"
                      ? "text-cyan-600 font-semibold"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Dashboard
                </Link>
              </li>
              <li key="/reports">
                <Link
                  href="/reports"
                  className={
                    pathname === "/reports"
                      ? "text-cyan-600 font-semibold"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Past Reports
                </Link>
              </li>
            </>
          )}

          {/* Purchase a Test Kit and Partner Management always visible */}
          <li key="/purchase">
            <Link
              href="/purchase"
              className={
                pathname === "/purchase"
                  ? "text-cyan-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Purchase a Test Kit
            </Link>
          </li>
          <li key="/partner-management">
            <Link
              href="/partner-management"
              className={
                pathname === "/partner-management"
                  ? "text-cyan-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Partner Management
            </Link>
          </li>

          {/* Extras dropdown */}
          <li className="relative">
            <button
              onClick={() => toggleMenu("extras")}
              className={`flex items-center focus:outline-none ${
                isExtrasRoute
                  ? "text-cyan-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Legal
              <svg
                className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                  openMenu === "extras" ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <ul
              className={`absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
                openMenu === "extras" ? "block" : "hidden"
              }`}
            >
              {EXTRAS_SUBMENU.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block px-4 py-2 text-sm ${
                        isActive
                          ? "bg-cyan-50 text-cyan-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Resources dropdown */}
          <li className="relative">
            <button
              onClick={() => toggleMenu("resources")}
              className={`flex items-center focus:outline-none ${
                isResourcesRoute
                  ? "text-cyan-600 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Learn
              <svg
                className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                  openMenu === "resources" ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <ul
              className={`absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
                openMenu === "resources" ? "block" : "hidden"
              }`}
            >
              {RESOURCES_SUBMENU.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block px-4 py-2 text-sm ${
                        isActive
                          ? "bg-cyan-50 text-cyan-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Profile dropdown (only when signed in) */}
          {session && (
            <li className="relative">
              <button
                onClick={() => toggleMenu("profile")}
                className={`flex items-center focus:outline-none ${
                  isProfileRoute
                    ? "text-cyan-600 font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Profile
                <svg
                  className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                    openMenu === "profile" ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <ul
                className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
                  openMenu === "profile" ? "block" : "hidden"
                }`}
              >
                {PROFILE_SUBMENU.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`block px-4 py-2 text-sm ${
                          isActive
                            ? "bg-cyan-50 text-cyan-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
