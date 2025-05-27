// app/page.tsx
import { PageHeader } from "../components/Dashboard/PageHeader";
import { HormonesSection, Marker } from "../components/Dashboard/HormonesSection";
import { InfoCard } from "../components/Dashboard/InfoCard";

import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <p className="text-center mt-20">Please sign in to view your dashboard.</p>;
  }
  const userId = session.user.id;

  // --- 1) fetch the markers & panels as before ---
  const { data: markers, error: mErr } = await supabaseAdmin
    .from("markers")
    .select("id, panel_id, value, normal_low, normal_high, unit, marker, status, panels(name)")
    .eq("user_id", userId);

  if (mErr || !markers) {
    console.error(mErr);
    return <p className="text-red-600">Error loading your markers.</p>;
  }

  const { data: panels, error: pErr } = await supabaseAdmin
    .from("panels")
    .select("id,name");
  if (pErr || !panels) {
    console.error(pErr);
    return <p className="text-red-600">Error loading panel info.</p>;
  }

  const panelMap: Record<string, string> = {};
  panels.forEach((p) => (panelMap[p.id] = p.name));

  const byPanel: Record<string, Marker[]> = {};
  markers.forEach((m: any) => {
    byPanel[m.panel_id] ??= [];
    byPanel[m.panel_id].push({
      id: m.id,
      panel_id: m.panel_id,
      value: m.value,
      normal_low: m.normal_low,
      normal_high: m.normal_high,
      unit: m.unit,
      marker: m.marker,
      status: m.status,
    });
  });

  // --- 2) invoke your AI Edge function on the server ---
  const { data: rawInsights, error: iErr } = await supabaseAdmin.functions.invoke(
    "generate-insights",
    { body: JSON.stringify({ user_id: userId }) }
  );

  if (iErr) console.error("Insights function error:", iErr);
  // supabase-js returns data as `unknown` so coerce it to string
  const insightsMarkdown = (rawInsights as string) ?? "";

  // --- 3) render your dashboard and the InfoCard ---
  return (
    <div className="flex">
      <div className="flex-1">
        <PageHeader />
        <HormonesSection byPanel={byPanel} panelMap={panelMap} />
      </div>

      {/* Right sidebar: show the AI insights or an error */}
      {iErr ? (
        <p className="text-red-600 p-6">{iErr.message}</p>
      ) : (
        <InfoCard body={insightsMarkdown} />
      )}
    </div>
  );
}
