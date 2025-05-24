// components/BiomarkerCard.tsx
import React from "react";

interface BiomarkerCardProps {
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
}

export function BiomarkerCard({
  title,
  value,
  unit,
  min,
  max,
}: BiomarkerCardProps) {
  // Calculate percentage for the green bar
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>

      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className="text-xl text-gray-700">{unit}</span>
      </div>

      {/* progress bar */}
      <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-600 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Reference: {min} - {max} {unit}
      </p>
    </div>
  );
}
