import type { Config } from "tailwindcss";

const medialanePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {

        "brand-blue":     "hsl(var(--brand-blue, 220 100% 62%))",
        "brand-purple":   "hsl(var(--brand-purple, 258 90% 66%))",
        "brand-rose":     "hsl(var(--brand-rose, 341 89% 67%))",
        "brand-orange":   "hsl(var(--brand-orange, 23 96% 63%))",
        "brand-maeve":    "hsl(var(--brand-maeve, 327 64% 67%))",
        "brand-navy":     "hsl(var(--brand-navy, 229 51% 8%))",
      },
      borderRadius: {
        brand: "11px",
      },
      fontFamily: {

        display: ["var(--font-display)", "Urbanist", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {

        "2xs": ["11px", { lineHeight: "14px" }],
      },
    },
  },
};

export default medialanePreset;
