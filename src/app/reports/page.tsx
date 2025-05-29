// app/reports/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useReports } from "@/hooks/useReports";
import { HealthScoreChart } from "@/components/Reports/HealthScoreChart";
import { PastReportsList } from "@/components/Reports/PastReportsList";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();
  const { data: sessions } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/signin");
    },
  });
  const { data: session } = useSession();
  const userId = session?.user.id!;
  const userName = session?.user.name!;
  const userEmail = session?.user.email!;
  const { data: reports, error, isLoading, mutate } = useReports(userId);

  if (isLoading) return <p>Loading reports…</p>;
  if (error) return <p className="text-red-500">{error.error || error}</p>;

  async function handleGenerate() {
    // 1) pull your dashboard snapshot
    const panels = JSON.parse(localStorage.getItem("dashboard.panels") || "[]");
    const markers = JSON.parse(
      localStorage.getItem("dashboard.markers") || "[]"
    );
    const insights = localStorage.getItem("dashboard.insights") || "";

    // 2) fire off a JSON POST
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        panels,
        markers,
        insights,
      }),
    });

    // 3) re‐load your past reports
    await mutate();
  }

  // Map for the past‐reports list
  const past = (reports || []).map((r: any) => ({
    date: new Date(r.generated_at).toLocaleDateString(),
    href: r.report_url,
  }));

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
