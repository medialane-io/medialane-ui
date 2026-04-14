import type { Config } from "tailwindcss";

const medialanePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        "brand-blue": "#2563eb",
        "brand-navy": "#172554",
        "brand-rose": "#f43f5e",
        "brand-purple": "#9333ea",
        "brand-orange": "#ea580c",
      },
      borderRadius: {
        brand: "11px",
      },
    },
  },
};

export default medialanePreset;
