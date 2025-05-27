"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePanelPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // ─── HOISTED HOOKS ─────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── AUTHENTICATION GATING ────────────────────────────────
  if (status === "loading") {
    return <p>Checking permissions…</p>;
  }

  if (!session) {
    return <p>Not signed in.</p>;
  }

  if (session.user.role !== "admin") {
    return <p className="text-red-600">Access denied.</p>;
  }

  // ─── FORM SUBMIT LOGIC ────────────────────────────────────
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/panels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to create panel");
    } else {
      router.push("/panels");
    }
  }

  // ─── RENDER AUTHORIZED FORM ───────────────────────────────
  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-6">Create New Panel</h1>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Panel Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Panel"}
        </button>
      </form>
    </div>
  );
}
