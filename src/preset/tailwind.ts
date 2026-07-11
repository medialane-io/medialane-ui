import type { Config } from "tailwindcss";

const medialanePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        "brand-blue":     "#3b7bff",
        "brand-electric": "#1a17ff",
        "brand-indigo":   "#5b4ce6",
        "brand-purple":   "#8a5cf6",
        "brand-rose":     "#f6608f",
        "brand-orange":   "#fb8b46",
        "brand-price":    "#f97316",
        "brand-navy":     "#0a0e1f",
      },
      borderRadius: {
        brand: "11px",
      },
      fontFamily: {
        // Brand display face (headings). Apps define --font-display via
        // next/font (Urbanist); falls back to the body face when unset.
        display: ["var(--font-display)", "Urbanist", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
};

export default medialanePreset;
