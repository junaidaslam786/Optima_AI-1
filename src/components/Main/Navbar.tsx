"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { PaletteSelector } from "@/components/Theme/PaletteSelector";

interface NavLink {
  href: string;
  label: string;
  subLinks?: NavLink[];
  authRequired?: boolean;
}

const navData: Record<string, NavLink[]> = {
  guest: [
    { href: "/products", label: "Purchase a Test Kit" },
    { href: "/blogs", label: "Blog" },
    {
      href: "#",
      label: "Legal",
      subLinks: [
        { href: "/contact", label: "Contact" },
        { href: "/how-it-works", label: "How it Works" },
        { href: "/terms-of-service", label: "Terms of Service" },
      ],
    },
    {
      href: "#",
      label: "Learn",
      subLinks: [
        { href: "/learn", label: "Learn" },
        { href: "/guides", label: "Guides on Markers" },
      ],
    },
    { href: "/auth/signin", label: "Sign In" },
  ],
  client: [
    { href: "/dashboard", label: "Dashboard", authRequired: true },
    { href: "/cart", label: "Cart", authRequired: true },
    { href: "/orders", label: "My Orders", authRequired: true },
    { href: "/reports", label: "Past Reports", authRequired: true },
    { href: "/products", label: "Purchase a Test Kit" },
    { href: "/blogs", label: "Blog" },
    {
      href: "#",
      label: "Legal",
      subLinks: [
        { href: "/contact", label: "Contact" },
        { href: "/how-it-works", label: "How it Works" },
        {
          href: "/become-a-partner",
          label: "Become a Partner",
          authRequired: true,
        },
        { href: "/terms-of-service", label: "Terms of Service" },
      ],
    },
    {
      href: "#",
      label: "Learn",
      subLinks: [
        { href: "/learn", label: "Learn" },
        { href: "/guides", label: "Guides on Markers" },
        { href: "/help", label: "Help with Results", authRequired: true },
      ],
    },
    {
      href: "#",
      label: "Profile",
      authRequired: true,
      subLinks: [
        { href: "/profile", label: "My Profile" },
        { href: "/profile/contact-preferences", label: "Contact Preferences" },
        { href: "/profile/privacy", label: "Privacy" },
        { href: "/profile/payment-details", label: "Payment Details" },
      ],
    },
  ],
  partner: [
    { href: "/partner/products", label: "Products", authRequired: true },
    { href: "/partner/orders", label: "Orders", authRequired: true },
    { href: "/partner/dashboard", label: "Dashboard", authRequired: true },
    { href: "/blogs", label: "Blog" },
    {
      href: "#",
      label: "Profile",
      authRequired: true,
      subLinks: [{ href: "/partner/profile", label: "My Profile" }],
    },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", authRequired: true },
    { href: "/admin/products", label: "Admin Products", authRequired: true },
    { href: "/admin/orders", label: "Orders", authRequired: true },
    { href: "/admin/blogs/dashboard", label: "Blog" },
    {
      href: "#",
      label: "Uploads",
      authRequired: true,
      subLinks: [
        { href: "/uploads", label: "Uploads" },
        { href: "/admin/uploads", label: "Uploads List" },
      ],
    },
    {
      href: "#",
      label: "User Management",
      authRequired: true,
      subLinks: [
        { href: "/admin/users", label: "Users" },
        {
          href: "/admin/partner-profiles",
          label: "Partners",
        },
        {
          href: "/admin/partner-approval",
          label: "Partner Approval",
        },
      ],
    },
    {
      href: "#",
      label: "Settings",
      authRequired: true,
      subLinks: [
        { href: "/admin/categories", label: "Categories" },
        { href: "/admin/markers", label: "Markers" },
        { href: "/admin/panels", label: "Panels" },
        {
          href: "/admin/transactions",
          label: "Transactions",
        },
      ],
    },
    {
      href: "#",
      label: "Profile",
      authRequired: true,
      subLinks: [{ href: "/profile", label: "My Profile" }],
    },
  ],
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const userRole = session?.user?.role || "guest";

  let navLinksToRender: NavLink[] = [];
  if (!session || userRole === "guest") {
    navLinksToRender = navData.guest;
  } else {
    navLinksToRender = navData[userRole as keyof typeof navData] || [];
  }

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

  function toggleMenu(menuName: string) {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
    setPaletteOpen(false);
  }

  const renderNavLink = (link: NavLink) => {
    if (link.authRequired && !session) {
      return null;
    }

    const isParentActive = link.subLinks
      ? link.subLinks.some((subLink) => pathname === subLink.href)
      : false;
    const isActive = pathname === link.href || isParentActive;

    if (link.subLinks) {
      const filteredSubLinks = link.subLinks;

      if (filteredSubLinks.length === 0 && link.href === "#") {
        return null;
      }

      return (
        <li key={link.label} className="relative">
          <button
            onClick={() => toggleMenu(link.label)}
            className={`flex items-center focus:outline-none ${
              isActive
                ? "text-primary font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {link.label}
            {/* Dropdown arrow SVG */}
            <svg
              className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                openMenu === link.label ? "rotate-180" : "rotate-0"
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
              openMenu === link.label ? "block" : "hidden"
            }`}
          >
            {filteredSubLinks.map((subLink) => (
              <li key={subLink.label}>
                <Link
                  href={subLink.href}
                  className={`block px-4 py-2 text-sm ${
                    pathname === subLink.href
                      ? "bg-primary-light text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {subLink.label}
                </Link>
              </li>
            ))}
            {link.label === "Profile" && session && (
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  Log Out
                </button>
              </li>
            )}
          </ul>
        </li>
      );
    } else {
      return (
        <li key={link.label}>
          <Link
            href={link.href}
            className={
              isActive
                ? "text-primary font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }
          >
            {link.label}
          </Link>
        </li>
      );
    }
  };

  return (
    <div ref={wrapperRef}>
      <nav className="relative flex items-center justify-between p-[1vw]">
        <ul className="flex space-x-[2vw]">
          {navLinksToRender.map(renderNavLink)}
        </ul>

        <div className="relative ml-[2vw]">
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
