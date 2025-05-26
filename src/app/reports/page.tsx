// app/reports/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useFetch } from "@/hooks/useFetch";
import { HealthScoreChart } from "@/components/Reports/HealthScoreChart";
import { PastReportsList } from "@/components/Reports/PastReportsList";

export default function ReportsPage() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const {
    data: reports,
    error,
    loading,
  } = useFetch<{ id: string; generated_at: string; report_url: string }[]>(
    userId ? `/api/reports?user_id=${userId}` : ""
  );

  if (loading) return <p>Loading reports…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Transform to the shape PastReportsList expects
  const pastReports =
    reports?.map((r) => ({
      date: new Date(r.generated_at).toLocaleDateString(),
      href: r.report_url,
    })) ?? [];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      <HealthScoreChart />
      <PastReportsList reports={pastReports} />
    </div>
  );
}
