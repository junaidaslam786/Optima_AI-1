"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/" 
    });

    if (result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(result?.url || "/");
  }

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-6">
      <div className="bg-white backdrop-blur-md bg-opacity-80 rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
          Sign In
        </h1>
        <form onSubmit={onSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-center text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-black py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
