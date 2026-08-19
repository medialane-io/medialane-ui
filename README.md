# @medialane/ui

Shared UI component library for Medialane apps. Used by `medialane-starknet`, `medialane-io`, `medialane-portal`, and `media-wallet`.

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
First Load JS by ~50% in media-wallet with zero import changes in app code
(see `medialane-core/docs/superpowers/plans/2026-08-03-medialane-ui-subpath-exports.md`).
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

## Build & Publish

```bash
cd medialane-ui

# Build (outputs to dist/)
~/.bun/bin/bun run build

# Type-check
~/.bun/bin/bun run typecheck

# Watch mode during development
~/.bun/bin/bun run dev

# Publish to npm: bump package.json version first.
# If `npm` is on PATH, use it directly. Otherwise use bun with a
# project-local .npmrc, which carries auth through to `bun publish`
# (NPM_CONFIG_USERCONFIG alone does not):
#   echo "//registry.npmjs.org/:_authToken=<token>" > .npmrc
#   NPM_CONFIG_USERCONFIG=$(pwd)/.npmrc bun publish
# .npmrc is gitignored; remove it after publishing if it holds a live token.
npm publish
```

The package uses [tsup](https://tsup.egoist.dev/) and outputs ESM + CJS + type declarations.

---

## Version History

| Version | Added |
|---|---|
| **v0.126.3** | `ipfsToHttp` now also recognizes known IPFS gateway hosts (`*.mypinata.cloud`, `gateway.pinata.cloud`, `ipfs.io`, `dweb.link`, `cloudflare-ipfs.com`, `nftstorage.link`, `w3s.link`) in an absolute `https://` URI and routes them through the app's own `/api/ipfs/` proxy, same as `ipfs://`. Extends the gateway-recognition that `ipfs://` already had to these hosts too. |
| **v0.91.0-v0.126.2** | *Not individually documented, see `git log`* |
| **v0.90.1** | Wildcard subpath exports (`./*` → components, `./utils/*`, `./data/*`), additive; the barrel import stays unchanged. See "Deep imports" above |
| **v0.88.0-v0.90.0** | *Not individually documented, see `git log`* |
| **v0.87.0** | `NavWalletTrigger` gains optional `disconnectedIcon`, overriding the default `Wallet` glyph in the disconnected-state ring, for apps whose real connect entry point is something else (e.g. a Google mark for an email/social-login app). Omitting it keeps the `Wallet` default |
| **v0.86.0** | `NavWalletTrigger`'s disconnected state shows a plain `Wallet` glyph inside the rotating ring, making the ring itself easier to notice as a connect entry point. Connected state unchanged |
| **v0.85.0** | `NavCommandMenu` gains two optional props: `showKeyboardHints` (default `true`; set `false` to hide the "↑↓ Navigate / ↵ Open" footer hint) and `brandSlot` (replace the static "medialane ⌘K" footer brandmark entirely, e.g. with a "Connect" button). Both default to the prior, non-breaking behavior |
| **v0.84.0** | gol_starknet living-render support: `useIntersectionActive` + `AnimatedTokenMedia` swap a token's static image for a sandboxed iframe of its on-chain `animation_url` once visible, wired into `TokenCard`/`AssetCard`; SDK peer floor `>=0.73.0`. **Also replaces `AssetMediaColumn`** with the borderless/real-aspect-ratio/click-to-zoom design both apps had already forked locally |
| **v0.83.0** | `NavWalletTrigger` gains optional `iconSrc`, rendering the connected wallet's own icon in place of a generic glyph when set; omitting it keeps the prior behavior |
| **v0.82.x** | *Not individually documented, see `git log`* |
| **v0.81.0** | `NavAccountSheet` redesigned to match `NavCommandMenu`'s glass-panel treatment. **Breaking:** dropped the `title` prop; content is now 100% `children`-driven. `NavWalletTrigger` resized `h-11 w-11` → `h-8 w-8`; connected-state ring stays at full opacity |
| **v0.80.1** | `NavWalletTrigger` is now `React.forwardRef` (needed for `SheetTrigger asChild`); no visual change |
| **v0.80.0** | `NavWalletTrigger` added to `nav-shell.tsx`: spinning brand-gradient ring while disconnected, static low-opacity ring + `User` glyph once connected, both drawn from real wallet state |
| **v0.79.2** | `AssetMarketplacePanel`: "List on Marketplace" hidden next to "Cancel Listing" for single-instance (ERC-721) assets; ERC-1155 owners still see both |
| **v0.79.1** | Export-only fix: `toDurationDays`/`DURATION_UNITS`/`DurationUnit` (shipped in 0.79.0) now re-exported from `src/index.ts` |
| **v0.79.0** | `LicenseTermsBuilder`: licensing subpanel wrapper removed, fields flow in the main form. **Breaking:** `SponsorshipTerms.durationDays: string` → `durationValue` + `durationUnit` (new `DURATION_UNITS`); new `toDurationDays(terms)` export. Territory is now free text |
| **v0.78.2** | `LicenseTermsBuilder`: removed "Resale royalty (%)" from the UI; licensing panel no longer collapsible; "License length (days)" has no default |
| **v0.78.1** | `LicenseTermsBuilder` currency-picker layout fix, now stacked rows; collapsed trigger shows a live summary |
| **v0.78.0** | `LicenseTermsBuilder` rebuilt: icon-enhanced currency picker, collapsible panel (License Type presets, Territory, AI Policy, Scope, Deliverables, Exclusivity, media multi-select); new `toLicenseMetadata` export. `SponsorshipTerms` gains matching fields |
| **v0.77.0** | `AssetSearchPicker` (server-searched asset picker for the IP Sponsorship "propose to sponsor" flow). `AssetMarketplacePanel` gains `showSponsorOption`/`onOpenSponsorProposal` + `showSponsorSolicitOption`/`onOpenSponsorSolicit`. `derivePortfolioCounts` gains `sponsorshipPendingCount` → `PortfolioCounts.sponsorships` |
| **v0.76.0** | `CollectionFilters` shared logic lifted from both apps' near-identical local copies: `useCollectionFilters`, `CollectionFiltersTrigger`, `CollectionFiltersBody`, `SORT_OPTIONS`/`TraitSection` |
| **v0.75.0** | `TokenCard` replaced with the real implementation (dropdown menu, price chip, indexing badge) both apps had forked locally; hrefs computed via the SDK's `assetHref`/`collectionHref` using `token.chain`. New dep `@radix-ui/react-dropdown-menu`. SDK peer floor `>=0.72.0`. `RarityTier` and several unused props removed |
| **v0.74.2** | SDK peer floor `>=0.6.0` → `>=0.71.0` (no component code changed) |
| **v0.74.1** | Creator's Fund family: `CreatorAirdropBanner` lifted into the package; `CommunityRewardsSection` redesigned to brand tokens, borderless panels. (**v0.74.0 is deprecated on npm**, published from an incomplete checkout; use v0.74.1) |
| **v0.73.6** | `AssetMarketplacePanel` cancel-listing button label: "Cancel" → "Cancel Listing" |
| **v0.73.5** | `MedialaneCollectionCard` now follows the app's light/dark theme |
| **v0.73.4** | `NavBrandButton` left padding 6px → 10px |
| **v0.73.3** | Launchpad cards: resting hairline in each group's accent hue (was hover-only); gradient ring fades in on hover-capable devices |
| **v0.73.2** | Launchpad copy: "Single Editions" → "Single Edition NFTs"; "NFTs" group pill → "Originals" |
| **v0.73.1** | IP Club launchpad card copy rewritten to the membership-tiers model |
| **v0.73.0** | `AssetPicker` + `LicenseTermsBuilder` (initial versions), for the IP Sponsorship v3 create/accept forms |
| **v0.67.0–0.72.0** | *Not individually documented.* Only v0.72.0 is known: display face set to semibold, filter bar drops the services count |
| **v0.66.0** | Launchpad redesign: one card per service, one dynamic grid (`mint-ip-asset`+`create-collection` → `nfts`, `ip-collection-1155`+`mint-editions` → `limited-editions`); `LaunchpadGroupedSections` renders a single grid keyed by `GROUP_ACCENTS`; all service copy rewritten to plain language |
| **v0.65.1** | IP Tickets copy rewritten to event vocabulary (kept verbatim through v0.66.0) |
| **v0.65.0** | `ServiceFormShell` form compartment removed; forms render directly on the page |
| **v0.64.1** | `ActivityTicker` hover-zoom removed, keeping effects mobile-first and touch-friendly |
| **v0.64.0** | `NavBrandButton.onClick` defaults to opening the nav command menu; dead `MedialaneIcon` removed from the package |
| **v0.63.2** | Header triggers borderless (`NavBrandButton`/`NavIconButton`) |
| **v0.63.1 / v0.62.0** | Nav shell redesign: `NavCommandMenu` restyled (620px glass panel, icon-chip rows, optional `description`, localStorage "Recent" group, keycap footer hints, mobile bottom-sheet). New `nav-shell.tsx`: `NavBrandButton`, `NavIconButton`, `NavAccountSheet`/`useNavAccountSheet` (exported, ready for either app to mount) |
| **v0.61.0** | Typography restraint: Urbanist display face scoped to h1 (previously h1-h3); rewards chip simplified to a plain pill; `PortfolioOverview` stats → compact pill row |
| **v0.60.0** | `PortfolioHeader` drops stat chips, rewards chip becomes a journey badge (`levelName`+`totalXp`, no numeric level); `PortfolioOverview` gains `quickActions` |
| **v0.59.0** | Portfolio shell redesign: `PortfolioNav` (two-level nav), `PortfolioHeader` (compact block), `PortfolioOverview` (landing page). `PortfolioSubnav` removed |
| **v0.58.0** | `ListingCard` gains optional `imageUrl` override prop |
| **v0.57.2** | `AssetCard` redesigned: inset 4:5 gallery artwork, display-face title, price as a glass pill |
| **v0.56.0** | `CoinLaunchPreview` lifted from the apps and redesigned to brand tokens |
| **v0.55.1** | `MedialaneCollectionCard`: branded collectors-card preview (3D tilt, holographic sheen, serial pill) |
| **v0.53.1** | Borderless launchpad panels (`ServiceFormShell`, `ClaimRail`); Geist Mono removed everywhere in favor of `tabular-nums`; new `font-display` preset token |
| **v0.29.0-0.52.x** | *Not individually documented; changelog notes for this range didn't survive in `CLAUDE.md`.* Component-inventory milestone recorded at v0.50.1 (78 components) |
| **v0.28.0** | `StepNav` (presentation-only step indicator: solid active dot, outlined check for done, filling connector, accent-themed). `ServiceFormShell` gains an `aboveForm` slot (left column, between header and form, e.g. a stepper) and a **sticky right rail** on desktop. Lets the Creator Coin page adopt the standard form layout |
| **v0.27.0** | `ServiceHeader` gains a `plain` variant (neutral border); `ServiceFormShell` renders the header `plain` so create/mint form pages carry the gradient border on the form itself. Standalone headers (browse pages, coin page, `/claim` hub) keep the gradient |
| **v0.26.0** | `LaunchpadServiceCard` "living color cards" high-fidelity pass: per-hue aurora light-leaks, gradient icon tile, hairline gradient frame that ignites on interaction, staggered entrance reveal, press/hover microinteractions, animated CTA arrow; roomier grid gaps + section rhythm. Touch-first, reduced-motion safe |
| **v0.25.0** | `CoinsExplorer`/`CoinCard` refined: kind label over the artwork in brand hues, quote-currency icon on price, marketplace-style Filters dialog; simplified by dropping the Verified badge / FDV / holders / per-card glow / Trade button |
| **v0.24.0** | Art-forward `CoinCard` redesign, making the coin's cover artwork the hero of the tile |
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
