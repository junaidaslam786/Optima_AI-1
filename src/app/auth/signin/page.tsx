"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import type { Session } from "next-auth";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const session = (await getSession()) as Session & {
      user: { role: string };
    };
    const role = session?.user.role;
    let destination = "/";
    switch (role) {
      case "admin":
        destination = "/admin/products";
        break;
      case "partner":
        destination = "/partner/products";
        break;
      case "client":
        destination = "/";
        break;
      default:
        console.warn("Unknown user role or role missing, redirecting to /");
        destination = "/";
        break;
    }
    router.push(destination);
  };

  return (
    <div className="h-[80vh] flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-primary text-white rounded-l-xl p-10 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4">Don&apos;t have an account?</h2>
        <p className="mb-6">
          Join our platform today and get access to our comprehensive health
          monitoring dashboard.
        </p>
        <Link href="/auth/signup">
          <button className="mt-auto bg-secondary hover:bg-tertiary text-white font-medium py-2 px-6 rounded-full transition">
            Create an account
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-primary hover:text-primary/70 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-left">
            <Link href="/auth/forgot-password" className="text-primary hover:text-secondary text-sm font-medium transition">
              Forgot Password?
            </Link>
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
