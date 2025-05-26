"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // your anon-key client

export default function UploadPage() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }
    if (!userId) {
      setError("You must be signed in to upload.");
      return;
    }

    setLoading(true);

    // 1) Upload the file to Supabase Storage
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: storageError } = await supabase.storage
      .from("csv-uploads")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      setError("Storage upload error: " + storageError.message);
      setLoading(false);
      return;
    }

    // 2) Notify your backend (metadata only)
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        filename: uploadData.path, // store the full path
      }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError("Metadata save error: " + (json.error || res.statusText));
      setLoading(false);
      return;
    }

    // 3) Success! Redirect to your uploads list
    router.push("/uploads");
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Upload Lab CSV</h1>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Uploading…" : "Upload CSV"}
        </button>
      </form>
    </div>
  );
}
