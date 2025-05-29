// app/results/page.tsx
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BiomarkerCard } from "@/components/Results/BioMarkerCard";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { redirect } from "next/navigation";

export default async function ResultsPage() {
  // ── 1) Who’s logged in? ─────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }
  const user_id = session.user.id;

  // ── 2) Which panel was selected? ────────────────────────────────────
  const cookieStore = await cookies();
  const panelIdCookie = cookieStore.get("selectedPanelId");
  const panelNameCookie = cookieStore.get("selectedPanelName");
  const panel_id = panelIdCookie?.value;
  const panelName = panelNameCookie?.value || "Results";

  if (!panel_id) {
    return (
      <p className="p-6 text-red-500">
        No panel selected. Please go back and click on a panel first.
      </p>
    );
  }

  // ── 3) Fetch markers for that panel ─────────────────────────────────
  const { data: markers, error: mErr } = await supabaseAdmin
    .from("markers")
    .select("id, marker, value, unit, normal_low, normal_high, status")
    .eq("panel_id", panel_id);

  if (mErr) {
    console.error("Error loading markers:", mErr);
    return (
      <p className="p-6 text-red-600">Error loading markers: {mErr.message}</p>
    );
  }

  // ── 4) Call your generate-panel-insights function ───────────────────
  const { data: rawInsights, error: iErr } =
    await supabaseAdmin.functions.invoke("generate-panel-insights", {
      body: JSON.stringify({ user_id, panel_id }),
    });

  if (iErr) {
    console.error("Insights function error:", iErr);
    // we’ll still render markers, but show a warning below
  }
  const panelInsights = typeof rawInsights === "string" ? rawInsights : "";

  // ── 5) Render everything ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-row gap-8">
        <div className="w-full flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {panelName} Results
          </h1>

          <div className="grid grid-cols-1 gap-8 mb-8">
            {markers?.map((m) => (
              <BiomarkerCard
                key={m.id}
                title={m.marker}
                value={m.value}
                unit={m.unit}
                min={m.normal_low}
                max={m.normal_high}
              />
            ))}
          </div>
        </div>

        <aside className="w-full">
          <div className="bg-cyan-50 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-medium text-gray-800 font-semibold">
              Insights from Optima.AI
            </h2>

            {iErr && (
              <p className="text-red-600">
                Failed to load insights: {iErr.message}
              </p>
            )}

            {!iErr && !panelInsights && (
              <p className="text-gray-700">Generating insights…</p>
            )}

            {!iErr && panelInsights && (
              <div className="prose prose-blue text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {panelInsights}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
