"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff } from 'lucide-react';

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Fetch session to determine user role
    const session = await getSession();
    const role = (session?.user as any)?.role;

    // Redirect based on role
    if (role === "admin") {
      router.push("/uploads");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center px-4">
      <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
          Sign In
        </h1>
        <form onSubmit={onSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white bg-opacity-80"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white bg-opacity-80"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {error && <p className="text-center text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
          >
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-700">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
