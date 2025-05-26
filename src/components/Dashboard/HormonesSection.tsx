// components/HormonesSection.tsx
"use client";

import { useFetch } from "@/hooks/useFetch";
import { HormonesTable } from "./HormonesTable";
import { Callout } from "./Callout";
import Link from "next/link";
import { useParams } from "next/navigation";
import { use } from "react";

export function HormonesSection() {
  const panelId = useParams().panelId || "1";
  const { data: markers, loading } = useFetch<
    { code: string; normal_low: number; normal_high: number }[]
  >(`/api/panels/${panelId}/markers`);

  if (loading) return <p>Loading hormones…</p>;
  if (!markers) return null;

  return (
    <section className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Hormones</h2>
      <Link href="/results" className="block hover:shadow-lg">
        <HormonesTable markers={markers} />
      </Link>
      <Callout>
        Your testosterone markers are within range. Maintaining strength
        training and zinc intake is advised.
      </Callout>
    </section>
  );
}
