"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import { UploadCloud, Users } from "lucide-react";
import { redirect } from "next/navigation";

const FUNCTION_URL =
  "https://mlsgcukkleiuxkzbwrju.functions.supabase.co/upload-csv";

type Option = { id: string; name: string };

export default function UploadsPage() {
  // Hooks must be called unconditionally at the top
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Option[]>([]);
  const [clientId, setClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load clients once
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

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="p-12 flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  
  if (!session) {
    redirect("/auth/signin");
  }
  // Only allow admin users
  if (!session || (session.user as any).role !== "admin") {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="p-12 flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
          <p className="text-yellow-300 text-2xl font-semibold">
            Access Denied
          </p>
        </div>
      </div>
    );
  }

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file || !clientId) {
      setError("Please select a client and a CSV file.");
      return;
    }

    setLoading(true);
    try {
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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || res.statusText);

      setSuccess(json.message || "Upload successful!");
      setFile(null);
      setClientId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-1/2 p-12 flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-lg">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-md dark:bg-gray-800/60 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <UploadCloud className="h-8 w-8 text-white" />
            <h1 className="ml-3 text-3xl font-bold text-white">
              Upload Lab CSV
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 text-red-200 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500 bg-opacity-20 text-green-200 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Select Client
              </label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="appearance-none w-full p-3 border border-white/50 bg-white/90 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                >
                  <option value="">— Choose client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-3 pointer-events-none text-white/70" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                CSV File
              </label>
              <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-white/50 rounded-lg cursor-pointer hover:border-pink-400 transition">
                <div className="text-center">
                  <p className="text-white mb-2">
                    {file ? file.name : "Click to select or drag and drop"}
                  </p>
                  <p className="text-xs text-white/70">.csv files only</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-pink-500 font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white transition disabled:opacity-50"
            >
              {loading ? "Uploading…" : "Upload CSV"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
