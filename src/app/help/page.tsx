// app/help/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const [concern, setConcern] = useState("");
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/signin");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Submitted concern:", concern);
    setConcern("");
    alert("Your concern has been submitted.");
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-primary mb-8">Help</h1>

        <div className="border border-primary bg-primary/10 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Schedule a Consultation
          </h2>
          <p className="text-primary mb-4">
            Get professional guidance on understanding your test results.
          </p>
          <Link href="/appointments/book">
            <p className="inline-block bg-secondary hover:bg-tertiary text-white font-medium rounded-lg px-5 py-2 transition">
              Book an Appointment
            </p>
          </Link>
        </div>

        <div className="border border-primary bg-primary/10 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Raise a Concern
          </h2>
          <p className="text-primary mb-4">
            Send your questions or concerns to our support team.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Comment"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              className="flex-1 text-primary border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
            <button
              type="submit"
              className="bg-secondary hover:bg-tertiary text-white font-medium rounded-lg px-6 py-2 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
