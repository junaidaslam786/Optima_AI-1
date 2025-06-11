// app/results/page.tsx
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BiomarkerCard } from "@/components/Results/BioMarkerCard";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { redirect } from "next/navigation";
import { PanelReports } from "@/components/Results/PanelReports";

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const userId = session.user.id as string;
  const userName = session.user.name || "";
  const userEmail = session.user.email || "";

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
    .select(
      "id, marker, value, unit, normal_low, normal_high, status, panel_id"
    )
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

  return (
    <div className="w-full min-h-screen pb-12">
      <h1 className="text-3xl font-bold text-primary py-8">{panelName} Results</h1>
      <div className="w-full mx-auto px-8 flex flex-row gap-8">
        <div className="w-full flex-1 flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-8">
            {markers?.map((m) => (
              <BiomarkerCard
                key={m.id}
                panelName={panelName}
                title={m.marker}
                value={m.value}
                unit={m.unit}
                min={m.normal_low}
                max={m.normal_high}
              />
            ))}
          </div>

          <PanelReports
            userId={userId}
            userName={userName}
            userEmail={userEmail}
            panelId={panelId}
            panelName={panelName}
            markers={markers}
            insights={panelInsights}
          />
        </div>

        <aside>
          <div className="bg-primary/10 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-medium text-primary">
              Insights from Optima.AI
            </h2>

            {iErr && (
              <p className="text-secondary">
                Failed to load insights: {iErr.message}
              </p>
            )}

            {!iErr && !panelInsights && (
              <p className="text-secondary">Generating insights…</p>
            )}

            {!iErr && panelInsights && (
              <div className="prose prose-secondary">
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
