// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

type Form = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: string;
  address?: string;
  dob?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Form>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "client",
    address: "",
    dob: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Simple client-side check: passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 1) Call signup API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
          address: form.address,
          dob: form.dob
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Signup failed");
      }

      // 2) Immediately sign in via NextAuth
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (signInResult && "error" in signInResult) {
        throw new Error(signInResult.error!);
      }

      // 3) Redirect to client home
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-ful md:w-1/2 bg-cyan-600 text-white rounded-l-xl p-10 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4">Already have an account?</h2>
        <p className="mb-6">
          If you already purchased one of our kits, just sign in. We&apos;ll get you straight
          to your dashboard.
        </p>
        <Link href="/auth/signin">
          <button className="mt-auto bg-cyan-500 hover:bg-cyan-700 text-white font-medium py-2 px-6 rounded-full transition">
            Sign In
          </button>
        </Link>
      </div>

      {/* Right Panel (Form) */}
      <div className="w-full md:w-1/2 bg-indigo-100 rounded-r-xl p-10 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-cyan-700 mb-6">
          Create Your Account
        </h1>
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={onChange}
              required
              className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              required
              className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              required
              className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Please confirm your password"
              value={form.confirmPassword}
              onChange={onChange}
              required
              className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            {/* Reuse same toggle for both fields */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Address (optional) */}
          <div>
            <label htmlFor="address" className="block text-gray-700 mb-1">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="123 Main St, City, Country"
              value={form.address}
              onChange={onChange}
              className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={onChange}
              className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-center text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50"
          >
            {loading ? "Creating Account…" : "Sign Up"}
          </button>
        </form>
        dob?: string;
      </div>
    </div>
  );
}
