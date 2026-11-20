
export const BRAND = {
  blue: {
    text:    "text-brand-blue",
    bg:      "bg-brand-blue/10",
    bgSolid: "bg-brand-blue/15",
    from:    "from-brand-blue/20",
    to:      "to-brand-blue/20",
  },
  purple: {
    text:    "text-brand-purple",
    bg:      "bg-brand-purple/10",
    bgSolid: "bg-brand-purple/15",
    from:    "from-brand-purple/20",
    to:      "to-brand-purple/20",
  },
  rose: {
    text:    "text-brand-rose",
    bg:      "bg-brand-rose/10",
    bgSolid: "bg-brand-rose/15",
    from:    "from-brand-rose/20",
    to:      "to-brand-rose/20",
  },
  orange: {
    text:    "text-brand-orange",
    bg:      "bg-brand-orange/10",
    bgSolid: "bg-brand-orange/15",
    from:    "from-brand-orange/20",
    to:      "to-brand-orange/20",
  },
  maeve: {
    text:    "text-brand-maeve",
    bg:      "bg-brand-maeve/10",
    bgSolid: "bg-brand-maeve/15",
  },
  navy: {
    text:    "text-brand-navy",
    bg:      "bg-brand-navy/10",
    from:    "from-brand-navy/10",
    to:      "to-brand-navy/10",
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

/** A brand colour at the given opacity. */
export const brandTint = (color: BrandColorName, alpha: number) => `hsl(var(--${TOKEN[color]}) / ${alpha})`;

type Pair = readonly [BrandColorName, BrandColorName];

export const ACTION_PAIRS = {
  buy: ["blue", "purple"],
  submit: ["maeve", "purple"],
  offer: ["rose", "orange"],
  remix: ["purple", "rose"],
  license: ["blue", "purple"],
} as const satisfies Record<string, Pair>;

export const TONE_PAIRS = {
  blue: ["blue", "purple"],
  purple: ["purple", "rose"],
  orange: ["orange", "rose"],
  red: ["red", "rose"],
  rose: ["rose", "orange"],
} as const satisfies Record<string, Pair>;

export const ACTION_FOREGROUNDS: Record<keyof typeof ACTION_PAIRS, string> = {
  buy: BRAND_COLOR.blue,
  submit: BRAND_COLOR.purple,
  offer: BRAND_COLOR.orange,
  remix: BRAND_COLOR.purple,
  license: BRAND_COLOR.blue,
};

export const TONE_FOREGROUNDS: Record<keyof typeof TONE_PAIRS, string> = {
  blue: BRAND_COLOR.blue,
  purple: BRAND_COLOR.purple,
  orange: BRAND_COLOR.orange,
  red: BRAND_COLOR.red,
  rose: BRAND_COLOR.rose,
};

export const BRAND_GRADIENT = `linear-gradient(115deg, ${[BRAND_COLOR.blue, BRAND_COLOR.purple, BRAND_COLOR.rose, BRAND_COLOR.orange, BRAND_COLOR.blue].join(", ")})`;
