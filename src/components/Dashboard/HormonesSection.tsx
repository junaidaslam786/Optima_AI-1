// components/Dashboard/HormonesSection.tsx
"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { HormonesTable } from "./HormonesTable";
import { Callout } from "./Callout";

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
  panelInsights: Record<string, string>; // map from panelName → full markdown insight
}

export function HormonesSection({
  byPanel,
  panelMap,
  panelInsights,
}: SectionProps) {
  const router = useRouter();

  function handleClick(panel_id: string) {
    const name = panelMap[panel_id] || "Unnamed Panel";
    Cookies.set("selectedPanelId", panel_id);
    Cookies.set("selectedPanelName", name);
    router.push("/results");
  }

  return (
    <>
      {Object.entries(byPanel).map(([panel_id, list]) => {
        const panelName = panelMap[panel_id] || "Unnamed Panel";
        const fullInsight = panelInsights[panelName] || "";

        // ─── EXTRACT FIRST SENTENCE (everything up to the first ". ") ───
        let firstSentence = "";
        if (fullInsight.trim()) {
          // Look for the first instance of ". "
          const periodIndex = fullInsight.indexOf(". ");
          if (periodIndex !== -1) {
            // include the period in the substring
            firstSentence = fullInsight.slice(0, periodIndex + 1).trim();
          } else {
            // fallback: if no ". " found, use the entire string or up to the first newline
            const newlineIndex = fullInsight.indexOf("\n");
            if (newlineIndex !== -1) {
              firstSentence = fullInsight.slice(0, newlineIndex).trim();
            } else {
              firstSentence = fullInsight.trim();
            }
          }
        }

        // If still empty, fall back to a generic message
        if (!firstSentence) {
          firstSentence = `Here are your latest results for “${panelName}.”`;
        }

        return (
          <section
            key={panel_id}
            onClick={() => handleClick(panel_id)}
            className="cursor-pointer hover:shadow-lg bg-white shadow rounded-lg p-6 mb-8 transition"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {panelName}
            </h2>

            <HormonesTable markers={list} />

            <Callout>{firstSentence}</Callout>
          </section>
        );
      })}
    </>
  );
}
