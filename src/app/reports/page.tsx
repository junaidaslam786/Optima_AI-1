// app/reports/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useReports } from "@/hooks/useReports";
import { HealthScoreChart } from "@/components/Reports/HealthScoreChart";
import { PastReportsList } from "@/components/Reports/PastReportsList";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function ReportsPage() {
  const router = useRouter();

  // Redirect if not authenticated
  useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/signin");
    },
  });

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: reports, error } = useReports(userId ?? "");

  const past = useMemo(() => {
    return (reports || []).map((r: { generated_at: string; report_url: string }) => ({
      date: new Date(r.generated_at).toLocaleDateString(),
      href: r.report_url,
    }));
  }, [reports]);

  if (!reports && !error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-8 pb-12 flex items-center justify-center">
        <p className="text-gray-700">Loading…</p>
      </div>
    );
  }

  // Once loaded, if there are no reports:
  if (Array.isArray(reports) && reports.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-8 pb-12 flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium">
          Oops! You don&apos;t have any previous reports
        </p>
      </div>
    );
  }

  // Otherwise, render the chart and list
  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      <HealthScoreChart />
      <PastReportsList reports={past} />
    </div>
  );
}
