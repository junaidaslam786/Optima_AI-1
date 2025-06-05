// components/Reports/PastReportsList.tsx
import Link from "next/link";

interface Report {
  date: string;
  href: string;
}

export function PastReportsList({ reports }: { reports: Report[] }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-primary mb-4">
        Past Reports
      </h2>
      <div className="bg-secondary/10 rounded-lg shadow divide-y border border-tertiary">
        {reports.map(({ date, href }) => (
          <div
            key={href}
            className="flex items-center justify-between px-6 py-4"
          >
            <span className="text-secondary">{date}</span>
            <Link
              href={href}
              target="_blank"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition"
            >
              Download
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
