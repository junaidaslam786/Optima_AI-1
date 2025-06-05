// components/main/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PaletteSelector } from "@/components/Theme/PaletteSelector";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
        setPaletteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isExtrasRoute = ["/contact", "/how-it-works", "/become-a-partner", "/terms-of-service"].includes(pathname);
  const isResourcesRoute = ["/learn", "/guides", "/help"].includes(pathname);
  const isProfileRoute = ["/profile", "/profile/contact-preferences", "/profile/privacy", "/profile/payment-details"].includes(pathname);

  function toggleMenu(menuName: string) {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
    setPaletteOpen(false);
  }

  return (
    <div ref={wrapperRef}>
      <nav className="relative flex items-center justify-between p-4">
        <ul className="flex space-x-8">
          {session && (
            <>
              <li>
                <Link
                  href="/"
                  className={
                    pathname === "/"
                      ? "text-primary font-semibold"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className={
                    pathname === "/reports"
                      ? "text-primary font-semibold"
                      : "text-gray-600 hover:text-gray-800"
                  }
                >
                  Past Reports
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              href="/purchase"
              className={
                pathname === "/purchase"
                  ? "text-primary font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Purchase a Test Kit
            </Link>
          </li>
          <li>
            <Link
              href="/partner-management"
              className={
                pathname === "/partner-management"
                  ? "text-primary font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Partner Management
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={() => toggleMenu("extras")}
              className={`flex items-center focus:outline-none ${
                isExtrasRoute
                  ? "text-primary font-semibold"
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
              <li>
                <Link
                  href="/contact"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/contact"
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/how-it-works"
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/become-a-partner"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/become-a-partner"
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/terms-of-service"
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </li>
          <li className="relative">
            <button
              onClick={() => toggleMenu("resources")}
              className={`flex items-center focus:outline-none ${
                isResourcesRoute
                  ? "text-primary font-semibold"
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
              <li>
                <Link
                  href="/learn"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/learn"
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Learn
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/guides"
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Guides on Markers
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className={`block px-4 py-2 text-sm ${
                    pathname === "/help"
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Help with Results
                </Link>
              </li>
            </ul>
          </li>
          {session && (
            <li className="relative">
              <button
                onClick={() => toggleMenu("profile")}
                className={`flex items-center focus:outline-none ${
                  isProfileRoute
                    ? "text-primary font-semibold"
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
                <li>
                  <Link
                    href="/profile"
                    className={`block px-4 py-2 text-sm ${
                      pathname === "/profile"
                        ? "bg-primary-light text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/contact-preferences"
                    className={`block px-4 py-2 text-sm ${
                      pathname === "/profile/contact-preferences"
                        ? "bg-primary-light text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Contact Preferences
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/privacy"
                    className={`block px-4 py-2 text-sm ${
                      pathname === "/profile/privacy"
                        ? "bg-primary-light text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/payment-details"
                    className={`block px-4 py-2 text-sm ${
                      pathname === "/profile/payment-details"
                        ? "bg-primary-light text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Payment Details
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
        <div className="relative">
          <button
            onClick={() => {
              setPaletteOpen((prev) => !prev);
              setOpenMenu(null);
            }}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l1.414-1.414M6.05 6.05L4.636 7.464"
              />
            </svg>
          </button>
          <div
            className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
              paletteOpen ? "block" : "hidden"
            }`}
          >
            <PaletteSelector />
          </div>
        </div>
      </nav>
    </div>
  );
}
