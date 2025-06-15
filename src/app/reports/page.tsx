// app/reports/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useReports } from "@/hooks/useReports";
import { HealthScoreChart } from "@/components/Reports/HealthScoreChart";
import { PastReportsList } from "@/components/Reports/PastReportsList";
import { useMemo } from "react";
import { withAuth } from "@/components/Auth/withAuth";

const ReportsPage = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: reports, error } = useReports(userId ?? "");

  const past = useMemo(() => {
    return (reports || []).map(
      (r: { generated_at: string; report_url: string }) => ({
        date: new Date(r.generated_at).toLocaleDateString(),
        href: r.report_url,
      })
    );
  }, [reports]);

  if (!reports && !error) {
    return (
      <div className="w-full min-h-screen bg-tertiary/10 px-8 pb-12 flex items-center justify-center">
        <p className="text-secondary">Loading…</p>
      </div>
    );
  }

  if (Array.isArray(reports) && reports.length === 0) {
    return (
      <div className="w-full min-h-screen bg-tertiary/10 px-8 pb-12 flex items-center justify-center">
        <p className="text-secondary text-lg font-medium">
          Oops! You don&apos;t have any previous reports
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-8 pb-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Reports</h1>
      <HealthScoreChart />
      <PastReportsList reports={past} />
    </div>
  );
};

export default withAuth(ReportsPage, { allowedRoles: ["client"] });
