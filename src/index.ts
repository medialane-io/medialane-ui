// ── Utils ─────────────────────────────────────────────────────────────────────
export { cn } from "./utils/cn.js";
export { formatDisplayPrice, parsePriceDisplay } from "./utils/format.js";
export { shortenAddress } from "./utils/address.js";
export { ipfsToHttp } from "./utils/ipfs.js";
export { licenseSummary } from "./utils/license-summary.js";

// ── Data (server-safe — no React, safe in Server Components) ──────────────────
export { IP_TYPE_DATA, IP_TYPE_DATA_MAP } from "./data/ip-types.js";
export type { IpTypeData } from "./data/ip-types.js";
export {
  IP_TYPES, LICENSE_TYPES, GEOGRAPHIC_SCOPES, AI_POLICIES,
  DERIVATIVES_OPTIONS, LICENSE_TRAIT_TYPES,
} from "./data/ip.js";
export type { IPType, LicenseType } from "./data/ip.js";
export {
  IP_TEMPLATES, EMBED_PLATFORM_META, SOCIAL_PLATFORM_META, TEMPLATE_TRAIT_TYPES, DOC_UPLOAD,
} from "./data/ip-templates.js";
export type { EmbedPlatform, SocialPlatform, TraitSuggestion, IPTemplate, DocUploadConfig } from "./data/ip-templates.js";
export { IPTypeDisplay } from "./components/ip-type-display.js";
export { AssetOverviewContent } from "./components/asset-overview-content.js";
export { AssetLicenseSummary } from "./components/asset-license-summary.js";
export { AssetMarketsTab } from "./components/asset-markets-tab.js";
export { ParentAttributionBanner } from "./components/parent-attribution-banner.js";
export type { ParentBannerProps } from "./components/parent-attribution-banner.js";
export { AssetMediaColumn, AssetHeaderBlock, AssetOwnerRow, buildEditionStats } from "./components/asset-top-sections.js";
export type { AssetOwnerRowProps } from "./components/asset-top-sections.js";
export { AssetCollectionBar } from "./components/asset-collection-bar.js";
export type { AssetCollectionBarProps, AssetCollectionBarSibling } from "./components/asset-collection-bar.js";
export { AssetUtilityIcons } from "./components/asset-utility-icons.js";
export type { AssetUtilityIconsProps } from "./components/asset-utility-icons.js";
export { AssetMarketplacePanel } from "./components/asset-marketplace-panel.js";
export type { AssetMarketplacePanelProps, ApiOrderLike } from "./components/asset-marketplace-panel.js";
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
export { PageContainer } from "./components/page-container.js";
export type { PageContainerProps } from "./components/page-container.js";
export { ScrollSection } from "./components/scroll-section.js";
export type { ScrollSectionProps } from "./components/scroll-section.js";
export { ShareButton } from "./components/share-button.js";
export type { ShareButtonProps } from "./components/share-button.js";
export { CollectionCard, CollectionCardSkeleton } from "./components/collection-card.js";
export type { CollectionCardProps } from "./components/collection-card.js";
export { TokenCard, TokenCardSkeleton } from "./components/token-card.js";
export type { TokenCardProps, RarityTier } from "./components/token-card.js";
export { AssetCard, AssetCardSkeleton } from "./components/asset-card.js";
export type { AssetCardProps, AssetCardPrice } from "./components/asset-card.js";
// ── Coin discovery (chain-agnostic; price/data/href injected by the app) ─────
export {
  coinKind, formatCoinPrice, formatFdv,
  type CoinKind, type CoinCollectionLike, type CoinPriceLike,
} from "./data/coins.js";
export { CoinCard, CoinRow, CoinCardSkeleton, type UseCoinPrice, type CoinTileProps } from "./components/coin-card.js";
export {
  CoinsExplorer,
  type CoinsExplorerProps, type CoinFilter, type CoinSort, type UseCoins,
} from "./components/coins-explorer.js";

// ── v0.3 additions ────────────────────────────────────────────────────────────
export { timeAgo, timeUntil } from "./utils/time.js";
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
export { ActivityFeedShell } from "./components/activity-feed-shell.js";
export type { ActivityFeedShellProps } from "./components/activity-feed-shell.js";
export { CtaCardGrid } from "./components/cta-card-grid.js";
export type { CtaCardGridProps, CtaCardItem } from "./components/cta-card-grid.js";

// ── v0.3.2 additions ─────────────────────────────────────────────────────────
export { DiscoverHero } from "./components/discover-hero.js";
export type { DiscoverHeroProps } from "./components/discover-hero.js";
export { FeaturedCarousel, FeaturedCarouselSkeleton } from "./components/featured-carousel.js";
export type { FeaturedCarouselProps } from "./components/featured-carousel.js";
export { DiscoverCollectionsStrip } from "./components/discover-collections-strip.js";
export type { DiscoverCollectionsStripProps } from "./components/discover-collections-strip.js";
export { DiscoverCreatorsStrip } from "./components/discover-creators-strip.js";
export type { DiscoverCreatorsStripProps } from "./components/discover-creators-strip.js";
export { DiscoverFeedSection, DiscoverActivityStrip } from "./components/discover-feed-section.js";
export type { DiscoverFeedSectionProps, DiscoverActivityStripProps } from "./components/discover-feed-section.js";
export { ActivityCard, ActivityCardSkeleton, ACTIVITY_MESSAGES } from "./components/activity-card.js";
export type { ActivityCardProps } from "./components/activity-card.js";

// ── Launchpad (grouped sections — single page-UI source since 0.8.0) ─────────
export { LaunchpadGroupedSections, LaunchpadServiceCard, SERVICE_HUES, useLaunchpadFilter } from "./components/launchpad-services.js";
export { LaunchpadFilterBar } from "./components/launchpad-filter-bar.js";
export type { LaunchpadFilterBarProps } from "./components/launchpad-filter-bar.js";
export { LaunchpadStrip } from "./components/launchpad-strip.js";
export type { LaunchpadStripProps } from "./components/launchpad-strip.js";
export type { LaunchpadGroupedSectionsProps, LaunchpadServiceCardProps, ServiceOverride, ServiceOverrides } from "./components/launchpad-services.js";
export { LAUNCHPAD_SERVICE_DEFINITIONS, LAUNCHPAD_SERVICE_GROUPS } from "./data/launchpad-services.js";
export type { ServiceDefinition, ServiceStatus, ServiceCategory, ServiceGroup, ServiceGroupDefinition } from "./data/launchpad-services.js";

// ── v0.5.0 additions ─────────────────────────────────────────────────────────
export { NavCommandMenu, useNavCommandMenu } from "./components/nav-command-menu.js";
export type { NavCommand, NavCommandGroup, NavCommandMenuProps } from "./components/nav-command-menu.js";

// ── v0.6.0 additions — portfolio subnav + counts ────────────────────────────
export { PortfolioSubnav } from "./components/portfolio-subnav.js";
export type {
  PortfolioSubnavProps,
  PortfolioNavItem,
  PortfolioNavGroup,
  PortfolioBadgeVariant,
} from "./components/portfolio-subnav.js";
export { derivePortfolioCounts } from "./utils/portfolio-counts.js";
export type { PortfolioCounts, CountableOrder } from "./utils/portfolio-counts.js";

// ── v0.22.0 additions — launchpad/claim form template primitives ─────────────
// Pure-presentation header + rail shared by every launchpad/claim form. The
// app supplies its own gate, back button, and form logic. Requires the
// `.btn-border-animated` class (in @medialane/ui/styles) for the form shell.
export { ServiceHeader } from "./components/service-header.js";
export type { ServiceHeaderProps } from "./components/service-header.js";
export { ClaimRail } from "./components/claim-rail.js";
export type { ClaimRailProps } from "./components/claim-rail.js";

// ── v0.23.0 additions — slot-based form shell ────────────────────────────────
// Pure layout (back slot + header + animated-border compartment + 8/4 bento).
// No auth/router — the app injects its own gate (around children) + back button.
export { ServiceFormShell } from "./components/service-form-shell.js";
export type { ServiceFormShellProps } from "./components/service-form-shell.js";
export { StepNav } from "./components/step-nav.js";
export type { StepNavProps, StepNavStep } from "./components/step-nav.js";

// Rewards score kit (v0.36.0)
export { LevelBadge } from "./components/rewards/level-badge.js";
export type { LevelBadgeProps } from "./components/rewards/level-badge.js";
export { XpProgress } from "./components/rewards/xp-progress.js";
export type { XpProgressProps } from "./components/rewards/xp-progress.js";
export { BadgeShelf } from "./components/rewards/badge-shelf.js";
export type { BadgeShelfProps, BadgeShelfBadge } from "./components/rewards/badge-shelf.js";
export { ScoreSummaryCard } from "./components/rewards/score-summary-card.js";
export type { ScoreSummaryCardProps } from "./components/rewards/score-summary-card.js";
export { LeaderboardTable, LeaderboardWidget } from "./components/rewards/leaderboard-table.js";
export type { LeaderboardTableProps, LeaderboardWidgetProps, LeaderboardEntryLike } from "./components/rewards/leaderboard-table.js";
export { LevelLadder } from "./components/rewards/level-ladder.js";
export type { LevelLadderProps } from "./components/rewards/level-ladder.js";
export { XpToastContent } from "./components/rewards/xp-toast-content.js";
export type { XpToastContentProps } from "./components/rewards/xp-toast-content.js";

// ── v0.37.0 additions — infinite-scroll trigger ──────────────────────────────
export { LoadMoreSentinel } from "./components/load-more-sentinel.js";
export type { LoadMoreSentinelProps } from "./components/load-more-sentinel.js";

// ── v0.47.0 additions — community rewards section ────────────────────────────
export { CommunityRewardsSection } from "./components/community-rewards-section.js";
export type { CommunityRewardsSectionProps, CommunityRewardsEntry } from "./components/community-rewards-section.js";

// ── Design system primitives — action-focus pattern, tokens, data display ────
export { ActionButton } from "./components/action-button.js";
export type { ActionButtonProps, ActionKey, ToneKey } from "./components/action-button.js";

export { CoinLaunchPreview } from "./components/coin-launch-preview.js";
export type { CoinPreviewData } from "./components/coin-launch-preview.js";
export { MedialaneCollectionCard } from "./components/medialane-collection-card.js";
export type { MedialaneCollectionCardProps } from "./components/medialane-collection-card.js";
export { TokenGlyph, TokenAmount } from "./components/token-glyph.js";
export type { TokenGlyphProps, TokenAmountProps, TokenSymbol } from "./components/token-glyph.js";

export { StatTile, StatPill } from "./components/stat-tile.js";
export type { StatTileProps, StatPillProps } from "./components/stat-tile.js";

export { ActionDialog } from "./components/action-dialog.js";
export type { ActionDialogProps } from "./components/action-dialog.js";
