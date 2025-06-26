import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ResultsDisplay from "@/components/Results/ResultsDisplay";

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  const userId = session?.user.id as string;
  const userName = session?.user.name || "";
  const userEmail = session?.user.email || "";

  const cookieStore = await cookies();
  const panelIdCookie = cookieStore.get("selectedPanelId");
  const panelNameCookie = cookieStore.get("selectedPanelName");
  const panelId = panelIdCookie?.value;
  const panelName = panelNameCookie?.value || "Results";

  if (!panelId) {
    return (
      <p className="p-6 text-secondary">
        No panel selected. Please go back and click on a panel first.
      </p>
    );
  }

  const { data: markers, error: mErr } = await supabaseAdmin
    .from("markers")
    .select("*")
    .eq("panel_id", panelId);

  if (mErr) {
    console.error("Error loading markers:", mErr);
    return (
      <p className="p-6 text-secondary">
        Error loading markers: {mErr.message}
      </p>
    );
  }

  const { data: rawInsights, error: iErr } =
    await supabaseAdmin.functions.invoke("generate-panel-insights", {
      body: JSON.stringify({ user_id: userId, panel_id: panelId }),
    });

  const panelInsights = typeof rawInsights === "string" ? rawInsights : "";
  const insightsErrorOccurred = !!iErr;

  return (
    <div className="w-full min-h-screen pb-12">
      <ResultsDisplay
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        panelId={panelId}
        panelName={panelName}
        markers={markers || []}
        panelInsights={panelInsights}
        insightsErrorOccurred={insightsErrorOccurred}
      />
    </div>
  );
}
