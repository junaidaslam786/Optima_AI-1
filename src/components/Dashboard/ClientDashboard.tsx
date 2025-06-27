"use client";

import React, { useEffect, useState } from "react";
import type { JSX } from "react";
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
import { withAuth } from "../Auth/withAuth";

interface Props {
  userId: string;
}

type MergedMarker = Marker & {
  value: number;
  status: string;
  csvfile_id: string; // Add csvfile_id to MergedMarker
};

// Define a type for grouped data by csvfile_id
type GroupedResults = Record<
  string, // csvfile_id
  {
    uploadDetails: { filename: string; created_at: string } | null;
    panels: Panel[];
    byPanel: Record<string, MergedMarker[]>;
    panelInsights: Record<string, string>;
  }
>;

const ClientDashboard: React.FC<Props> = ({ userId }: Props): JSX.Element => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: values, error: vErr } = await supabase
        .from("patient_marker_values")
        .select("*")
        .eq("user_id", userId);

      if (vErr || !values || values.length === 0) {
        setLoading(false);
        return;
      }

      const csvFileIds = [...new Set(values.map((v) => v.csvfile_id))];

      const allMarkerIds = [...new Set(values.map((v) => v.marker_id))];

      // 2️⃣ Get related markers
      const { data: markersRaw, error: mErr } = await supabase
        .from("markers")
        .select("*")
        .in("id", allMarkerIds);

      if (mErr || !markersRaw) {
        console.error(mErr);
        setLoading(false);
        return;
      }

      const allPanelIds = [...new Set(markersRaw.map((m) => m.panel_id))];

      // 3️⃣ Get related panels
      const { data: panelsRaw, error: pErr } = await supabase
        .from("panels")
        .select("*")
        .in("id", allPanelIds);

      if (pErr || !panelsRaw) {
        console.error(pErr);
        setLoading(false);
        return;
      }

      const newGroupedResults: GroupedResults = {};

      for (const csvfile_id of csvFileIds) {
        const valuesForCsv = values.filter((v) => v.csvfile_id === csvfile_id);
        const markerIdsForCsv = [
          ...new Set(valuesForCsv.map((v) => v.marker_id)),
        ];

        const markersForCsv = markersRaw.filter((m) =>
          markerIdsForCsv.includes(m.id)
        );

        const panelIdsForCsv = [
          ...new Set(markersForCsv.map((m) => m.panel_id)),
        ];
        const panelsForCsv = panelsRaw.filter((p) =>
          panelIdsForCsv.includes(p.id)
        );

        // 4️⃣ Merge values into marker objects
        const fullMarkers: MergedMarker[] = markersForCsv.map((m) => {
          const match = valuesForCsv.find((v) => v.marker_id === m.id);
          return {
            ...m,
            value: match?.value ?? 0,
            status: match?.status ?? "normal",
            normal_low: m.normal_low,
            normal_high: m.normal_high,
            csvfile_id: csvfile_id, // Assign csvfile_id here
          };
        });

        const groupedByPanel: Record<string, MergedMarker[]> = {};
        fullMarkers.forEach((m) => {
          if (!groupedByPanel[m.panel_id]) groupedByPanel[m.panel_id] = [];
          groupedByPanel[m.panel_id].push(m);
        });

        // Fetch upload details for the current csvfile_id
        const { data: uploadDetails, error: uploadError } = await supabase
          .from("uploads")
          .select("filename, created_at")
          .eq("id", csvfile_id)
          .single();

        if (uploadError) {
          console.error(
            `Error fetching upload details for ${csvfile_id}:`,
            uploadError
          );
        }

        newGroupedResults[csvfile_id] = {
          uploadDetails: uploadDetails || null,
          panels: panelsForCsv,
          byPanel: groupedByPanel,
          panelInsights: {}, // Insights will be fetched per csvfile_id
        };
      }

      // 5️⃣ Generate insights for each csvfile_id
      try {
        await Promise.all(
          csvFileIds.map(async (csvfile_id) => {
            const response = await fetch("/api/insights", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId, csvfileId: csvfile_id }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const insightRaw = await response.json();
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
            newGroupedResults[csvfile_id].panelInsights = parsedInsights;
          })
        );
      } catch (iErr: unknown) {
        console.error("Insights API call error:", iErr);
      } finally {
        setGroupedResults(newGroupedResults);
        setLoading(false);
      }
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

  function formatDateToUK(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-UK", options);
  }

  function handleClick(panel_id: string, name: string, csvfile_id: string) {
    Cookies.set("selectedPanelId", panel_id);
    Cookies.set("selectedPanelName", name);
    Cookies.set("selectedCsvFileId", csvfile_id);
    router.push("/results");
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full min-h-screen pb-12">
      <PageHeader />
      {Object.entries(groupedResults).map(
        ([csvfile_id, { uploadDetails, panels, byPanel, panelInsights }]) => (
          <div key={csvfile_id} className="mb-8">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
              {panels.map((panel) => {
                const panelName = panel.name;
                const thisPanelMarkers = byPanel[panel.id] || [];
                const fullInsight = panelInsights[panelName] || "";
                let firstSentence = extractFirstSentence(fullInsight);

                if (!firstSentence) {
                  firstSentence = `Here are your latest results for “${panelName}.”`;
                }

                return (
                  <React.Fragment key={`${csvfile_id}-${panel.id}`}>
                    <section
                      onClick={() =>
                        handleClick(panel.id, panel.name, csvfile_id)
                      }
                      className="w-full cursor-pointer hover:shadow-lg bg-primary/10 shadow rounded-lg p-6 transition"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-primary">
                          {thisPanelMarkers && panelName}
                        </h2>
                        {/* The date here will now be derived from the uploadDetails */}
                        <h2 className="text-lg font-medium text-primary">
                          {uploadDetails?.created_at
                            ? formatDateToUK(uploadDetails.created_at)
                            : "N/A"}
                        </h2>
                      </div>
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
                        body={
                          fullInsight || "No insights available for this panel."
                        }
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default withAuth(ClientDashboard, { allowedRoles: ["client"] });
