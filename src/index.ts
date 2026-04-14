export { cn } from "./utils/cn.js";
export { formatDisplayPrice } from "./utils/format.js";

export { CurrencyIcon, CurrencyAmount } from "./components/currency-icon.js";
export type { CurrencyIconProps, CurrencyAmountProps } from "./components/currency-icon.js";

// Server-safe data (no React icons, safe in Server Components)
export { IP_TYPE_DATA, IP_TYPE_DATA_MAP } from "./data/ip-types.js";
export type { IpTypeData } from "./data/ip-types.js";

// Client-only (icons as React.ElementType — requires "use client" boundary)
export { IpTypeBadge, IP_TYPE_CONFIG, IP_TYPE_MAP } from "./components/ip-type-badge.js";
export type { IpTypeBadgeProps, IpTypeConfig } from "./components/ip-type-badge.js";

export { MedialaneIcon } from "./components/brand-icon.js";
export type { MedialaneIconProps } from "./components/brand-icon.js";
export { MedialaneLogoFull } from "./components/brand-logo.js";
export type { MedialaneLogoFullProps } from "./components/brand-logo.js";
