// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import ClientDashboard from "@/components/Dashboard/ClientDashboard";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }
  const userId = session.user.id;

  const { data: markers, error: mErr } = await supabaseAdmin
    .from("markers")
    .select(
      "id, panel_id, value, normal_low, normal_high, unit, marker, status, csvfile_id, user_id, col_date, rep_date, created_at, updated_at"
    )
    .eq("user_id", userId);

  if (mErr || !markers) {
    console.error(mErr);
    return <p className="text-secondary">Error loading your markers.</p>;
  }

  const { data: panels, error: pErr } = await supabaseAdmin
    .from("panels")
    .select("id,name, created_at, updated_at");
  if (pErr || !panels) {
    console.error(pErr);
    return <p className="text-secondary">Error loading panel info.</p>;
  }

  const { data: rawInsights, error: iErr } =
    await supabaseAdmin.functions.invoke("generate-insights", {
      body: JSON.stringify({ user_id: userId }),
    });
  if (iErr) console.error("Insights function error:", iErr);
  const insightsMarkdown = (rawInsights as string) || "";

  return (
    <div className="w-full min-h-screen pb-12">
      <ClientDashboard
        panels={panels}
        markers={markers}
        insights={insightsMarkdown}
      />
    </div>
  );
}
