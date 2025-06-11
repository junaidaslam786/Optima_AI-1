"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "client" | "admin";
  address: string;
  dob: string;
}

interface ApiResponse {
  error?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
    address: "",
    dob: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          address: form.address,
          dob: form.dob,
        }),
      });

      const data: ApiResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Signup failed");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-primary text-white rounded-l-xl p-10 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4">Already have an account?</h2>
        <p className="mb-6">
          If you already purchased one of our kits, just sign in. We&apos;ll get
          you straight to your dashboard.
        </p>
        <Link href="/auth/signin">
          <button className="mt-auto bg-secondary hover:bg-tertiary text-white font-medium py-2 px-6 rounded-full transition">
            Sign In
          </button>
        </Link>
      </div>

      <div className="w-full md:w-1/2 bg-tertiary/10 rounded-r-xl p-10 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Create Your Account
        </h1>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-primary mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
              required
              className="w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-primary mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
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
              value={form.password}
              onChange={onChange}
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
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-primary mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={onChange}
              required
              className="w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-primary mb-1">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={onChange}
              className="w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-primary mb-1">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={onChange}
              className="w-full text-primary px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-center text-secondary font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-secondary text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition disabled:opacity-50"
          >
            {loading ? "Creating Account…" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
