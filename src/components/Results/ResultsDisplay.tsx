"use client";

import { BiomarkerCard } from "@/components/Results/BioMarkerCard";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { PanelReports } from "@/components/Results/PanelReports";
import React from "react";
import { withAuth } from "@/components/Auth/withAuth";

interface Marker {
  id: string;
  value: number;
  normal_low: number | null;
  normal_high: number | null;
  unit: string;
  marker: string;
  status: string;
  panel_id: string;
  panel_name: string;
}

interface ResultsDisplayProps {
  userId: string;
  userName: string;
  userEmail: string;
  panelId: string;
  panelName: string;
  markers: Marker[];
  panelInsights: string;
  insightsErrorOccurred: boolean;
  csvfileId: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  userId,
  userName,
  userEmail,
  panelId,
  panelName,
  markers,
  panelInsights,
  insightsErrorOccurred
}: ResultsDisplayProps) => {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-primary pb-8">
        {panelName} Results
      </h1>
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

            {insightsErrorOccurred && (
              <p className="text-secondary">Failed to load insights.</p>
            )}

            {!insightsErrorOccurred && !panelInsights && (
              <p className="text-secondary">Generating insights…</p>
            )}

            {!insightsErrorOccurred && panelInsights && (
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
};

export default withAuth(ResultsDisplay, { allowedRoles: ["client"] });
