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
  /** Concrete usage example shown on active cards (italic line). */
  example?: string;
  /** Secondary browse link label — injected app adds the href */
  browseLinkLabel?: string;
}

export const LAUNCHPAD_SERVICE_DEFINITIONS: ServiceDefinition[] = [
  // ── Create ────────────────────────────────────────────────────────────────
  {
    key: "mint-ip-asset",
    title: "Mint singular NFT",
    subtitle: "Publish your creative work onchain",
    description:
      "Upload any photo, video, audio, or document and mint it as an IP NFT — with licensing, provenance, and ownership all locked on-chain.",
    // Apps may override features[0] with their gasless-rail wording (ChipiPay/AVNU).
    features: ["Gasless transactions", "IPFS metadata", "Programmable licensing"],
    example: "e.g. A song, a photo, an ebook, a short film",
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
    title: "Create NFT Collection",
    subtitle: "Group your NFTs under a shared identity",
    description:
      "Deploy a branded ERC-721 collection with its own page and on-chain identity. Add assets to it at any time and share it with collectors.",
    features: ["Factory-deployed ERC-721", "Branded collection page", "Add assets at any time"],
    example: "e.g. A photography portfolio, a music catalog, a comic series",
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
    title: "Limited Editions Collections",
    subtitle: "Deploy a contract for multi-copy NFT releases",
    description:
      "Create a collection built for editions — release music tracks, art prints, or any IP in numbered multiples. Each edition token is tradeable on Medialane.",
    features: ["Multi-edition ERC-1155", "Numbered tokens", "Tradeable on Medialane"],
    example: "e.g. 50 copies of a limited print, a music EP released in 100 editions",
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
    title: "Mint Limited Edition",
    subtitle: "Add new editions to an existing collection",
    description:
      "Pick one of your Limited Edition contracts, upload artwork, set the supply, and release to collectors — all in a few clicks.",
    features: ["Choose any edition collection", "Set edition supply", "IPFS metadata"],
    example: "e.g. Drop 25 numbered prints from your art series",
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
      "Create a licensed derivative of any digital asset with full provenance and attribution flowing back to the original creator on-chain.",
    features: ["On-chain attribution", "License-enforced at mint", "Royalties to original creator"],
    example: "e.g. A remix of a song, a derivative artwork inspired by an original",
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
      "Issue soulbound credentials to your community — one non-transferable badge per wallet, permanently on-chain. No transferring, no faking.",
    features: ["Soulbound · non-transferable", "One credential per wallet", "Optional allowlist gating"],
    example: "e.g. Hackathon attendance badge, community membership, conference pass",
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
    subtitle: "Timed NFT releases with mint windows",
    description:
      "Launch a time-gated mint campaign — set a price, supply cap, start and end time, and let collectors mint directly from your drop page.",
    features: ["Timed mint window", "Price + supply cap", "Branded drop page"],
    example: "e.g. A 48-hour drop of 200 NFTs at 5 USDC each",
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
