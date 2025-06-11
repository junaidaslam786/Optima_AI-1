// components/Results/BioMarkerCard.tsx
"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BiomarkerCardProps {
  panelName: string;
  title: string;
  value: number;
  unit: string;
  min: number | null;
  max: number | null;
}

export function BiomarkerCard({
  panelName,
  title,
  value,
  unit,
  min,
  max,
}: BiomarkerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  function toggleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!detail) {
      fetchDetail();
    }
  }

  async function fetchDetail() {
    setLoadingDetail(true);
    setErrorDetail(null);

    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL;
      const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const FUNCTION_URL = `${SUPABASE_URL}/marker-details`;
      console.log("url", FUNCTION_URL);

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          apikey: ANON_KEY!,
          Authorization: `Bearer ${ANON_KEY!}`,
        }),
        body: JSON.stringify({
          panel_name: panelName,
          marker_name: title,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || res.statusText);
      }
      const text = await res.text();
      setDetail(text);
    } catch (err: unknown) {
      setErrorDetail(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingDetail(false);
    }
  }

  const hasMin = min != null;
  const hasMax = max != null;

  let pct = 100;
  let barColorClass = "bg-green-600";

  if (hasMin && hasMax && max! > min!) {
    if (value < min!) {
      pct = Math.min(Math.max((value / min!) * 100, 0), 100);
      barColorClass = "bg-yellow-500";
    } else if (value <= max!) {
      pct = Math.min(Math.max(((value - min!) / (max! - min!)) * 100, 0), 100);
      barColorClass = "bg-green-600";
    } else {
      pct = 100;
      barColorClass = "bg-red-600";
    }
  } else if (hasMin && !hasMax) {
    if (value < min!) {
      pct = Math.min(Math.max((value / min!) * 100, 0), 100);
      barColorClass = "bg-yellow-500";
    } else {
      pct = 100;
      barColorClass = "bg-green-600";
    }
  } else if (!hasMin && hasMax) {
    pct = Math.min(Math.max((value / max!) * 100, 0), 100);
    barColorClass = "bg-green-600";
  } else {
    pct = 100;
    barColorClass = "bg-green-600";
  }

  let range: string;
  if (min == null && max != null) {
    range = `<${max}`;
  } else if (min != null && max == null) {
    range = `${min}<`;
  } else if (min != null && max != null) {
    range = `${min} - ${max}`;
  } else {
    range = "-";
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <button
        onClick={toggleExpand}
        className="w-full text-left p-6 flex items-center justify-between space-x-4"
      >
        <div className="flex-1">
          <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-primary">{value}</span>
            <span className="text-xl text-secondary">{unit}</span>
          </div>

          <div className="mt-4 h-2 w-full bg-tertiary/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColorClass}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-secondary">
            Reference: {range} {unit}
          </p>
        </div>
        <div className="flex-shrink-0 text-secondary">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-6 bg-primary/10 text-secondary text-md"
          >
            {loadingDetail && <p>Loading details…</p>}
            {errorDetail && <p className="text-red-500">{errorDetail}</p>}
            {detail && <p>{detail}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
