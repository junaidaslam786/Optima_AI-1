"use client";

import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-[rgb(79,135,162)] text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">About Optima.ai</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-200 hover:text-white transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/vacancies" className="text-gray-200 hover:text-white transition-colors">
                  Vacancies
                </Link>
              </li>
              <li>
                <Link href="/become-a-partner" className="text-gray-200 hover:text-white transition-colors">
                  Become a partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Learn</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/test-kit" className="text-gray-200 hover:text-white transition-colors">
                  Using a Test Kit
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-gray-200 hover:text-white transition-colors">
                  Guides on markers
                </Link>
              </li>
              <li>
                <Link href="/service-request" className="text-gray-200 hover:text-white transition-colors">
                  Service or Test Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms-of-service" className="text-gray-200 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/returns-cancellations" className="text-gray-200 hover:text-white transition-colors">
                  Returns/Cancellations
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/optima.png"
                alt="Optima.AI"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-xl font-bold">Optima.AI</span>
            </div>
            <p className="text-sm text-gray-200">
              Intelligent Health Insights
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-200">
              Lab accreditation details...
            </p>
            <p className="text-sm text-gray-200">
              © {new Date().getFullYear()} Optima.AI. All rights reserved.
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-300">
              Services provided are intended to enable people to improve wellbeing and optimise sports
              performance. It is not intended for clinical diagnosis. Test results are for information purposes
              only.
            </p>
            <p className="text-xs text-gray-300 mt-2">
              If you do have concerns about your health please discuss these directly with your GP.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
