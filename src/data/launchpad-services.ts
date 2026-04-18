import type { LucideIcon } from "lucide-react";
import {
  ImagePlus, Layers, GitBranch,
  Award, Package, PlusCircle,
  Ticket, Users,
  RefreshCw, Coins, TrendingUp,
} from "lucide-react";

export type ServiceStatus = "live" | "building" | "soon";
export type ServiceCategory = "create" | "launch" | "monetize";

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
  /** Secondary browse link label — injected app adds the href */
  browseLinkLabel?: string;
}

export const LAUNCHPAD_SERVICE_DEFINITIONS: ServiceDefinition[] = [
  // ── Create ────────────────────────────────────────────────────────────────
  {
    key: "mint-ip-asset",
    title: "Mint IP Asset",
    subtitle: "Register any creative work onchain",
    description:
      "Turn any creative file into a programmable IP NFT. Gasless, permanent, and immediately tradeable.",
    features: ["Gasless via ChipiPay", "IPFS metadata", "Programmable licensing"],
    icon: ImagePlus,
    gradient: "from-blue-500/10 via-sky-400/4 to-transparent",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    buttonColor: "bg-brand-blue hover:bg-brand-blue/90",
    badge: "Create",
    status: "live",
    category: "create",
  },
  {
    key: "create-collection",
    title: "Create Collection",
    subtitle: "Deploy a named ERC-721 catalog",
    description:
      "Deploy a branded collection with its own page, metadata, and on-chain identity — ready to populate with assets.",
    features: ["Factory-deployed ERC-721", "Branded collection page", "Add assets at any time"],
    icon: Layers,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-brand-purple hover:bg-brand-purple/90",
    badge: "Create",
    status: "live",
    category: "create",
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
    badge: "Remix",
    status: "live",
    category: "create",
  },

  // ── Launch ────────────────────────────────────────────────────────────────
  {
    key: "pop-protocol",
    title: "POP Protocol",
    subtitle: "Soulbound credentials for events & education",
    description:
      "Issue non-transferable on-chain credentials for bootcamps, hackathons, and conferences. Each attendee claims one soulbound badge — permanently tied to their wallet.",
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
  },
  {
    key: "ip-collection-1155",
    title: "IP Collection 1155",
    subtitle: "Multi-edition ERC-1155 collections",
    description:
      "Deploy a multi-edition collection for music tracks, art series, or any IP with multiple copies. Mint unlimited editions in a single transaction.",
    features: ["Multi-edition ERC-1155", "Immutable provenance", "Tradeable on Medialane"],
    icon: Layers,
    gradient: "from-violet-500/10 via-purple-400/4 to-transparent",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    buttonColor: "bg-violet-600 hover:bg-violet-700",
    badge: "Launch",
    status: "live",
    category: "launch",
  },
  {
    key: "mint-editions",
    title: "Mint Editions",
    subtitle: "Add new tokens to an existing collection",
    description:
      "Select one of your IP Collection 1155 contracts and mint new token editions into it — set supply, upload artwork, and release to collectors.",
    features: ["Choose any 1155 collection", "Set edition supply", "IPFS metadata"],
    icon: PlusCircle,
    gradient: "from-fuchsia-500/10 via-violet-400/4 to-transparent",
    borderColor: "border-fuchsia-500/20",
    iconColor: "text-fuchsia-500",
    buttonColor: "bg-fuchsia-600 hover:bg-fuchsia-700",
    badge: "Launch",
    status: "live",
    category: "launch",
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
  },
  {
    key: "creator-coins",
    title: "Creator Coins",
    subtitle: "Personal social token for fans",
    description:
      "Launch a social token tied to your creative career. Let fans invest directly in your work — full economic alignment between creator and community.",
    features: ["Personal social token", "Fan investment", "Creator-community alignment"],
    icon: TrendingUp,
    gradient: "from-pink-500/6 via-rose-400/2 to-transparent",
    borderColor: "border-pink-500/10",
    iconColor: "text-pink-400",
    badge: "Soon",
    status: "soon",
    category: "monetize",
  },
];
