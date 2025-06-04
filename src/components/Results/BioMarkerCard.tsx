// components/BiomarkerCard.tsx
import React from "react";

interface BiomarkerCardProps {
  title: string;
  value: number;
  unit: string;
  min: number | null;
  max: number | null;
}

export function BiomarkerCard({
  title,
  value,
  unit,
  min,
  max,
}: BiomarkerCardProps) {
  // Flags for whether each bound is provided:
  const hasMin = min != null;
  const hasMax = max != null;

  // We'll compute pct (0–100) and a Tailwind color class for the bar:
  let pct = 100;
  let barColorClass = "bg-green-600";

  if (hasMin && hasMax && max! > min!) {
    // ─── CASE A: Both min & max are defined ───────────────────────────────────
    if (value < min!) {
      // Under‐range: yellow bar based on value/min
      pct = Math.min(Math.max((value / min!) * 100, 0), 100);
      barColorClass = "bg-yellow-500";
    } else if (value <= max!) {
      // In‐range: green bar based on (value − min)/(max − min)
      pct = Math.min(
        Math.max(((value - min!) / (max! - min!)) * 100, 0),
        100
      );
      barColorClass = "bg-green-600";
    } else {
      // Over‐range: red bar at 100%
      pct = 100;
      barColorClass = "bg-red-600";
    }
  } else if (hasMin && !hasMax) {
    // ─── CASE B: min is defined, max is null ─────────────────────────────────
    if (value < min!) {
      // Under‐range relative to 0…min: yellow
      pct = Math.min(Math.max((value / min!) * 100, 0), 100);
      barColorClass = "bg-yellow-500";
    } else {
      // value ≥ min: full‐width green
      pct = 100;
      barColorClass = "bg-green-600";
    }
  } else if (!hasMin && hasMax) {
    // ─── CASE C: min is null, max is defined ─────────────────────────────────
    // Always green bar proportional to value/max
    pct = Math.min(Math.max((value / max!) * 100, 0), 100);
    barColorClass = "bg-green-600";
  } else {
    // ─── CASE D: Both min and max are null ───────────────────────────────────
    // No bounds: always full-width green
    pct = 100;
    barColorClass = "bg-green-600";
  }

  // Build the human-readable "Reference" string
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
    <div className="bg-white rounded-lg shadow p-6">
      {/* Title */}
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>

      {/* Value + Unit */}
      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className="text-xl text-gray-700">{unit}</span>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Reference Range */}
      <p className="mt-2 text-sm text-gray-600">
        Reference: {range} {unit}
      </p>
    </div>
  );
}
