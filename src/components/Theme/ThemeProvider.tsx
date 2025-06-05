// components/Theme/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { defaultColors } from "@/lib/defaultColors";

interface ThemeContextValue {
  colors: { primary: string; secondary: string; tertiary: string };
  setColor: (key: "primary" | "secondary" | "tertiary", value: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function hexToRgbTuple(hex: string): [number, number, number] {
  // Remove leading “#” if present
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    // e.g. “0B2” → “00 BB 22”
    hex = [...hex].map((h) => h + h).join("");
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Keep hex strings in React state, so <input type="color"> still works
  const [colors, setColors] = useState(defaultColors);

  // On mount, load from localStorage if available
  useEffect(() => {
    const saved = window.localStorage.getItem("customColors");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColors({
          primary: parsed.primary || defaultColors.primary,
          secondary: parsed.secondary || defaultColors.secondary,
          tertiary: parsed.tertiary || defaultColors.tertiary,
        });
      } catch {
        setColors(defaultColors);
      }
    }
  }, []);

  // Whenever "colors" (hex) changes, convert each into RGB triple
  // and write to the CSS var --color-*-rgb
  useEffect(() => {
    Object.entries(colors).forEach(([key, hexValue]) => {
      // key is "primary" | "secondary" | "tertiary"
      const [r, g, b] = hexToRgbTuple(hexValue);
      // write exactly e.g. "--color-primary-rgb: 11 43 64"
      document.documentElement.style.setProperty(
        `--color-${key}-rgb`,
        `${r} ${g} ${b}`
      );
    });
    window.localStorage.setItem("customColors", JSON.stringify(colors));
  }, [colors]);

  function setColor(
    key: "primary" | "secondary" | "tertiary",
    value: string
  ) {
    // value is a hex string like "#0B2B40"
    setColors((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <ThemeContext.Provider value={{ colors, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
