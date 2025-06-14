// app/auth/layout.tsx
"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-tertiary/10 py-12">
      <div className="bg-secondary/10 rounded-xl shadow-xl w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}
