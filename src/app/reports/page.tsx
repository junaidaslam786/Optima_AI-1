// app/reports/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useReports } from "@/hooks/useReports";
import { HealthScoreChart } from "@/components/Reports/HealthScoreChart";
import { PastReportsList } from "@/components/Reports/PastReportsList";

export default function ReportsPage() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const { data: reports, error, isLoading, mutate } = useReports(userId);

  if (isLoading) return <p>Loading reports…</p>;
  if (error) return <p className="text-red-500">{error.error || error}</p>;

  async function handleGenerate() {
    if (!userId) return;
    interface Report {
      id: string | number;
    }

    interface GenerateReportRequest {
      user_id: string;
      resultIds: Array<string | number>;
    }

    const requestBody: GenerateReportRequest = {
      user_id: userId,
      resultIds: reports.map((r: Report) => r.id),
    };

    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    // re-fetch the list
    await mutate();
  }

  // map to PastReportsList shape
  const past =
    reports?.map((r: any) => ({
      date: new Date(r.generated_at).toLocaleDateString(),
      href: r.report_url,
    })) || [];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? "Generating…" : "Save my PDF"}
      </button>

      <HealthScoreChart />
      <PastReportsList reports={past} />
    </div>
  );
}
