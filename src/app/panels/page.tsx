// src/app/panels/page.tsx
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function PanelsPage() {
  // Fetch all panels
  const { data: panels, error } = await supabaseAdmin
    .from("panels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Panels</h1>
        <p className="text-red-600">Error loading panels: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Panels</h1>
        <Link
          href="/panels/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + New Panel
        </Link>
      </div>

      {panels && panels.length > 0 ? (
        <ul className="space-y-4">
          {panels.map((panel: any) => (
            <li
              key={panel.id}
              className="p-4 border rounded hover:shadow-sm transition"
            >
              <Link href={`/panels/${panel.id}`}>
                <h2 className="text-lg font-medium text-indigo-600">
                  {panel.name || "Untitled panel"}
                </h2>
                {panel.description && (
                  <p className="mt-1 text-gray-700">
                    {panel.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No panels found.</p>
      )}
    </div>
  );
}
