import {
  Activity, BookOpen, Briefcase, Camera, Coins, FileText, Film, Gem, Gift, Handshake, Home, Layers, LayoutGrid, List, Music, Palette, Plus, Repeat2, ScrollText, Settings, ShieldCheck, Store, Tag, Telescope, Ticket, Trophy, Users, Zap,
} from "lucide-react";
import type { NavCommand, NavCommandGroup } from "../components/nav-command-menu.js";

export const NAV_ITEMS = {
  home: { id: "home", label: "Medialane", icon: Home, href: "/", keywords: ["home", "frontpage", "start", "homepage", "main"], description: "Start here" },
  discover: { id: "discover", label: "Discover", icon: Telescope, href: "/discover", keywords: ["feed", "explore", "trending"], description: "Feeds, collections & creators" },
  marketplace: { id: "marketplace", label: "Marketplace", icon: Store, href: "/marketplace", keywords: ["buy", "sell", "trade", "listings", "browse"], description: "Buy, sell & make offers" },
  launchpad: { id: "launchpad", label: "Launchpad", icon: Zap, href: "/launchpad", keywords: ["start", "launch", "creator", "mint", "create"], description: "Create, mint & launch" },
  portfolio: { id: "portfolio", label: "Portfolio", icon: Briefcase, href: "/portfolio", keywords: ["owned", "my nfts", "wallet", "account"], description: "Your assets & activity" },
  collections: { id: "collections", label: "Collections", icon: LayoutGrid, href: "/collections", keywords: ["nft", "drops", "browse"] },
  coins: { id: "coins", label: "Coins", icon: Coins, href: "/coins", keywords: ["token", "creator coin", "memecoin", "discover", "trade", "swap"] },
  creators: { id: "creators", label: "Creators", icon: Users, href: "/creators", keywords: ["artists", "profile", "profiles", "community"] },
  activities: { id: "activities", label: "Activity", icon: Activity, href: "/activities", keywords: ["history", "transactions", "feed", "events"] },
  rewards: { id: "rewards", label: "Rewards", icon: Trophy, href: "/rewards", keywords: ["xp", "points", "scoreboard", "leaderboard", "badges", "rank"] },
  airdrop: { id: "airdrop", label: "Airdrop", icon: Gift, href: "/airdrop", keywords: ["claim", "free", "drop", "genesis", "creator's fund"] },
  settings: { id: "settings", label: "Account Settings", icon: Settings, href: "/settings", keywords: ["profile", "username", "preferences", "account"] },
  "mint-ip-asset": { id: "mint-ip-asset", label: "Mint Unique NFT", icon: Plus, href: "/launchpad/single-editions", keywords: ["mint", "upload", "publish", "token", "erc721", "singular", "unique", "original"] },
  "create-collection": { id: "create-collection", label: "Create NFT Collection", icon: LayoutGrid, href: "/launchpad/single-editions/collection", keywords: ["deploy", "series", "erc721", "collection", "branded"] },
  "mint-editions": { id: "mint-editions", label: "Mint Limited Edition", icon: Layers, href: "/launchpad/nfteditions", keywords: ["mint", "edition", "erc1155", "multi", "copies", "limited"] },
  "create-1155": { id: "create-1155", label: "Create Limited Edition Contract", icon: Layers, href: "/launchpad/nfteditions/create", keywords: ["deploy", "erc1155", "edition", "contract", "limited", "multi-edition"] },
  "collection-drop": { id: "collection-drop", label: "Launch Collection Drop", icon: Gift, href: "/launchpad/drop/create", keywords: ["drop", "timed", "fixed supply", "release", "erc721"] },
  "browse-drops": { id: "browse-drops", label: "Browse Drops", icon: Store, href: "/launchpad/drop", keywords: ["drop", "browse", "active"] },
  "pop-create": { id: "pop-create", label: "Create POP Event", icon: Ticket, href: "/launchpad/pop/create", keywords: ["pop", "proof of participation", "event", "community", "soulbound"] },
  "pop-browse": { id: "pop-browse", label: "Browse POP Events", icon: Ticket, href: "/launchpad/pop", keywords: ["pop", "events", "proof of participation"] },
  "tickets-create": { id: "tickets-create", label: "Create IP Tickets", icon: Ticket, href: "/launchpad/tickets/create", keywords: ["tickets", "event", "verifiable", "attendee", "pass"] },
  "tickets-browse": { id: "tickets-browse", label: "Browse IP Tickets", icon: Ticket, href: "/launchpad/tickets", keywords: ["tickets", "browse", "events"] },
  "club-create": { id: "club-create", label: "Create IP Club", icon: Users, href: "/launchpad/club/create", keywords: ["club", "membership", "tiers", "community", "fans"] },
  "club-browse": { id: "club-browse", label: "Browse IP Clubs", icon: Users, href: "/launchpad/club", keywords: ["club", "membership", "browse"] },
  "sponsorship-create": { id: "sponsorship-create", label: "Create IP Sponsorship", icon: Handshake, href: "/launchpad/sponsorship/create", keywords: ["sponsorship", "sponsor", "license", "offer", "deal"] },
  "sponsorship-browse": { id: "sponsorship-browse", label: "Browse IP Sponsorship", icon: Handshake, href: "/launchpad/sponsorship", keywords: ["sponsorship", "browse", "offers"] },
  "launch-coin": { id: "launch-coin", label: "Launch a Creator Coin", icon: Coins, href: "/launchpad/coin/create", keywords: ["coin", "creator coin", "erc20", "token", "ekubo", "liquidity", "launch"] },
  remix: { id: "remix", label: "Remix an Asset", icon: Repeat2, href: "/marketplace", keywords: ["remix", "derivative", "attribution", "fork"] },
  "portfolio-collections": { id: "portfolio-collections",label: "My Collections", icon: LayoutGrid, href: "/portfolio/collections", keywords: ["deployed", "created", "my contracts", "claim", "import"] },
  "portfolio-assets": { id: "portfolio-assets", label: "My Assets", icon: Gem, href: "/portfolio/assets", keywords: ["owned", "nfts", "tokens", "collected"] },
  "portfolio-listings": { id: "portfolio-listings", label: "My Listings", icon: Tag, href: "/portfolio/listings", keywords: ["sell", "listed", "active listings"] },
  "portfolio-offers": { id: "portfolio-offers", label: "My Offers", icon: List, href: "/portfolio/offers", keywords: ["bids", "made", "sent offers"] },
  "portfolio-received": { id: "portfolio-received", label: "Received Offers", icon: ScrollText, href: "/portfolio/received", keywords: ["incoming", "bids", "offers received"] },
  "portfolio-activity": { id: "portfolio-activity", label: "My Activity", icon: Activity, href: "/portfolio/activity", keywords: ["history", "transactions", "events"] },
  audio: { id: "audio", label: "Audio", icon: Music, href: "/audio", keywords: ["music", "sound", "track", "podcast"] },
  art: { id: "art", label: "Art", icon: Palette, href: "/art", keywords: ["illustration", "drawing", "painting", "digital art"] },
  video: { id: "video", label: "Video", icon: Film, href: "/video", keywords: ["film", "clip", "animation", "short"] },
  photography: { id: "photography", label: "Photography", icon: Camera, href: "/photography", keywords: ["photo", "image", "picture", "shot"] },
  publications: { id: "publications", label: "Publications", icon: BookOpen, href: "/publications", keywords: ["article", "articles", "blog", "news", "writing", "book", "journal"] },
  nft: { id: "nft", label: "NFT", icon: Gem, href: "/nft", keywords: ["collectible", "token", "generative"] },
  docs: { id: "docs", label: "Docs — Overview", icon: BookOpen, action: () => window.open("https://docs.medialane.io", "_blank"), keywords: ["docs", "help", "guide", "documentation"] },
  "docs-market": { id: "docs-market", label: "Docs — Marketplace", icon: Store, action: () => window.open("https://docs.medialane.io/marketplace", "_blank"), keywords: ["docs", "buy", "sell", "orders", "guide"] },
  "docs-launchpad": { id: "docs-launchpad",label: "Docs — Launchpad", icon: Zap, action: () => window.open("https://docs.medialane.io/launchpad", "_blank"), keywords: ["docs", "creator", "mint", "deploy", "guide"] },
  "docs-ip": { id: "docs-ip", label: "Docs — IP & Licensing", icon: ShieldCheck, action: () => window.open("https://docs.medialane.io/ip-licensing", "_blank"), keywords: ["docs", "license", "ip", "rights", "royalty"] },
  "docs-sdk": { id: "docs-sdk", label: "Docs — SDK & API", icon: FileText, action: () => window.open("https://docs.medialane.io/sdk", "_blank"), keywords: ["docs", "developer", "api", "sdk", "integration"] },
  "docs-terms": { id: "docs-terms", label: "Terms of Service", icon: FileText, action: () => window.open("https://docs.medialane.io/guidelines/terms", "_blank"), keywords: ["legal", "terms", "tos"] },
  "docs-privacy": { id: "docs-privacy", label: "Privacy Policy", icon: ShieldCheck, action: () => window.open("https://docs.medialane.io/guidelines/privacy", "_blank"), keywords: ["privacy", "data", "gdpr"] },
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
