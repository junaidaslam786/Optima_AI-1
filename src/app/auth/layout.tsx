// app/auth/layout.tsx
"use client";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-indigo-50 py-4">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}
