import type { Config } from "tailwindcss";

const medialanePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        "brand-blue": "#3B82F6",
        "brand-navy": "#1E3A5F",
        "brand-rose": "#F43F5E",
        "brand-purple": "#8B5CF6",
        "brand-orange": "#F97316",
      },
      borderRadius: {
        brand: "11px",
      },
    },
  },
};

export default medialanePreset;
