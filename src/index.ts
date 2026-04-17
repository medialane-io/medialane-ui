// ── Utils ─────────────────────────────────────────────────────────────────────
export { cn } from "./utils/cn.js";
export { formatDisplayPrice } from "./utils/format.js";
export { shortenAddress } from "./utils/address.js";
export { ipfsToHttp } from "./utils/ipfs.js";

// ── Data (server-safe — no React, safe in Server Components) ──────────────────
export { IP_TYPE_DATA, IP_TYPE_DATA_MAP } from "./data/ip-types.js";
export type { IpTypeData } from "./data/ip-types.js";
export { BRAND } from "./data/brand.js";

// ── Components (client-only — all have "use client") ─────────────────────────
export { CurrencyIcon, CurrencyAmount } from "./components/currency-icon.js";
export type { CurrencyIconProps, CurrencyAmountProps } from "./components/currency-icon.js";

export { IpTypeBadge, IP_TYPE_CONFIG, IP_TYPE_MAP } from "./components/ip-type-badge.js";
export type { IpTypeBadgeProps, IpTypeConfig } from "./components/ip-type-badge.js";

export { AddressDisplay } from "./components/address-display.js";
export type { AddressDisplayProps } from "./components/address-display.js";

export { MedialaneIcon } from "./components/brand-icon.js";
export type { MedialaneIconProps } from "./components/brand-icon.js";
export { MedialaneLogoFull } from "./components/brand-logo.js";
export type { MedialaneLogoFullProps } from "./components/brand-logo.js";

// ── v0.2 additions ────────────────────────────────────────────────────────────
export { MotionCard, FadeIn, Stagger, StaggerItem, KineticWords, SPRING, EASE_OUT } from "./components/motion-primitives.js";
