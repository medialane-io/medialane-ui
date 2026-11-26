import {
  Activity, BookOpen, Briefcase, Camera, Coins, FileText, Film, Gem, Gift, Handshake, Home, Layers, LayoutGrid, List, Music, Palette, Plus, Repeat2, ScrollText, Settings, ShieldCheck, Store, Tag, Telescope, Ticket, Trophy, Users, Zap,
} from "lucide-react";
import type { NavCommand, NavCommandGroup } from "../components/nav-command-menu.js";
import { msg } from "../i18n/translate.js";

export const NAV_ITEMS = {
  home: { id: "home", label: msg("Medialane"), icon: Home, iconSrc: "/icon.png", href: "/", keywords: ["home", "frontpage", "start", "homepage", "main"] },
  discover: { id: "discover", label: msg("Discover"), icon: Telescope, href: "/discover", keywords: ["feed", "explore", "trending"] },
  marketplace: { id: "marketplace", label: msg("Marketplace"), icon: Store, href: "/marketplace", keywords: ["buy", "sell", "trade", "listings", "browse"] },
  launchpad: { id: "launchpad", label: msg("Launchpad"), icon: Zap, href: "/launchpad", keywords: ["start", "launch", "creator", "mint", "create"] },
  portfolio: { id: "portfolio", label: msg("Portfolio"), icon: Briefcase, href: "/portfolio", keywords: ["owned", "my nfts", "wallet", "account"] },
  collections: { id: "collections", label: msg("Collections"), icon: LayoutGrid, href: "/collections", keywords: ["nft", "drops", "browse"] },
  coins: { id: "coins", label: msg("Coins"), icon: Coins, href: "/coins", keywords: ["token", "creator coin", "memecoin", "discover", "trade", "swap"] },
  accounts: { id: "accounts", label: msg("Accounts"), icon: Users, href: "/accounts", keywords: ["creators", "artists", "addresses", "community"] },
  activities: { id: "activities", label: msg("Activity"), icon: Activity, href: "/activities", keywords: ["history", "transactions", "feed", "events"] },
  rewards: { id: "rewards", label: msg("Rewards"), icon: Trophy, href: "/rewards", keywords: ["xp", "points", "scoreboard", "leaderboard", "badges", "rank"] },
  airdrop: { id: "airdrop", label: msg("Airdrop"), icon: Gift, href: "/airdrop", keywords: ["claim", "free", "drop", "genesis", "creator's fund"] },
  settings: { id: "settings", label: msg("Account settings"), icon: Settings, href: "/settings", keywords: ["profile", "username", "preferences", "account"] },
  "mint-ip-asset": { id: "mint-ip-asset", label: msg("Publish a single work"), icon: Plus, href: "/launchpad/single-editions", keywords: ["mint", "upload", "publish", "token", "erc721", "singular", "unique", "original"] },
  "create-collection": { id: "create-collection", label: msg("Create a collection"), icon: LayoutGrid, href: "/launchpad/single-editions/collection", keywords: ["deploy", "series", "erc721", "collection", "branded"] },
  "mint-editions": { id: "mint-editions", label: msg("Mint Limited Editions"), icon: Layers, href: "/launchpad/nfteditions", keywords: ["mint", "edition", "erc1155", "multi", "copies", "limited"] },
  "create-1155": { id: "create-1155", label: msg("Create an editions collection"), icon: Layers, href: "/launchpad/nfteditions/create", keywords: ["deploy", "erc1155", "edition", "contract", "limited", "multi-edition"] },
  "pop-create": { id: "pop-create", label: msg("Create POP event"), icon: Ticket, href: "/launchpad/pop/create", keywords: ["pop", "proof of participation", "event", "community", "soulbound"] },
  "pop-browse": { id: "pop-browse", label: msg("Browse POP events"), icon: Ticket, href: "/launchpad/pop", keywords: ["pop", "events", "proof of participation"] },
  "tickets-create": { id: "tickets-create", label: msg("Create IP Tickets"), icon: Ticket, href: "/launchpad/tickets/create", keywords: ["tickets", "event", "verifiable", "attendee", "pass"] },
  "club-create": { id: "club-create", label: msg("Create IP Club"), icon: Users, href: "/launchpad/club/create", keywords: ["club", "membership", "tiers", "community", "fans"] },
  "sponsorship-create": { id: "sponsorship-create", label: msg("Create IP Sponsorship"), icon: Handshake, href: "/launchpad/sponsorship/create", keywords: ["sponsorship", "sponsor", "license", "offer", "deal"] },
  "launch-coin": { id: "launch-coin", label: msg("Launch a creator coin"), icon: Coins, href: "/launchpad/coin/create", keywords: ["coin", "creator coin", "erc20", "token", "ekubo", "liquidity", "launch"] },
  remix: { id: "remix", label: msg("Remix a work"), icon: Repeat2, href: "/marketplace", keywords: ["remix", "derivative", "attribution", "fork"] },
  "portfolio-collections": { id: "portfolio-collections",label: msg("My collections"), icon: LayoutGrid, href: "/portfolio/collections", keywords: ["deployed", "created", "my contracts", "claim", "import"] },
  "portfolio-assets": { id: "portfolio-assets", label: msg("My assets"), icon: Gem, href: "/portfolio/assets", keywords: ["owned", "nfts", "tokens", "collected"] },
  "portfolio-listings": { id: "portfolio-listings", label: msg("My listings"), icon: Tag, href: "/portfolio/listings", keywords: ["sell", "listed", "active listings"] },
  "portfolio-offers": { id: "portfolio-offers", label: msg("My offers"), icon: List, href: "/portfolio/offers", keywords: ["bids", "made", "sent offers"] },
  "portfolio-received": { id: "portfolio-received", label: msg("Received offers"), icon: ScrollText, href: "/portfolio/received", keywords: ["incoming", "bids", "offers received"] },
  "portfolio-activity": { id: "portfolio-activity", label: msg("My activity"), icon: Activity, href: "/portfolio/activity", keywords: ["history", "transactions", "events"] },
  audio: { id: "audio", label: msg("Audio"), icon: Music, href: "/audio", keywords: ["music", "sound", "track", "podcast"] },
  art: { id: "art", label: msg("Art"), icon: Palette, href: "/art", keywords: ["illustration", "drawing", "painting", "digital art"] },
  video: { id: "video", label: msg("Video"), icon: Film, href: "/video", keywords: ["film", "clip", "animation", "short"] },
  photography: { id: "photography", label: msg("Photography"), icon: Camera, href: "/photography", keywords: ["photo", "image", "picture", "shot"] },
  publications: { id: "publications", label: msg("Publications"), icon: BookOpen, href: "/publications", keywords: ["article", "articles", "blog", "news", "writing", "book", "journal"] },
  nft: { id: "nft", label: msg("NFT"), icon: Gem, href: "/nft", keywords: ["collectible", "token", "generative"] },
  docs: { id: "docs", label: msg("Documentation"), icon: BookOpen, action: () => window.open("https://docs.medialane.io", "_blank"), keywords: ["docs", "help", "guide", "documentation"] },
  "docs-terms": { id: "docs-terms", label: msg("Terms of Service"), icon: FileText, action: () => window.open("https://docs.medialane.io/guidelines/terms", "_blank"), keywords: ["legal", "terms", "tos"] },
  "docs-privacy": { id: "docs-privacy", label: msg("Privacy Policy"), icon: ShieldCheck, action: () => window.open("https://docs.medialane.io/guidelines/privacy", "_blank"), keywords: ["privacy", "data", "gdpr"] },
} satisfies Record<string, NavCommand>;

export type NavItemId = keyof typeof NAV_ITEMS;

export interface NavGroupSpec {
  heading?: string;
  items: (NavItemId | NavCommand)[];
}

export function navGroups(groups: NavGroupSpec[]): NavCommandGroup[] {
  return groups.map(({ heading, items }) => ({
    heading,
    items: items.map((item) => (typeof item === "string" ? NAV_ITEMS[item] : item)),
  }));
}
