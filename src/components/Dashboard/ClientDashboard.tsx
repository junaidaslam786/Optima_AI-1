// components/Dashboard/ClientDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { HormonesSection, Marker } from "./HormonesSection";
import { InfoCard } from "./InfoCard";

interface Panel { id: string; name: string }
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
  insights: string;
}

export function ClientDashboard({ panels, markers, insights }: Props) {
  // Optional: keep in state if you want to re-render off localStorage on mount
  const [panelMap] = useState(() =>
    panels.reduce((m, p) => ({ ...m, [p.id]: p.name }), {} as Record<string,string>)
  );

  const [byPanel] = useState<ByPanel>(() => {
    const bp: ByPanel = {};
    markers.forEach((m) => {
      bp[m.panel_id] = bp[m.panel_id] ?? [];
      bp[m.panel_id].push({
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
    return bp;
  });

  useEffect(() => {
    // Write everything to localStorage on mount or whenever these props change
    localStorage.setItem("dashboard.panels", JSON.stringify(panels));
    localStorage.setItem("dashboard.markers", JSON.stringify(markers));
    localStorage.setItem("dashboard.insights", insights);
  }, [panels, markers, insights]);

  return (
    <div className="flex">
      <div className="flex-1">
        <PageHeader />
        <HormonesSection byPanel={byPanel} panelMap={panelMap} />
      </div>
      <InfoCard body={insights} />
    </div>
  );
}
