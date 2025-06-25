"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { HormonesTable } from "./HormonesTable";
import { Callout } from "./Callout";
import { InfoCard } from "./InfoCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Marker } from "@/redux/features/markers/markersTypes";
import { Panel } from "@/redux/features/panels/panelsTypes";
import { supabase } from "@/lib/supabase";

interface Props {
  userId: string;
}

type MergedMarker = Marker & {
  value: number;
  status: string;
};

export default function ClientDashboard({ userId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [byPanel, setByPanel] = useState<Record<string, MergedMarker[]>>({});
  const [panelInsights, setPanelInsights] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1️⃣ Get patient_marker_values for this user
      const { data: values, error: vErr } = await supabase
        .from("patient_marker_values")
        .select("*")
        .eq("user_id", userId);

      if (vErr || !values || values.length === 0) {
        setLoading(false);
        return; // Show nothing if no data
      }

      const markerIds = [...new Set(values.map((v) => v.marker_id))];

      // 2️⃣ Get related markers
      const { data: markersRaw, error: mErr } = await supabase
        .from("markers")
        .select("*")
        .in("id", markerIds);

      if (mErr || !markersRaw) {
        console.error(mErr);
        setLoading(false);
        return;
      }

      const panelIds = [...new Set(markersRaw.map((m) => m.panel_id))];

      // 3️⃣ Get related panels
      const { data: panelsRaw, error: pErr } = await supabase
        .from("panels")
        .select("*")
        .in("id", panelIds);

      if (pErr || !panelsRaw) {
        console.error(pErr);
        setLoading(false);
        return;
      }

      // 4️⃣ Merge values into marker objects
      const fullMarkers = markersRaw.map((m) => {
        const match = values.find((v) => v.marker_id === m.id);
        return {
          ...m,
          value: match?.value ?? 0,
          status: match?.status ?? "normal",
          normal_low: m.normal_low,
          normal_high: m.normal_high,
        };
      });

      const groupedByPanel: Record<string, MergedMarker[]> = {};
      fullMarkers.forEach((m) => {
        if (!groupedByPanel[m.panel_id]) groupedByPanel[m.panel_id] = [];
        groupedByPanel[m.panel_id].push(m);
      });

      // 5️⃣ Generate insights
      const { data: insightRaw, error: iErr } = await supabase.functions.invoke(
        "generate-insights",
        {
          body: { user_id: userId },
        }
      );
      if (iErr) console.error(iErr);

      const insightsText = (insightRaw as string) || "";
      const parsedInsights: Record<string, string> = {};
      const rawSections = insightsText.split(/^###\s+/m);
      for (let i = 1; i < rawSections.length; i++) {
        const section = rawSections[i];
        const firstLineBreak = section.indexOf("\n");
        if (firstLineBreak === -1) continue;
        const panelName = section.slice(0, firstLineBreak).trim();
        const body = section.slice(firstLineBreak + 1).trim();
        parsedInsights[panelName] = body;
      }
      setPanels(panelsRaw);
      setByPanel(groupedByPanel);
      setPanelInsights(parsedInsights);
      setLoading(false);
    };

    load();
  }, [userId]);

  function extractFirstSentence(fullText: string): string {
    const trimmed = fullText.trim();
    if (!trimmed) return "";
    const periodIndex = trimmed.indexOf(". ");
    if (periodIndex !== -1) {
      return trimmed.slice(0, periodIndex + 1).trim();
    }
    const newlineIndex = trimmed.indexOf("\n");
    if (newlineIndex !== -1) {
      return trimmed.slice(0, newlineIndex).trim();
    }
    return trimmed;
  }

  function handleClick(panel_id: string, name: string) {
    Cookies.set("selectedPanelId", panel_id);
    Cookies.set("selectedPanelName", name);
    router.push("/results");
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full min-h-screen pb-12">
      <PageHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {panels.map((panel) => {
          const panelName = panel.name;
          const thisPanelMarkers = byPanel[panel.id] || [];
          const fullInsight = panelInsights[panelName] || "";
          let firstSentence = extractFirstSentence(fullInsight);

          if (!firstSentence) {
            firstSentence = `Here are your latest results for “${panelName}.”`;
          }

          return (
            <React.Fragment key={panel.id}>
              <section
                onClick={() => handleClick(panel.id, panel.name)}
                className="cursor-pointer hover:shadow-lg bg-primary/10 shadow rounded-lg p-6 transition"
              >
                <h2 className="text-lg font-semibold text-primary mb-4">
                  {thisPanelMarkers && panelName}
                </h2>
                <HormonesTable
                  markers={thisPanelMarkers.map((m) => ({
                    id: m.id,
                    value: m.value,
                    normal_low: m.normal_low ?? null,
                    normal_high: m.normal_high ?? null,
                    unit: m.unit,
                    marker: m.marker,
                    status: m.status,
                  }))}
                />
                <Callout>{firstSentence}</Callout>
              </section>
              <div>
                <InfoCard
                  title={panelName}
                  body={fullInsight || "No insights available for this panel."}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
