// components/HormonesSection.tsx
"use client";

import Link from "next/link";
import { HormonesTable } from "./HormonesTable";
import { Callout } from "./Callout";

export function HormonesSection() {
  const recommendation =
    "Your testosterone markers are within range. Maintaining strength training and zinc intake is advised.";

  return (
    <section className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Hormones</h2>

      {/* wrap the table in a Link to /results */}
      <Link href="/results" className="block hover:shadow-lg transition-shadow">
        <HormonesTable />
      </Link>

      <Callout>{recommendation}</Callout>
    </section>
  );
}
