/**
 * Typed Tailwind class constants for Medialane brand colors.
 * Mirrors the brand color extensions defined in the Tailwind preset.
 * Keeping these as string literals ensures JIT picks them up via the
 * consumer's content scan of node_modules/@medialane/ui/dist.
 */
export const BRAND = {
  blue: {
    text:    "text-brand-blue",
    bg:      "bg-brand-blue/10",
    bgSolid: "bg-brand-blue/15",
    from:    "from-brand-blue/20",
    to:      "to-brand-blue/20",
  },
  electric: {
    text:    "text-brand-electric",
    bg:      "bg-brand-electric/10",
    bgSolid: "bg-brand-electric/15",
    from:    "from-brand-electric/20",
    to:      "to-brand-electric/20",
  },
  indigo: {
    text:    "text-brand-indigo",
    bg:      "bg-brand-indigo/10",
    bgSolid: "bg-brand-indigo/15",
    from:    "from-brand-indigo/20",
    to:      "to-brand-indigo/20",
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
  price: {
    text:    "text-brand-price",
    bg:      "bg-brand-price/10",
    bgSolid: "bg-brand-price/15",
  },
  navy: {
    text:    "text-brand-navy",
    bg:      "bg-brand-navy/10",
    from:    "from-brand-navy/10",
    to:      "to-brand-navy/10",
  },
} as const;
