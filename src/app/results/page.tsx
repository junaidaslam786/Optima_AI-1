import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ResultsDisplay from "@/components/Results/ResultsDisplay";
import toast from "react-hot-toast";
interface MergedMarkerForDisplay {
  id: string;
  value: number;
  status: string;
  normal_low: number | null;
  normal_high: number | null;
  unit: string;
  marker: string;
  panel_id: string;
  panel_name: string;
}

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  const userId = session?.user.id as string;
  const userName = session?.user.name || "";
  const userEmail = session?.user.email || "";

  const cookieStore = cookies();
  const panelId = (await cookieStore).get("selectedPanelId")?.value;
  const panelName =
    (await cookieStore).get("selectedPanelName")?.value || "Results";
  const csvfileId = (await cookieStore).get("selectedCsvFileId")?.value;

  if (!panelId || !csvfileId) {
    toast.error("No panel or CSV file selected.");
    window.history.back();
  }

  const { data: patientMarkerValues, error: pmvErr } = await supabaseAdmin
    .from("patient_marker_values")
    .select(
      `
      id,
      value,
      status,
      markers(
        id,
        marker,
        unit,
        normal_low,
        normal_high,
        panel_id,
        panels(name)
      )
    `
    )
    .eq("user_id", userId)
    .eq("csvfile_id", csvfileId)
    .eq("markers.panel_id", panelId);

  if (pmvErr) {
    console.error("Error loading patient marker values:", pmvErr);
    return (
      <p className="p-6 text-secondary">
        Error loading patient data: {pmvErr.message}
      </p>
    );
  }

  const markersForDisplay: MergedMarkerForDisplay[] = (
    patientMarkerValues || []
  )
    .map(
      (pmv: {
        id: string;
        value: number;
        status: string;
        markers:
          | {
              id: string;
              marker: string;
              unit: string;
              normal_low: number | null;
              normal_high: number | null;
              panel_id: string;
              panels?: { name?: string }[] | { name?: string } | null;
            }
          | null
          | Array<{
              id: string;
              marker: string;
              unit: string;
              normal_low: number | null;
              normal_high: number | null;
              panel_id: string;
              panels?: { name?: string }[] | { name?: string } | null;
            }>;
      }) => {
        const markerObj = Array.isArray(pmv.markers)
          ? pmv.markers[0]
          : pmv.markers;
        if (!markerObj) {
          console.warn(
            `Skipping patient_marker_value with ID ${pmv.id} due to missing marker data.`
          );
          return null;
        }
        let panelName = "Unknown Panel";
        if (markerObj.panels) {
          if (Array.isArray(markerObj.panels)) {
            panelName = markerObj.panels[0]?.name || "Unknown Panel";
          } else {
            panelName = markerObj.panels.name || "Unknown Panel";
          }
        }
        return {
          id: markerObj.id,
          value: pmv.value,
          status: pmv.status,
          normal_low: markerObj.normal_low,
          normal_high: markerObj.normal_high,
          unit: markerObj.unit,
          marker: markerObj.marker,
          panel_id: markerObj.panel_id,
          panel_name: panelName,
        };
      }
    )
    .filter((m): m is MergedMarkerForDisplay => m !== null);

  const { data: rawInsights, error: iErr } =
    await supabaseAdmin.functions.invoke("generate-panel-insights", {
      body: {
        user_id: userId,
        panel_id: panelId,
        csvfile_id: csvfileId,
      },
    });

  const panelInsights = typeof rawInsights === "string" ? rawInsights : "";
  const insightsErrorOccurred = !!iErr;

  return (
    <div className="w-full min-h-screen bg-primary/10 p-12">
      <ResultsDisplay
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        panelId={panelId || ""}
        panelName={panelName}
        markers={markersForDisplay}
        panelInsights={panelInsights}
        insightsErrorOccurred={insightsErrorOccurred}
        csvfileId={csvfileId || ""}
      />
    </div>
  );
}
