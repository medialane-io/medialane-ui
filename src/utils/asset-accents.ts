export interface AssetAccent {
  accentBorderClassName: string;
  accentHeaderStyle: string;
  accentAvatarStyle: string;
  accentLabelClassName: string;
  accentCountStyle: { background: string };
}

const CLASSES = {
  blue: { border: "border-brand-blue/20", label: "text-brand-blue" },
  purple: { border: "border-brand-purple/20", label: "text-brand-purple" },
} as const;

const accent = (color: keyof typeof CLASSES): AssetAccent => ({
  accentBorderClassName: CLASSES[color].border,
  accentHeaderStyle: `hsl(var(--brand-${color}) / 0.1)`,
  accentAvatarStyle: `hsl(var(--brand-${color}) / 0.3)`,
  accentLabelClassName: CLASSES[color].label,
  accentCountStyle: { background: `hsl(var(--brand-${color}))` },
});

export const ASSET_ACCENTS = {
  standard: accent("blue"),
  ticket: accent("blue"),
  membership: accent("purple"),
  edition: accent("purple"),
} as const satisfies Record<string, AssetAccent>;

export type AssetAccentName = keyof typeof ASSET_ACCENTS;
