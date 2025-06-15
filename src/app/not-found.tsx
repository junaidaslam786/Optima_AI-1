"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="bg-primary p-8 rounded-lg shadow-2xl text-center max-w-md w-full animate-fade-in-up">
        <h1 className="text-6xl font-extrabold text-red-500 mb-4 tracking-tight">
          404
        </h1>
        <p className="text-2xl font-semibold text-white mb-6">Page Not Found</p>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          Oops! It looks like you&apos;ve ventured into uncharted territory. The
          page you&apos;re looking for might have been moved or doesn&apos;t
          exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary focus:ring-offset-primary transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go to Homepage
          <svg
            className="ml-2 -mr-1 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>

      {/* Add some simple keyframe animation for a smoother appearance */}
      <style jsx>{`
        @keyframes fadeInScaleUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInScaleUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
