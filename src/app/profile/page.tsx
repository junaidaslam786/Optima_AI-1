// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  dob: string;
  address: string;
  subscription: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/signin");
    },
  });

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, "id" | "subscription">>({
    name: "",
    email: "",
    dob: "",
    address: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user on mount once session is ready
  useEffect(() => {
    if (status !== "authenticated") return;
    const id = (session.user as any).id;
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data: User) => {
        setUser(data);
        setForm({
          name: data.name,
          email: data.email,
          dob: data.dob,
          address: data.address,
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load your profile.");
      })
      .finally(() => setLoading(false));
  }, [status, session]);

  if (status === "loading" || loading) {
    return <p className="p-6 text-center">Loading your profile…</p>;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // only send editable fields
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setError(json?.error || "Failed to save changes.");
      setSaving(false);
      return;
    }

    const updated: User = await res.json();
    setUser(updated);
    setEditing(false);
    setSaving(false);
  }

  return (
    <div className="w-full bg-gray-50 flex items-center justify-center">
      <div className="w-full space-y-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-600">My Profile</h1>

        {/* Personal Information */}
        <div className="w-full flex flex-row gap-8">
          <div className="w-full bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-600">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-600 text-sm font-medium">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-600 text-sm font-medium">
                  Date of Birth
                </label>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-gray-600 text-sm font-medium">
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            {/* Edit / Save Buttons */}
            <div className="mt-6">
              {editing ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-indigo-200 text-indigo-800 rounded-lg hover:bg-indigo-300"
                >
                  Edit
                </button>
              )}
              {error && (
                <p className="mt-2 text-red-500 font-medium">{error}</p>
              )}
            </div>
          </div>

          {/* Subscription (read-only) */}
          <div className="w-full bg-white text-gray-600 rounded-xl shadow p-6 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Plan:</span> {user?.subscription}
            </p>
            {/* If you have a next-delivery date field, you could show it here:
            <p className="text-gray-700">
              <span className="font-medium">Next Delivery:</span>{" "}
              {user.nextDeliveryDate}
            </p>
          */}
          </div>
        </div>
      </div>
    </div>
  );
}
