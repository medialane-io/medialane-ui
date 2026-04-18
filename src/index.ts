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
export { ScrollSection } from "./components/scroll-section.js";
export type { ScrollSectionProps } from "./components/scroll-section.js";
export { ShareButton } from "./components/share-button.js";
export type { ShareButtonProps } from "./components/share-button.js";
export { CollectionCard, CollectionCardSkeleton } from "./components/collection-card.js";
export type { CollectionCardProps } from "./components/collection-card.js";
export { TokenCard, TokenCardSkeleton } from "./components/token-card.js";
export type { TokenCardProps, RarityTier } from "./components/token-card.js";

// ── v0.3 additions ────────────────────────────────────────────────────────────
export { timeAgo } from "./utils/time.js";
export { ACTIVITY_TYPE_CONFIG, TYPE_FILTERS } from "./data/activity.js";
export type { ActivityTypeConfig } from "./data/activity.js";
export { HeroSlider, HeroSliderSkeleton } from "./components/hero-slider.js";
export type { HeroSliderProps } from "./components/hero-slider.js";
export { ActivityTicker } from "./components/activity-ticker.js";
export type { ActivityTickerProps } from "./components/activity-ticker.js";
export { ListingCard, ListingCardSkeleton } from "./components/listing-card.js";
export type { ListingCardProps } from "./components/listing-card.js";
export { ActivityRow } from "./components/activity-row.js";
export type { ActivityRowProps } from "./components/activity-row.js";
