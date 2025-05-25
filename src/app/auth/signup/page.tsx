"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Form = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "client";
  dob?: string;
  address?: string;
  subscription?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>({
    email: "",
    password: "",
    name: "",
    role: "client",
    dob: "",
    address: "",
    subscription: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1) call signup API
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Signup failed");
      setLoading(false);
      return;
    }

    // 2) immediately sign in via NextAuth
    const signInResult = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    const signInError =
      signInResult && "error" in signInResult ? signInResult.error : undefined;

    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    // 3) redirect
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-6">
      <div className="bg-white backdrop-blur-md bg-opacity-80 rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Create Your Account
        </h1>
        <form onSubmit={onSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={onChange}
            required
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
            required
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>

          <input
            name="dob"
            type="date"
            placeholder="Date of Birth (optional)"
            value={form.dob}
            onChange={onChange}
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="address"
            type="text"
            placeholder="Address (optional)"
            value={form.address}
            onChange={onChange}
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          {form.role === "client" && (
            <input
              name="subscription"
              type="text"
              placeholder="Subscription Plan (optional)"
              value={form.subscription}
              onChange={onChange}
              className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {error && (
            <p className="text-center text-red-500 font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Working…" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
