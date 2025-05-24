// app/reports/page.tsx
import { HealthScoreChart } from "@/components/Reports/HealthScoreChart";
import { PastReportsList } from "@/components/Reports/PastReportsList";

export default function ReportsPage() {
  const pastReports = [
    { date: "April 12, 2024", href: "#" },
    { date: "February 8, 2024", href: "#" },
    { date: "November 3, 2023", href: "#" },
    { date: "September 9, 2023", href: "#" },
    { date: "August 18, 2023", href: "#" },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 pb-12">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
      <div className="w-full justify-center items-center">
        {/* Chart component */}
        <HealthScoreChart />

        {/* Past reports list component */}
        <PastReportsList reports={pastReports} />
      </div>
    </div>
  );
}
