// components/Dashboard/ClientDashboard.tsx
"use client";

import React, { useState } from "react";
import { PageHeader } from "./PageHeader";
import { HormonesTable } from "./HormonesTable";
import { Callout } from "./Callout";
import { InfoCard } from "./InfoCard";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface Panel {
  id: string;
  name: string;
}
interface RawMarker {
  id: string;
  panel_id: string;
  value: number;
  normal_low: number;
  normal_high: number;
  unit: string;
  marker: string;
  status: string;
}
type ByPanel = Record<string, RawMarker[]>;

interface Props {
  panels: Panel[];
  markers: RawMarker[];
  insights: string;
}

export function ClientDashboard({ panels, markers, insights }: Props) {
  const router = useRouter();
  const [panelMap] = useState(() => {
    return panels.reduce((acc, panel) => {
      acc[panel.id] = panel.name;
      return acc;
    }, {} as Record<string, string>);
  });

  const [byPanel] = useState<ByPanel>(() => {
    const result: ByPanel = {};
    markers.forEach((m) => {
      if (!result[m.panel_id]) result[m.panel_id] = [];
      result[m.panel_id].push(m);
    });
    return result;
  });

  const [panelInsights] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    const rawSections = insights.split(/^###\s+/m);
    for (let i = 1; i < rawSections.length; i++) {
      const section = rawSections[i];
      const firstLineBreak = section.indexOf("\n");
      if (firstLineBreak === -1) continue;
      const panelName = section.slice(0, firstLineBreak).trim();
      const body = section.slice(firstLineBreak + 1).trim();
      map[panelName] = body;
    }
    return map;
  });

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

  function handleClick(panel_id: string) {
    const name = panelMap[panel_id] || "Unnamed Panel";
    Cookies.set("selectedPanelId", panel_id);
    Cookies.set("selectedPanelName", name);
    router.push("/results");
  }

  return (
    <div className="w-full">
      <PageHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {panels.map((panel) => {
          const panelName = panelMap[panel.id] || "Unnamed Panel";
          const thisPanelMarkers = byPanel[panel.id] || [];
          const fullInsight = panelInsights[panelName] || "";
          let firstSentence = extractFirstSentence(fullInsight);
          if (!firstSentence) {
            firstSentence = `Here are your latest results for “${panelName}.”`;
          }

          return (
            <React.Fragment key={panel.id}>
              <section
                onClick={() => handleClick(panel.id)}
                className="cursor-pointer hover:shadow-lg bg-primary/10 shadow rounded-lg p-6 transition"
              >
                <h2 className="text-lg font-semibold text-primary mb-4">
                  {panelName}
                </h2>
                <HormonesTable
                  markers={thisPanelMarkers.map((m) => ({
                    id: m.id,
                    value: m.value,
                    normal_low: m.normal_low,
                    normal_high: m.normal_high,
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
