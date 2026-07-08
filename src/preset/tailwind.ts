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
    },
  },
};

export default medialanePreset;
