// components/Results/PanelReports.tsx
"use client";

import { useState } from "react";

interface Marker {
  id: string;
  panel_id: string;
  value: number;
  normal_low: number | null;
  normal_high: number | null;
  unit: string;
  marker: string;
  status: string;
}

interface PanelReportsProps {
  userId: string;
  userName: string;
  userEmail: string;
  panelId: string;
  panelName: string;
  markers: Marker[];
  insights: string;
}

export function PanelReports({
  userId,
  userName,
  userEmail,
  panelId,
  panelName,
  markers,
  insights,
}: PanelReportsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          panels: [{ id: panelId, name: panelName }],
          markers,
          insights,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate report");
      }

      setIsGenerating(false);
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  }

  return (
    <div className="mt-8">
      {error && <p className="text-secondary mb-2">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary disabled:opacity-50"
      >
        {isGenerating ? "Saving PDF…" : "Save PDF"}
      </button>
    </div>
  );
}
