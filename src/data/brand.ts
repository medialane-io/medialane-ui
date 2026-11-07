
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

const token = (name: string) => `hsl(var(--${name}))`;

export const BRAND_COLOR = {
  blue: token("brand-blue"),
  purple: token("brand-purple"),
  rose: token("brand-rose"),
  orange: token("brand-orange"),
  maeve: token("brand-maeve"),
  navy: token("brand-navy"),
  red: token("destructive"),
} as const;

export type BrandColorName = keyof typeof BRAND_COLOR;

const loop = (a: BrandColorName, b: BrandColorName): [string, string, string] => [BRAND_COLOR[a], BRAND_COLOR[b], BRAND_COLOR[a]];

export const ACTION_GRADIENTS: Record<string, [string, string, string]> = {
  buy: loop("blue", "purple"),
  submit: loop("maeve", "purple"),
  offer: loop("rose", "orange"),
  remix: loop("purple", "rose"),
  license: loop("blue", "purple"),
};

export const ACTION_FOREGROUNDS: Record<string, string> = {
  buy: BRAND_COLOR.blue,
  submit: BRAND_COLOR.purple,
  offer: BRAND_COLOR.orange,
  remix: BRAND_COLOR.purple,
  license: BRAND_COLOR.blue,
};

export const TONE_GRADIENTS: Record<string, [string, string, string]> = {
  blue: loop("blue", "purple"),
  purple: loop("purple", "rose"),
  orange: loop("orange", "rose"),
  red: loop("red", "rose"),
  rose: loop("rose", "orange"),
};

export const TONE_FOREGROUNDS: Record<string, string> = {
  blue: BRAND_COLOR.blue,
  purple: BRAND_COLOR.purple,
  orange: BRAND_COLOR.orange,
  red: BRAND_COLOR.red,
  rose: BRAND_COLOR.rose,
};

export const BRAND_GRADIENT = `linear-gradient(115deg, ${[BRAND_COLOR.blue, BRAND_COLOR.purple, BRAND_COLOR.rose, BRAND_COLOR.orange, BRAND_COLOR.blue].join(", ")})`;
