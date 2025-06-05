import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "rgb(var(--color-primary-rgb))",
        secondary: "rgb(var(--color-secondary-rgb))",
        tertiary:  "rgb(var(--color-tertiary-rgb))",
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
