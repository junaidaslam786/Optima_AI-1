"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

interface User {
  id: string;
  name: string;
  email: string;
  dob: string;
  address: string;
  subscription: string;
  role: "client";
}

type ProfileForm = Omit<User, "id" | "subscription">;

interface AuthSession extends Session {
  user: User;
}

export default function ProfilePage() {
  const { data: sessionData, status } = useSession();
  const session = sessionData as AuthSession | null;

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    dob: "",
    address: "",
    role: "client",
  });
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      return;
    }
    const { id } = session.user;
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data: User) => {
        setUser(data);
        setForm({
          name: data.name,
          email: data.email,
          dob: data.dob,
          address: data.address,
          role: "client",
        });
      })
      .catch(() => {
        setError("Failed to load your profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <p className="p-6 text-center text-primary">Loading your profile…</p>
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (): Promise<void> => {
    if (!user) {
      return;
    }
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const body = await response
        .json()
        .catch(() => ({} as { error?: string }));
      setError(body.error ?? "Failed to save changes.");
      setSaving(false);
      return;
    }

    const updated: User = await response.json();
    setUser(updated);
    setEditing(false);
    setSaving(false);
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full space-y-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-primary">My Profile</h1>

        <div className="w-full flex flex-row gap-8">
          <div className="w-full bg-secondary/10 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-primary px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary ${
                    editing ? "bg-white" : "bg-secondary/5 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-primary px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary ${
                    editing ? "bg-white" : "bg-secondary/5 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary">
                  Date of Birth
                </label>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-primary px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary ${
                    editing ? "bg-white" : "bg-secondary/5 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-primary">
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full text-primary px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary ${
                    editing ? "bg-white" : "bg-secondary/5 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            <div className="mt-6">
              {editing ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-tertiary disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-secondary/30 text-secondary rounded-lg hover:bg-secondary/40"
                >
                  Edit
                </button>
              )}
              {error && (
                <p className="mt-2 text-secondary font-medium">{error}</p>
              )}
            </div>
          </div>

          <div className="w-full bg-secondary/10 text-primary rounded-xl shadow p-6 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            <p className="mb-1">
              <span className="font-medium">Plan:</span> {user?.subscription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
