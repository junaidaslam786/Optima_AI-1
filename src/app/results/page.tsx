// app/results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { BiomarkerCard } from "@/components/Results/BioMarkerCard";

interface Result {
  id: string;
  value: number;
  marker_id: number;
}
interface Insight {
  insight: string;
}

export default function ResultsPage() {
  const {
    data: results,
    error: resErr,
    loading: resLoading,
  } = useFetch<Result[]>("/api/results");
  const [insights, setInsights] = useState<string[]>([]);
  useEffect(() => {
    if (!results) return;
    Promise.all(
      results.map((r) =>
        fetch(`/api/insights?result_id=${r.id}`)
          .then((res) => res.json() as Promise<Insight[]>)
          .then((arr) => arr[0]?.insight ?? "")
      )
    ).then(setInsights);
  }, [results]);

  if (resLoading) return <p>Loading your results…</p>;
  if (resErr) return <p className="text-red-500">{resErr}</p>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Testosterone Results
        </h1>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {results?.map((r) => (
              <BiomarkerCard
                key={r.id}
                title={`Marker #${r.marker_id}`}
                value={r.value}
                unit="—"
                min={0}
                max={100}
              />
            ))}
          </div>

          <aside>
            <div className="bg-cyan-50 rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-medium text-gray-800">
                Insights from Optima.AI
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {insights.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
