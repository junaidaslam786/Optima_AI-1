"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserId, getUserRole } from "@/utils/utils";

export default function CreatePanelPage() {
  const router = useRouter();

  // state for role & id
  const [role, setRole] = useState<string | null>(null);
  const [id,   setId]   = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // fetch role/id on client only
  useEffect(() => {
    const userRole = getUserRole();
    const userId   = getUserId();
    setRole(userRole);
    setId(userId);
    setLoadingAuth(false);
  }, []);

  // while we’re checking auth…
  if (loadingAuth) return <p>Checking permissions…</p>;

  // not signed in
  if (!role) {
    return <p>Not signed in.</p>;
  }

  // non-admin
  if (role !== "admin") {
    return <p className="text-red-600">Access denied.</p>;
  }

  // now the rest of your form…
  const [name, setName]         = useState("");
  const [description, setDescription] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

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
      setError(json.error || "Failed to create panel");
      return;
    }

    router.push("/panels");
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-6">Create New Panel</h1>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* name & description inputs here… */}
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
