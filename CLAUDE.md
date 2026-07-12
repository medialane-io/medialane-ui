# CLAUDE.md — medialane-ui

`@medialane/ui` is the shared component library consumed by `medialane-io` and `medialane-starknet`. It ships as a dual-format npm package (ESM + CJS) with a Tailwind preset, CSS stylesheet, and typed exports.

## Commands

```bash
bun run build        # Build dist/ (tsup — ESM + CJS + .d.ts)
bun run typecheck    # tsc --noEmit
npm publish          # Publish to npm (bump version in package.json first)
```

Package manager: **Bun** for everything except `npm publish`.

## Publish workflow

1. Edit `src/` — components, styles, data, utils
2. Bump `version` in `package.json` (semver)
3. `bun run build` — must complete with no errors
4. `npm publish` — publishes to npm as `@medialane/ui@<version>`
5. Bump consumers (`medialane-io`, `medialane-starknet`) in lock-step:
   - io: `bun install` → `bun run build` (must pass)
   - starknet: `npm install` + `bun install` (bun.lock is the tracked lockfile) → `npx tsc --noEmit` (must pass; `npm run build` also works env-less since the 2026-07-11 lazy Privy-server fix)
6. Commit + push all three repos

Current version: **0.62.0** (nav shell redesign — `NavCommandMenu` restyled to the action-focus language: 620px glass panel (deep blur/saturate, 20px radius, hairline dividers), icon-chip rows with an optional `description` line on `NavCommand`, uppercase tracked group labels, localStorage-backed "Recent" group (last 3 selections, `ml.nav.recent`), keycap footer hints (↑↓/↵, desktop only); on mobile the menu and the new account sheet render as touch-first bottom sheets with drag handles. New `nav-shell.tsx`: `MedialaneMark` (inline-SVG brand mark — replaces `<img src="/icon.png">` triggers), `NavBrandButton` (mark + menu glyph in one ≥44px glass pill, the header's left trigger), `NavIconButton` (circular glass header button with optional connected-indicator dot), `NavAccountSheet` + `useNavAccountSheet` (top-right anchored wallet/account surface hosting the app's own account panel; mutually exclusive with the command menu via the shared `ml:nav-*` events). Both apps: header = brand button left, wallet button right)

Prior 0.61.0: (typography restraint + compact portfolio — Urbanist display face now applies to **h1 only** (was h1–h3); explicit `--font-display` styles removed from `AssetCard`/`MedialaneCollectionCard`/`CoinLaunchPreview` titles — everything but the page main header is the body face. Rewards chip is a quiet pill: animated brand border + plain level name + XP, no icon/medallion/gradient text (the sparkles medallion was decorative, cut on user feedback). `PortfolioOverview` stats render as a compact clickable pill row (StatTile grid dropped — too much space, little utility); quick-action pills are text-only)

Prior 0.60.0: (portfolio header v2 + overview quick actions — `PortfolioHeader` drops the stat chips (redundant with the Overview tiles) and renders the rewards chip as a journey badge: `.btn-border-animated` full-spectrum border, sparkles medallion, level NAME + XP only — no numeric level (rewards framed as a positive journey, not a competition; `PortfolioHeaderScore` is now `{ levelName, totalXp, href? }`). `PortfolioOverview` gains `quickActions` (pill shortcut row under the stat tiles))

Prior 0.59.0: (portfolio shell redesign — `PortfolioNav` (two-level: top-level underline tabs Overview/Items/Trading/Activity/Settings + segmented pill row for the active section's children; badge counts roll up onto the top-level tab), `PortfolioHeader` (compact single block: eyebrow + address, stat chips, level/XP score chip), `PortfolioOverview` (landing-page layout: needs-attention panel, clickable StatTile row, recent assets/activity slots, first-run empty state). `PortfolioSubnav` removed — both apps migrated in lock-step; all inner portfolio routes unchanged)

Prior 0.58.0: (`ListingCard` gained an optional `imageUrl` override prop — when passed (including `null`) it replaces the card's internal `ipfsToHttp` resolution, so apps can route artwork through their own resizing proxy; omitted = unchanged behavior)

Prior 0.57.2: (`AssetCard` redesigned — inset 4:5 gallery artwork with hairline ring (echoes MedialaneCollectionCard), display-face title, price as a glass pill on the artwork (the collection cards' Floor-pill vocabulary), ipType badge inline with the title row, brand-gradient placeholder; skeleton matched)

Prior 0.56.0: (`CoinLaunchPreview` lifted from the apps and redesigned — quiet borderless panel, warm rose→orange coin gradient only as avatar ring + allocation bar, brand tokens replace stock pinks, display-face name, tabular numerals, market cap in `brand-price`; app files are re-export shims)

Prior 0.55.1: (`MedialaneCollectionCard` — the branded collectors-card preview: self-contained dark collectible, brand-spectrum frame, inset artwork on foil-tinted material, pointer-tracked 3D tilt + at-rest holographic sheen, display-face name, serial pill, Medialane maker's mark; empty image = clean gradient placeholder (no monogram); fluid width, pure presentation. Used as the live preview atop every launchpad create-form rail in both apps)

Prior 0.53.1: (borderless launchpad panels — `ServiceFormShell` form card and `ClaimRail` have no border and no shadow; the panel surface is `bg-muted/50` in light / `bg-card` in dark, so it separates from the app background in both themes with zero token changes. Typography: Geist Mono removed everywhere (`tabular-nums` on the body face instead); `font-display` preset token + `h1–h3 { font-family: var(--font-display) }` in medialane.css — apps load Urbanist via next/font as `--font-display`, Inter stays the body face)

## Package shape

```
dist/
  index.js / index.cjs      ← main barrel (all exports)
  components/*.js/.cjs      ← one file per component
  data/*.js/.cjs            ← data modules (brand, ip, launchpad-services, …)
  utils/*.js/.cjs           ← utility functions
  preset/tailwind.js        ← Tailwind CSS preset
  medialane.css             ← shared stylesheet (no @tailwind — apps own that)
src/
  components/               ← source components (TSX)
  styles/medialane.css      ← CSS source (compiled to dist/medialane.css)
  preset/tailwind.ts        ← Tailwind preset source
  data/                     ← static data (brand tokens, IP types, launchpad services)
  utils/                    ← shared utilities
  index.ts                  ← public API barrel
```

## Brand tokens (Tailwind + CSS)

Defined in `src/preset/tailwind.ts` and `src/data/brand.ts`. Current palette:

| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#3b7bff` | Primary actions, gradients |
| `brand-electric` | `#1a17ff` | High-contrast accent |
| `brand-indigo` | `#5b4ce6` | Mid-tone gradient stop |
| `brand-purple` | `#8a5cf6` | Secondary, gradient |
| `brand-rose` | `#f6608f` | Warm accent, coins |
| `brand-orange` | `#fb8b46` | Highlights, CTAs |
| `brand-price` | `#f97316` | Price values |
| `brand-navy` | `#0a0e1f` | Depth, dark backgrounds |

Primary gradient: `from-brand-blue via-brand-purple to-brand-rose`
Warm gradient: `from-brand-rose via-brand-orange to-brand-price`
Full-spectrum: `from-brand-blue via-brand-purple via-brand-rose to-brand-orange`

## CSS conventions (`src/styles/medialane.css`)

Custom classes (no `@apply` — pure CSS only):

- `.glass` / `.glass-light` — backdrop blur panels (dark/light)
- `.gradient-text` / `.gradient-text-warm` / `.gradient-text-full` / `.gradient-text-gold` — text gradients via `background-clip`
- `.card-base` / `.bento-cell` — rounded bordered card primitives
- `.ml-gbtn` — animated gradient border via `::before` mask (set `--ml-grad` CSS var on the element)
- `.btn-border-animated` — full-spectrum animated border (marketplace buy button)
- `.price-value` / `.section-label` / `.pill-badge` — typography utilities
- `.animate-float` / `.animate-pulse-glow` / `.animate-spin-slow` / `.animate-kenburns`

## Theme variables

Dual-theme — light and dark both first-class, **no default theme**. Apps apply `.dark` class to switch. Variables live in app `globals.css` (not in this package); `dist/medialane.css` has no `:root` block.

Light (`:root`): near-white background (`0 0% 99%`), navy foreground (`224 47% 11%`)
Dark (`.dark`): deep navy background (`224 50% 4%`), near-white foreground (`210 20% 95%`)

Source of truth: `medialane-io/src/app/globals.css`

## Component inventory (v0.50.1, 78 components)

**General:** ActionButton, ActionDialog, ActivityCard, ActivityCardSkeleton, ActivityFeedShell, ActivityRow, ActivityTicker, AddressDisplay, AssetCard, AssetCardSkeleton, AssetCollectionBar, AssetHeaderBlock, AssetLicenseSummary, AssetMarketplacePanel, AssetMarketsTab, AssetMediaColumn, AssetOverviewContent, AssetOwnerRow, AssetUtilityIcons, ClaimRail, CoinCard, CoinCardSkeleton, CoinRow, CoinsExplorer, CollectionCard, CollectionCardSkeleton, CommunityRewardsSection, CtaCardGrid, CurrencyAmount, CurrencyIcon, DiscoverActivityStrip, DiscoverCollectionsStrip, DiscoverCreatorsStrip, DiscoverFeedSection, DiscoverHero, FadeIn, FeaturedCarousel, FeaturedCarouselSkeleton, HeroSlider, HeroSliderSkeleton, IPTypeDisplay, IpTypeBadge, KineticWords, LaunchpadFilterBar, LaunchpadGroupedSections, LaunchpadServiceCard, LaunchpadStrip, LeaderboardWidget, ListingCard, ListingCardSkeleton, LoadMoreSentinel, MedialaneCollectionCard, MedialaneIcon, MedialaneLogoFull, MotionCard, NavCommandMenu, PageContainer, ParentAttributionBanner, PortfolioSubnav, ScrollSection, ServiceFormShell, ServiceHeader, ShareButton, Stagger, StaggerItem, StatPill, StatTile, StepNav, TokenAmount, TokenCard, TokenCardSkeleton, TokenGlyph

**Rewards:** BadgeShelf, LeaderboardTable, LevelBadge, LevelLadder, ScoreSummaryCard, XpProgress, XpToastContent

## Claude Design sync

Project: `1b29ca75-55e7-42eb-977f-39a4add480d7` (https://claude.ai/design/p/1b29ca75-55e7-42eb-977f-39a4add480d7)

Full re-sync command (run from `medialane-ui/` root after `bun run build`):

```bash
# 1. Re-sync bundle + component files
node .ds-sync/resync.mjs \
  --config .design-sync/config.json \
  --node-modules node_modules \
  --out ds-bundle \
  --remote ds-bundle/_ds_sync.json \
  --entry dist/index.js

# 2. Patch browser shims + regenerate Tailwind utilities
node .design-sync/patch-bundle.mjs ds-bundle

# 3. Push _ds_bundle.js + _ds_bundle.css + _ds_sync.json via DesignSync tool
```

See `.design-sync/NOTES.md` for known limitations (CurrencyIcon/MedialaneIcon broken image paths, next/link renders as `<a>`, Tailwind must be re-appended after every resync).
