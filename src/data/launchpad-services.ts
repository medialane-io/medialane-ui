import type { LucideIcon } from "lucide-react";
import {
  ImagePlus, Layers, GitBranch,
  Award, Package, PlusCircle,
  Ticket, Users,
  RefreshCw, Coins, TrendingUp,
  AtSign, FolderInput,
} from "lucide-react";

export type ServiceStatus = "live" | "building" | "soon";
export type ServiceCategory = "create" | "launch" | "monetize";

export type ServiceGroup =
  | "single-edition"
  | "limited-editions"
  | "creator-coins"
  | "collection-drop"
  | "pop-protocol"
  | "licensing-remix"
  | "claims"
  | "coming-soon";

export interface ServiceGroupDefinition {
  key: ServiceGroup;
  title: string;
  /** One line of plain creator language: what does this group do for my portfolio/revenue? */
  tagline: string;
  /** Optional small chip next to the title (e.g. the token standard) */
  badge?: string;
}

/** Ordered — launchpad pages render sections in this order. */
export const LAUNCHPAD_SERVICE_GROUPS: ServiceGroupDefinition[] = [
  {
    key: "single-edition",
    title: "Single Edition NFTs",
    badge: "ERC-721",
    tagline: "Publish one-of-one works and group them under your own brand.",
  },
  {
    key: "limited-editions",
    title: "Limited Editions",
    badge: "ERC-1155",
    tagline: "Release your work in numbered multiples collectors can buy and trade.",
  },
  {
    key: "creator-coins",
    title: "Creator Coins",
    tagline: "Launch your own coin with a public liquidity pool you control.",
  },
  {
    key: "collection-drop",
    title: "Collection Drop",
    tagline: "Timed releases with mint windows your community can race to collect.",
  },
  {
    key: "pop-protocol",
    title: "POP Protocol",
    tagline: "Credentials for your events and community — permanent, non-transferable proof.",
  },
  {
    key: "licensing-remix",
    title: "Licensing & Remix",
    tagline: "Licensed derivatives with attribution and royalties flowing back to you.",
  },
  {
    key: "claims",
    title: "Claims",
    tagline: "Free wins that build your creator profile and bring your existing work onchain.",
  },
  {
    key: "coming-soon",
    title: "Coming soon",
    tagline: "More monetization services on the way.",
  },
];

export interface ServiceDefinition {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
  iconColor: string;
  buttonColor?: string;
  badge: string;
  status: ServiceStatus;
  category: ServiceCategory;
  group: ServiceGroup;
  /** Secondary browse link label — injected app adds the href */
  browseLinkLabel?: string;
}

export const LAUNCHPAD_SERVICE_DEFINITIONS: ServiceDefinition[] = [
  // ── Create ────────────────────────────────────────────────────────────────
  {
    key: "mint-ip-asset",
    title: "Mint IP NFT",
    subtitle: "Publish any creative work on Starknet",
    description:
      "Turn any photo, video, or audio file into a programmable IP NFT. Gasless, permanent, and immediately tradeable on Medialane.",
    features: ["Gasless via ChipiPay", "IPFS metadata", "Programmable licensing"],
    icon: ImagePlus,
    gradient: "from-blue-500/10 via-sky-400/4 to-transparent",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    buttonColor: "bg-brand-blue hover:bg-brand-blue/90",
    badge: "Create",
    status: "live",
    category: "create",
    group: "single-edition",
  },
  {
    key: "create-collection",
    title: "Create Collection",
    subtitle: "Group your NFTs under a shared identity",
    description:
      "Deploy a branded ERC-721 collection with its own page, metadata, and on-chain identity — ready to populate with assets at any time.",
    features: ["Factory-deployed ERC-721", "Branded collection page", "Add assets at any time"],
    icon: Layers,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-brand-purple hover:bg-brand-purple/90",
    badge: "Create",
    status: "live",
    category: "create",
    group: "single-edition",
  },
  {
    key: "ip-collection-1155",
    title: "Edition Collection",
    subtitle: "Deploy a contract for multi-copy NFT releases",
    description:
      "Launch a collection for music tracks, art prints, or any IP you want to release in multiples. Each edition token is numbered and tradeable on Medialane.",
    features: ["Multi-edition ERC-1155", "Immutable provenance", "Tradeable on Medialane"],
    icon: Layers,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-violet-600 hover:bg-violet-700",
    badge: "Create",
    status: "live",
    category: "create",
    group: "limited-editions",
  },
  {
    key: "mint-editions",
    title: "Mint NFT Editions",
    subtitle: "Add new editions to an existing collection",
    description:
      "Select one of your Edition Collection contracts and mint new token editions into it — set supply, upload artwork, and release to collectors.",
    features: ["Choose any edition collection", "Set edition supply", "IPFS metadata"],
    icon: PlusCircle,
    gradient: "from-fuchsia-500/10 via-violet-400/4 to-transparent",
    borderColor: "border-fuchsia-500/20",
    iconColor: "text-fuchsia-500",
    buttonColor: "bg-fuchsia-600 hover:bg-fuchsia-700",
    badge: "Create",
    status: "live",
    category: "create",
    group: "limited-editions",
  },
  {
    key: "remix-asset",
    title: "Remix Asset",
    subtitle: "Derivative works with on-chain attribution",
    description:
      "Create a licensed derivative of any IP asset with full provenance and attribution flowing back to the original creator.",
    features: ["On-chain attribution", "License-enforced at mint", "Royalties to original creator"],
    icon: GitBranch,
    gradient: "from-rose-500/10 via-pink-400/4 to-transparent",
    borderColor: "border-rose-500/20",
    iconColor: "text-rose-500",
    buttonColor: "bg-brand-rose hover:bg-brand-rose/90",
    badge: "Create",
    status: "live",
    category: "create",
    group: "licensing-remix",
  },

  // ── Launch ────────────────────────────────────────────────────────────────
  {
    key: "pop-protocol",
    title: "POP Protocol",
    subtitle: "Proof-of-participation for events & communities",
    description:
      "Give every attendee proof they were there. Issue soulbound credentials to your community — one non-transferable badge per wallet, permanently on-chain. Works for bootcamps, hackathons, and conferences.",
    features: ["Soulbound · non-transferable", "One credential per wallet", "Optional allowlist gating"],
    icon: Award,
    gradient: "from-emerald-500/10 via-green-400/4 to-transparent",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-500",
    buttonColor: "bg-green-600 hover:bg-green-700",
    badge: "Launch",
    browseLinkLabel: "Browse events",
    status: "live",
    category: "launch",
    group: "pop-protocol",
  },
  {
    key: "collection-drop",
    title: "Collection Drop",
    subtitle: "Limited-edition timed releases",
    description:
      "Launch a fixed-supply ERC-721 drop with a defined mint window and per-wallet limit. Set your open date and let your community race to collect.",
    features: ["Fixed supply cap", "Timed mint window", "Free or paid mint"],
    icon: Package,
    gradient: "from-orange-500/10 via-amber-400/4 to-transparent",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-500",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    badge: "Launch",
    browseLinkLabel: "Browse drops",
    status: "live",
    category: "launch",
    group: "collection-drop",
  },
  {
    key: "ip-tickets",
    title: "IP Tickets",
    subtitle: "Gate real-world experiences with NFTs",
    description:
      "Distribute tickets for concerts, workshops, and events. Each ticket is verifiable on-chain proof of attendance.",
    features: ["NFT-based event gating", "Proof of attendance", "Transferable or soulbound"],
    icon: Ticket,
    gradient: "from-teal-500/7 via-cyan-400/3 to-transparent",
    borderColor: "border-teal-500/15",
    iconColor: "text-teal-500",
    badge: "Soon",
    status: "building",
    category: "launch",
    group: "coming-soon",
  },
  {
    key: "membership",
    title: "Membership",
    subtitle: "Token-gated access passes",
    description:
      "Create tiered membership passes that unlock exclusive content, private communities, and experiences for your most loyal fans.",
    features: ["Token-gated content", "Tiered access levels", "Community alignment"],
    icon: Users,
    gradient: "from-indigo-500/6 via-violet-400/2 to-transparent",
    borderColor: "border-indigo-500/10",
    iconColor: "text-indigo-400",
    badge: "Soon",
    status: "soon",
    category: "launch",
    group: "coming-soon",
  },

  // ── Monetize ─────────────────────────────────────────────────────────────
  {
    key: "subscriptions",
    title: "Subscriptions",
    subtitle: "Recurring on-chain revenue",
    description:
      "Monthly licensing, creator support tiers, and access passes — all auto-renewed without intermediaries.",
    features: ["Recurring revenue", "Auto-renewal protocol", "No middlemen"],
    icon: RefreshCw,
    gradient: "from-sky-500/6 via-blue-400/2 to-transparent",
    borderColor: "border-sky-500/10",
    iconColor: "text-sky-400",
    badge: "Soon",
    status: "soon",
    category: "monetize",
    group: "coming-soon",
  },
  {
    key: "ip-coins",
    title: "IP Coins",
    subtitle: "Fractional ownership of intellectual property",
    description:
      "Tokenize your IP catalog as fungible tokens. Enable fractional ownership and liquid markets around your creative work.",
    features: ["Fungible IP tokens", "Fractional ownership", "Liquid secondary markets"],
    icon: Coins,
    gradient: "from-amber-500/6 via-yellow-400/2 to-transparent",
    borderColor: "border-amber-500/10",
    iconColor: "text-amber-400",
    badge: "Soon",
    status: "soon",
    category: "monetize",
    group: "coming-soon",
  },
  {
    key: "creator-coins",
    title: "Creator Coin",
    subtitle: "Your own coin, your liquidity",
    description:
      "Launch a standard ERC-20 coin tied to your creative work, paired with a public Ekubo liquidity pool. You set the supply and allocation — and you stay in control of the liquidity.",
    features: ["Standard ERC-20", "Public Ekubo pool", "You control the liquidity"],
    icon: TrendingUp,
    gradient: "from-pink-500/6 via-rose-400/2 to-transparent",
    borderColor: "border-pink-500/20",
    iconColor: "text-pink-400",
    buttonColor: "bg-brand-rose hover:bg-brand-rose/90",
    badge: "Soon",
    status: "soon",
    category: "monetize",
    group: "creator-coins",
  },

  // ── Claims ────────────────────────────────────────────────────────────────
  {
    key: "claim-memecoin",
    title: "Claim Memecoin",
    subtitle: "Bring your Starknet coin to Medialane",
    description:
      "Already launched a coin on Starknet (unrug or partner)? Claim it to add it to Medialane — reviewed by our team, then live on the Coins page and your profile.",
    features: ["unrug & partner coins", "Team reviewed", "Lists on /coins"],
    icon: Coins,
    gradient: "from-orange-500/10 via-amber-400/4 to-transparent",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-500",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    badge: "Claim",
    status: "soon",
    category: "monetize",
    group: "creator-coins",
  },
  {
    key: "claim-username",
    title: "Claim Username",
    subtitle: "Reserve your creator page URL",
    description:
      "Claim your unique username and get a shareable creator page — your public portfolio at a clean, memorable URL. Free, and yours.",
    features: ["Free claim", "Shareable creator page", "Your public portfolio"],
    icon: AtSign,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-brand-purple hover:bg-brand-purple/90",
    badge: "Claim",
    status: "live",
    category: "create",
    group: "claims",
  },
  {
    key: "claim-collection",
    title: "Claim Collection",
    subtitle: "Import an existing Starknet collection",
    description:
      "Already deployed an ERC-721 collection on Starknet? Claim it to link it to your Medialane profile and give it a branded collection page.",
    features: ["Import existing ERC-721", "Linked to your profile", "Branded collection page"],
    icon: FolderInput,
    gradient: "from-blue-500/10 via-sky-400/4 to-transparent",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    buttonColor: "bg-brand-blue hover:bg-brand-blue/90",
    badge: "Claim",
    status: "live",
    category: "create",
    group: "claims",
  },
];
