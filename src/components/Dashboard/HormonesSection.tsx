// components/HormonesSection.tsx
"use client";

import { HormonesTable } from "./HormonesTable";
import { Callout }      from "./Callout";

export interface Marker {
  id: string;
  panel_id: string;
  value: number;
  normal_low: number;
  normal_high: number;
  unit: string;
  marker: string;
  status: string;
}

interface SectionProps {
  byPanel: Record<string, Marker[]>;
  panelMap: Record<string, string>;
}

export function HormonesSection({ byPanel, panelMap }: SectionProps) {
  return (
    <>
      {Object.entries(byPanel).map(([panel_id, list]) => {
        const panelName = panelMap[panel_id] || "Unnamed Panel";
        return (
          <section key={panel_id} className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              {panelName}
            </h2>

            <HormonesTable markers={list} />

            <Callout>
              {/* dummy text */}
              Here are your latest results for “{panelName}.”
            </Callout>
          </section>
        );
      })}
    </>
  );
}
