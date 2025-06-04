// components/Dashboard/ClientDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { HormonesSection, Marker } from "./HormonesSection";
import { InfoCard } from "./InfoCard";

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
type ByPanel = Record<string, Marker[]>;

interface Props {
  panels: Panel[];
  markers: RawMarker[];
  insights: string; // raw markdown from your Edge Function
}

export function ClientDashboard({ panels, markers, insights }: Props) {
  // Build a lookup from panel_id → panel_name
  const [panelMap] = useState(() =>
    panels.reduce((obj, p) => {
      obj[p.id] = p.name;
      return obj;
    }, {} as Record<string, string>)
  );

  // Group markers by panel_id
  const [byPanel] = useState<ByPanel>(() => {
    const result: ByPanel = {};
    markers.forEach((m) => {
      if (!result[m.panel_id]) result[m.panel_id] = [];
      result[m.panel_id].push({
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
    return result;
  });

  //
  // ─── PARSE INSIGHTS INTO panelInsights MAP ───────────────────────────────────
  //
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

  return (
    <div className="w-full flex flex-col md:flex-row">
      <div className="w-full">
        <PageHeader />
        {/* Pass panelInsights down to HormonesSection */}
        <HormonesSection
          byPanel={byPanel}
          panelMap={panelMap}
          panelInsights={panelInsights}
        />
      </div>

      {/* InfoCards (one per panel) can remain here... */}
      <div className="w-full flex flex-col">
        {panels.map((p) => {
          const insightMarkdown = panelInsights[p.name] ?? "";
          return (
            <InfoCard
              key={p.id}
              title={p.name}
              body={insightMarkdown || "No insights available for this panel."}
            />
          );
        })}
      </div>
    </div>
  );
}
