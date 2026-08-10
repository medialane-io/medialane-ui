import type { Config } from "tailwindcss";

const medialanePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Each resolves via the app's own --brand-* CSS var when defined
        // (medialane-io, medialane-starknet); the fallback keeps every
        // color working standalone for any consumer that defines none
        // (medialane-portal today, or a future app).
        "brand-blue":     "hsl(var(--brand-blue, 220 100% 62%))",
        "brand-electric": "hsl(var(--brand-electric, 241 100% 55%))",
        "brand-indigo":   "hsl(var(--brand-indigo, 246 75% 60%))",
        "brand-purple":   "hsl(var(--brand-purple, 258 90% 66%))",
        "brand-rose":     "hsl(var(--brand-rose, 341 89% 67%))",
        "brand-orange":   "hsl(var(--brand-orange, 23 96% 63%))",
        "brand-price":    "hsl(var(--brand-price, 25 95% 53%))",
        "brand-navy":     "hsl(var(--brand-navy, 229 51% 8%))",
      },
      borderRadius: {
        brand: "11px",
      },
      fontFamily: {
        // Brand display face (headings). Apps define --font-display via
        // next/font (Urbanist); falls back to the body face when unset.
        display: ["var(--font-display)", "Urbanist", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Floor for true micro-text (timestamps, counts) — nothing in the
        // package should go below this. Everything else uses Tailwind's
        // built-in scale (xs=12px and up).
        "2xs": ["11px", { lineHeight: "14px" }],
      },
    },
  },
};

export default medialanePreset;
