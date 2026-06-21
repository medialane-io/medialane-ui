# @medialane/ui

Shared UI component library for Medialane apps. Used by `medialane-starknet`, `medialane-io`, and `medialane-portal`.

[![npm version](https://img.shields.io/npm/v/@medialane/ui)](https://www.npmjs.com/package/@medialane/ui)

---

## Install

```bash
npm install @medialane/ui
# or
bun add @medialane/ui
```

### Tailwind preset

Add the preset in `tailwind.config.ts` to get all brand tokens and custom utilities:

```ts
import uiPreset from "@medialane/ui/preset";

export default {
  presets: [uiPreset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@medialane/ui/dist/**/*.js"],
};
```

### Global styles

```ts
// app/layout.tsx or equivalent entry point
import "@medialane/ui/styles";
```

---

## Peer Dependencies

| Package | Required |
|---|---|
| `react` | >=18.0.0 |
| `react-dom` | >=18.0.0 |
| `next` | >=14.0.0 |
| `framer-motion` | >=10.0.0 |
| `lucide-react` | >=0.400.0 |
| `sonner` | >=1.0.0 |
| `tailwind-merge` | >=2.0.0 |
| `clsx` | >=2.0.0 |
| `@medialane/sdk` | >=0.6.0 |

---

## Component Reference

### Utils

```ts
import { cn, formatDisplayPrice, shortenAddress, ipfsToHttp, timeAgo } from "@medialane/ui";
```

| Export | Description |
|---|---|
| `cn(...classes)` | clsx + tailwind-merge class combiner |
| `formatDisplayPrice(price)` | Format price string for display |
| `shortenAddress(addr)` | Truncate 0x address — `0x1234…abcd` |
| `ipfsToHttp(uri)` | Convert `ipfs://` URI to Pinata HTTP gateway URL |
| `timeAgo(timestamp)` | Relative time string — "3 hours ago" |

---

### Data (server-safe — no React, safe in Server Components)

```ts
import { IP_TYPE_DATA, IP_TYPE_DATA_MAP, BRAND, ACTIVITY_TYPE_CONFIG, TYPE_FILTERS, LAUNCHPAD_SERVICE_DEFINITIONS } from "@medialane/ui";
```

| Export | Description |
|---|---|
| `IP_TYPE_DATA` | Array of IP type definitions (label, icon, color) |
| `IP_TYPE_DATA_MAP` | Map keyed by IP type string |
| `BRAND` | Brand color and design tokens |
| `ACTIVITY_TYPE_CONFIG` | Activity type config (mint/sale/offer/transfer/listing/cancelled) |
| `TYPE_FILTERS` | Activity filter options for UI |
| `LAUNCHPAD_SERVICE_DEFINITIONS` | All launchpad service card definitions |

---

### v0.1 — Base Components

```ts
import { CurrencyIcon, CurrencyAmount, IpTypeBadge, AddressDisplay, MedialaneIcon, MedialaneLogoFull } from "@medialane/ui";
```

| Component | Description |
|---|---|
| `<CurrencyIcon currency="ETH" />` | Token currency icon (ETH, STRK, USDC, USDT, WBTC) |
| `<CurrencyAmount amount="1.5" currency="ETH" />` | Formatted amount with icon |
| `<IpTypeBadge type="Music" />` | IP type pill badge with color and icon |
| `<AddressDisplay address="0x..." />` | Formatted address with copy-to-clipboard |
| `<MedialaneIcon size={24} />` | Medialane "M" brand icon |
| `<MedialaneLogoFull />` | Full Medialane wordmark |

---

### v0.2 — Motion + Cards

```ts
import {
  MotionCard, FadeIn, Stagger, StaggerItem, KineticWords, SPRING, EASE_OUT,
  ScrollSection, ShareButton, CollectionCard, CollectionCardSkeleton,
  TokenCard, TokenCardSkeleton,
} from "@medialane/ui";
```

| Component | Description |
|---|---|
| `<MotionCard>` | Framer Motion card with hover lift |
| `<FadeIn>` | Fade-in entrance animation wrapper |
| `<Stagger>` / `<StaggerItem>` | Staggered list entrance animations |
| `<KineticWords>` | Animated word-by-word text reveal |
| `SPRING` / `EASE_OUT` | Reusable animation spring/easing constants |
| `<ScrollSection>` | Scroll-triggered section fade-in |
| `<ShareButton>` | Native share API with clipboard fallback |
| `<CollectionCard collection={c} />` | Collection grid card with image, name, stats |
| `<CollectionCardSkeleton />` | Loading skeleton for CollectionCard |
| `<TokenCard token={t} />` | Unified NFT/token card — used on marketplace, portfolio, collections |
| `<TokenCardSkeleton />` | Loading skeleton for TokenCard |

---

### v0.3 — Activity + Launchpad + Marketplace

```ts
import {
  HeroSlider, HeroSliderSkeleton, ActivityTicker, ListingCard, ListingCardSkeleton,
  ActivityRow, ActivityFeedShell, LaunchpadGrid, CtaCardGrid,
} from "@medialane/ui";
```

| Component | Description |
|---|---|
| `<HeroSlider slides={[...]} />` | Full-width hero carousel with auto-advance |
| `<HeroSliderSkeleton />` | Loading skeleton for HeroSlider |
| `<ActivityTicker activities={[...]} />` | Horizontal scrolling live activity feed ticker |
| `<ListingCard order={o} />` | Marketplace listing card (price, asset image, buy CTA) |
| `<ListingCardSkeleton />` | Loading skeleton for ListingCard |
| `<ActivityRow event={a} isLast={false} />` | Timeline activity row with spine connector |
| `<ActivityFeedShell activities={[...]} />` | Full activity feed with type filters |
| `<LaunchpadGrid items={[...]} />` | Launchpad feature grid |
| `<CtaCardGrid items={[...]} />` | CTA card grid section |

---

### v0.3.2 — Discover Components

```ts
import {
  DiscoverHero, FeaturedCarousel, FeaturedCarouselSkeleton,
  DiscoverCollectionsStrip, DiscoverCreatorsStrip, DiscoverFeedSection,
} from "@medialane/ui";
```

| Component | Description |
|---|---|
| `<DiscoverHero>` | Discover page hero with headline and search |
| `<FeaturedCarousel collections={[...]} />` | Featured collections horizontal carousel |
| `<FeaturedCarouselSkeleton />` | Loading skeleton for FeaturedCarousel |
| `<DiscoverCollectionsStrip collections={[...]} />` | Horizontal discovery strip for collections |
| `<DiscoverCreatorsStrip creators={[...]} />` | Horizontal discovery strip for creators |
| `<DiscoverFeedSection>` | Full discover page feed section |

---

### Launchpad (single page-UI source since v0.8)

```ts
import { LaunchpadGroupedSections, LaunchpadStrip, LAUNCHPAD_SERVICE_DEFINITIONS, SERVICE_HUES } from "@medialane/ui";
```

| Export | Description |
|---|---|
| `<LaunchpadGroupedSections overrides={...} />` | The full grouped launchpad page UI — apps inject only hrefs / per-app rollout flips |
| `<LaunchpadStrip hrefs={...} />` | Homepage launchpad carousel — cards derive from the shared service definitions |
| `LAUNCHPAD_SERVICE_DEFINITIONS` / `SERVICE_HUES` | Canonical service copy (titles, blurbs, examples) + one unique hue per service |

### Asset page modules (v0.13+)

```ts
import { AssetOverviewContent, AssetMarketsTab, AssetMediaColumn, AssetHeaderBlock, ParentAttributionBanner, IPTypeDisplay } from "@medialane/ui";
```

Shared presentation modules for the asset detail pages — both apps re-export
them as shims at their original paths and inject wallet hooks/dialogs locally.

### IP data layer (v0.13+)

```ts
import { IP_TYPES, LICENSE_TYPES, IP_TEMPLATES, DOC_UPLOAD, TEMPLATE_TRAIT_TYPES } from "@medialane/ui";
```

Canonical IP types, license presets, and per-type templates (embeds, socials,
trait suggestions, and the `docUpload` config powering the document/PDF-to-IPFS
upload on Documents / Patents / Publications / Software). The apps' `types/ip`
and `lib/ip-templates` are re-export shims of this layer — edit here, never there.

---

## Build & Publish

```bash
cd medialane-ui

# Build (outputs to dist/)
~/.bun/bin/bun run build

# Type-check
~/.bun/bin/bun run typecheck

# Watch mode during development
~/.bun/bin/bun run dev

# Publish to npm
npm publish
```

The package uses [tsup](https://tsup.egoist.dev/) and outputs ESM + CJS + type declarations.

---

## Version History

| Version | Added |
|---|---|
| **v0.14.0** | `docUpload` template config + `DOC_UPLOAD` (document/PDF → IPFS for Documents/Patents/Publications/Software), `IPTypeDisplay` document card |
| **v0.13.x** | Asset-page modules lifted: `AssetOverviewContent`, `AssetMarketsTab`, `AssetMediaColumn`/`AssetHeaderBlock`, `ParentAttributionBanner`, `IPTypeDisplay`; IP data layer (`data/ip`, `data/ip-templates`); `timeUntil` |
| **v0.12.x** | `LaunchpadStrip` (homepage carousel from service defs); Discover strips restyled to the approved design; `CollectionCard` gated-content border + currency floor |
| **v0.11.x** | `DiscoverFeedSection` rebuilt as carousels; `ActivityCard`; coins live in shared service defaults |
| **v0.8–0.10** | `LaunchpadGroupedSections` + creator-first card redesign (chips, examples, gradient section titles); `PageContainer`, `NavCommandMenu`, `PortfolioSubnav` |
| **v0.4.0** | `LaunchpadServicesGrid` (removed in v0.8), `LAUNCHPAD_SERVICE_DEFINITIONS` |
| **v0.3.2** | `DiscoverHero`, `FeaturedCarousel`, `DiscoverCollectionsStrip`, `DiscoverCreatorsStrip`, `DiscoverFeedSection` |
| **v0.3.0** | `ActivityRow`, `ActivityFeedShell`, `ActivityTicker`, `HeroSlider`, `ListingCard`, `LaunchpadGrid`, `CtaCardGrid`, `timeAgo`, `ACTIVITY_TYPE_CONFIG` |
| **v0.2.0** | `MotionCard`, `FadeIn`, `Stagger`, `StaggerItem`, `KineticWords`, `ScrollSection`, `ShareButton`, `CollectionCard`, `TokenCard` |
| **v0.1.0** | `cn`, `formatDisplayPrice`, `shortenAddress`, `ipfsToHttp`, `CurrencyIcon`, `CurrencyAmount`, `IpTypeBadge`, `AddressDisplay`, `MedialaneIcon`, `MedialaneLogoFull`, `IP_TYPE_DATA`, `BRAND` |
