"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";

const FUNCTION_URL =
  "https://mlsgcukkleiuxkzbwrju.functions.supabase.co/upload-csv";

type Option = { id: string; name: string };

export default function UploadsPage() {
  const { data: session } = useSession();
  // dropdown data
  const [clients, setClients] = useState<Option[]>([]);

  // form state
  const [clientId, setClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1️⃣ Load clients & panels once
  useEffect(() => {
    async function load() {
      const { data: cData, error: cErr } = await supabase
        .from("users")
        .select("id,name")
        .eq("role", "client");
      if (cData) setClients(cData);
      if (cErr) setError(cErr.message);
    }
    load();
  }, []);

  // 2️⃣ Handle the form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file || !clientId) {
      setError("Please select a client, and a CSV file.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("admin_user_id", (session?.user as any).id);
    form.append("file", file);
    form.append("client_user_id", clientId);

    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: form,
    });
    setLoading(false);

    if (!res.ok) {
      // attempt to parse JSON error
      const json = await res.json().catch(() => null);
      setError(json?.error || res.statusText);
    } else {
      const json = await res.json().catch(() => null);
      setSuccess(json?.message || "Upload successful!");
      // clear form
      setFile(null);
      setClientId("");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Upload Lab CSV</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {success && <p className="mb-4 text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Select */}
        <div>
          <label className="block text-sm font-medium mb-1">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">— Select client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* CSV File Input */}
        <div>
          <label className="block text-sm font-medium mb-1">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-700 border rounded cursor-pointer"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Uploading…" : "Upload CSV"}
        </button>
      </form>
    </div>
  );
}
