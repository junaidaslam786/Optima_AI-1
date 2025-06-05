// components/PaletteSelector.tsx
"use client";

import { useTheme } from "@/components/Theme/ThemeProvider";

export function PaletteSelector() {
  const { colors, setColor } = useTheme();
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-primary">Primary</label>
        <input
          type="color"
          value={colors.primary} // e.g. "#0B2B40"
          onChange={(e) => setColor("primary", e.target.value)}
          className="h-8 w-8 rounded"
        />
        <span className="text-sm text-gray-700">{colors.primary}</span>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-secondary">Secondary</label>
        <input
          type="color"
          value={colors.secondary} // e.g. "#1D5973"
          onChange={(e) => setColor("secondary", e.target.value)}
          className="h-8 w-8 rounded"
        />
        <span className="text-sm text-gray-700">{colors.secondary}</span>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-tertiary">Tertiary</label>
        <input
          type="color"
          value={colors.tertiary} // e.g. "#7DAAC6"
          onChange={(e) => setColor("tertiary", e.target.value)}
          className="h-8 w-8 rounded"
        />
        <span className="text-sm text-gray-700">{colors.tertiary}</span>
      </div>
    </div>
  );
}
