// app/page.tsx
import { getServerSession } from "next-auth/next";
import { ClientDashboard } from "@/components/Dashboard/ClientDashboard";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }
  const userId = session.user.id;

  const { data: markers, error: mErr } = await supabaseAdmin
    .from("markers")
    .select(
      "id, panel_id, value, normal_low, normal_high, unit, marker, status"
    )
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

  const { data: rawInsights, error: iErr } =
    await supabaseAdmin.functions.invoke("generate-insights", {
      body: JSON.stringify({ user_id: userId }),
    });
  if (iErr) console.error("Insights function error:", iErr);
  const insightsMarkdown = (rawInsights as string) || "";

  return (
    <ClientDashboard
      panels={panels}
      markers={markers}
      insights={insightsMarkdown}
    />
  );
}
