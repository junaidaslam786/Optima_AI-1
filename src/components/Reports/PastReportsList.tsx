import Link from "next/link";

interface Report {
  date: string;
  href: string;
}

export function PastReportsList({ reports }: { reports: Report[] }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Past Reports
      </h2>
      <div className="bg-white rounded-lg shadow divide-y border border-gray-200">
        {reports.map(({ date, href }) => (
          <div
            key={date}
            className="flex items-center justify-between px-6 py-4"
          >
            <span className="text-gray-800">{date}</span>
            <Link
              href={href}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Download
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
