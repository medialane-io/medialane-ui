import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const pair = (name: string) => ({
  DEFAULT: `hsl(var(--${name}))`,
  foreground: `hsl(var(--${name}-foreground))`,
});

const medialanePreset: Partial<Config> = {
  darkMode: ["class"],
  plugins: [
    plugin(({ addBase, theme }) => {
      addBase({
        "*": { borderColor: theme("colors.border") },
        "html, body": { overflowX: "clip", maxWidth: "100%" },
        body: {
          backgroundColor: theme("colors.background"),
          color: theme("colors.foreground"),
          fontFeatureSettings: '"rlig" 1, "calt" 1',
        },
        "h1, h2, h3, h4": { letterSpacing: theme("letterSpacing.tight") },
      });
    }),
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: pair("primary"),
        secondary: pair("secondary"),
        destructive: pair("destructive"),
        muted: pair("muted"),
        accent: pair("accent"),
        popover: pair("popover"),
        card: pair("card"),
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        "brand-blue":     "hsl(var(--brand-blue))",
        "brand-purple":   "hsl(var(--brand-purple))",
        "brand-rose":     "hsl(var(--brand-rose))",
        "brand-orange":   "hsl(var(--brand-orange))",
        "brand-maeve":    "hsl(var(--brand-maeve))",
        "brand-navy":     "hsl(var(--brand-navy))",
      },
      borderRadius: {
        brand: "11px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
