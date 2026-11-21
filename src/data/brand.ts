export const BRAND = {
  blue: {
    text:    "text-brand-blue",
    bg:      "bg-brand-blue/10",
    bgSolid: "bg-brand-blue/15",
  },
  purple: {
    text:    "text-brand-purple",
    bg:      "bg-brand-purple/10",
    bgSolid: "bg-brand-purple/15",
  },
  rose: {
    text:    "text-brand-rose",
    bg:      "bg-brand-rose/10",
    bgSolid: "bg-brand-rose/15",
  },
  orange: {
    text:    "text-brand-orange",
    bg:      "bg-brand-orange/10",
    bgSolid: "bg-brand-orange/15",
  },
  maeve: {
    text:    "text-brand-maeve",
    bg:      "bg-brand-maeve/10",
    bgSolid: "bg-brand-maeve/15",
  },
  navy: {
    text:    "text-brand-navy",
    bg:      "bg-brand-navy/10",
  },
} as const;

const TOKEN = {
  blue: "brand-blue",
  purple: "brand-purple",
  rose: "brand-rose",
  orange: "brand-orange",
  maeve: "brand-maeve",
  navy: "brand-navy",
  red: "destructive",
} as const;

export type BrandColorName = keyof typeof TOKEN;

export const BRAND_COLOR = Object.fromEntries(
  Object.entries(TOKEN).map(([name, token]) => [name, `hsl(var(--${token}))`]),
) as { readonly [K in BrandColorName]: string };
