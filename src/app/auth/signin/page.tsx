// app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

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

    try {
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

      const session = await getSession();
      const role = (session?.user as any)?.role;

      if (role === "admin") {
        router.push("/uploads");
      } else {
        router.push("/");
      }
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="h-[80vh] flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-primary text-white rounded-l-xl p-10 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4">Don&apos;t have an account?</h2>
        <p className="mb-6">
          Purchase one of our kits and we will send you access details so you
          can log into our dashboard.
        </p>
        <Link href="/purchase">
          <button className="mt-auto bg-secondary hover:bg-tertiary text-white font-medium py-2 px-6 rounded-full transition">
            Purchase
          </button>
        </Link>
      </div>

      <div className="w-full md:w-1/2 bg-tertiary/10 rounded-r-xl p-10 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Welcome, sign in
        </h1>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-primary mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-primary mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Please enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-primary hover:text-primary/70 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-center text-secondary font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-secondary text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition disabled:opacity-50"
          >
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
