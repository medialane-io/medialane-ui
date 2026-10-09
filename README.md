# @medialane/ui

**The shared design system of the Medialane apps.**

The React components behind [medialane.io](https://medialane.io), [starknet.medialane.io](https://starknet.medialane.io) and [portal.medialane.io](https://portal.medialane.io): asset and collection cards, launchpad services, marketplace and activity views, licensing and IP data, and the Medialane brand. Use it to build an app that feels at home on Medialane.

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
| `next-themes` | >=0.3.0 |
| `framer-motion` | >=10.0.0 |
| `lucide-react` | >=0.400.0 |
| `sonner` | >=1.0.0 |
| `tailwind-merge` | >=2.0.0 |
| `clsx` | >=2.0.0 |
| `class-variance-authority` | >=0.7.0 |
| `cmdk` | >=1.0.0 |
| `react-hook-form` | >=7.50.0 |
| `recharts` | >=2.0.0 |
| `swr` | >=2.0.0 |
| `@medialane/sdk` | >=0.73.0 |
| `@radix-ui/react-checkbox` | >=1.1.0 |
| `@radix-ui/react-collapsible` | >=1.1.0 |
| `@radix-ui/react-dialog` | >=1.1.0 |
| `@radix-ui/react-dropdown-menu` | >=2.1.0 |
| `@radix-ui/react-label` | >=2.1.0 |
| `@radix-ui/react-popover` | >=1.1.0 |
| `@radix-ui/react-select` | >=2.1.0 |
| `@radix-ui/react-slot` | >=1.1.0 |
| `@radix-ui/react-switch` | >=1.1.0 |
| `@radix-ui/react-tabs` | >=1.1.0 |

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
| `shortenAddress(addr)` | Truncate 0x address to `0x1234…abcd` |
| `ipfsToHttp(uri)` | Convert `ipfs://` URIs (and known IPFS gateway URLs) to the app's own `/api/ipfs/` proxy path |
| `timeAgo(timestamp)` | Relative time string, e.g. "3 hours ago" |

---

### Data (server-safe: no React, works directly in Server Components)

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

### v0.1: Base Components

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

### v0.2: Motion + Cards

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
| `<TokenCard token={t} />` | Unified NFT/token card, used on marketplace, portfolio, collections |
| `<TokenCardSkeleton />` | Loading skeleton for TokenCard |

---

### v0.3: Activity + Launchpad + Marketplace

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

### v0.3.2: Discover Components

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
| `<LaunchpadGroupedSections overrides={...} />` | The full grouped launchpad page UI; apps inject only hrefs / per-app rollout flips |
| `<LaunchpadStrip hrefs={...} />` | Homepage launchpad carousel; cards derive from the shared service definitions |
| `LAUNCHPAD_SERVICE_DEFINITIONS` / `SERVICE_HUES` | Canonical service copy (titles, blurbs, examples) + one unique hue per service |

### Asset page modules (v0.13+)

```ts
import { AssetOverviewContent, AssetMarketsTab, AssetMediaColumn, AssetHeaderBlock, ParentAttributionBanner, IPTypeDisplay } from "@medialane/ui";
```

Shared presentation modules for the asset detail pages; both apps re-export
them as shims at their original paths and inject wallet hooks/dialogs locally.

### IP data layer (v0.13+)

```ts
import { IP_TYPES, LICENSE_TYPES, IP_TEMPLATES, DOC_UPLOAD, TEMPLATE_TRAIT_TYPES } from "@medialane/ui";
```

Canonical IP types, license presets, and per-type templates (embeds, socials,
trait suggestions, and the `docUpload` config powering the document/PDF-to-IPFS
upload on Documents / Patents / Publications / Software). The apps' `types/ip`
and `lib/ip-templates` are re-export shims of this layer; edit here, and the
shims pick it up automatically.

---

## Deep imports (v0.90.1+)

The bare `import { X } from "@medialane/ui"` barrel stays the primary,
supported way to use this package. The package also builds one file per
component (`tsup`'s `bundle: false`), so each component is reachable
directly too:

```ts
import { CurrencyIcon } from "@medialane/ui/currency-icon";
import { cn } from "@medialane/ui/utils/cn";
import { IP_TYPE_DATA } from "@medialane/ui/data/ip-types";
```

In a Next.js app, adding `experimental.optimizePackageImports: ["@medialane/ui"]`
to `next.config` gets the same result automatically: Next rewrites barrel
imports to per-component imports at build time, confirmed to cut a route's
First Load JS by ~50% in a consuming app with zero import changes in app code.
The deep-import subpaths are there directly for non-Next consumers, or
anywhere that flag is unavailable.

---

## Safe-area utilities

`.pb-safe` / `.pt-safe` add padding using `env(safe-area-inset-*)`, for
anything pinned to the viewport edge (bottom sheets, fixed tab bars) on
notched/home-indicator devices. Used internally by `NavCommandMenu`/
`NavAccountSheet`; apply the same classes to any app-level fixed bottom
bar (e.g. a mobile tab bar) for the same treatment.

**Composing with an existing base padding:** these classes are purely
additive (`0px` on a non-notched device), on top of whatever padding an
element already carries. Since Tailwind resolves two padding-bottom classes
by letting the later one in source order win rather than merging them, an
element with its own bottom padding should combine both into one arbitrary
value: `pb-[calc(1rem+env(safe-area-inset-bottom))]`. `NavCommandMenu`/
`NavAccountSheet` use this composed form, since they already carry a `pb-4`
baseline.

---

## Development

```bash
bun run build      # outputs ESM + CJS + type declarations to dist/
bun run typecheck
bun run dev        # watch mode
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## License

[MIT](LICENSE)
