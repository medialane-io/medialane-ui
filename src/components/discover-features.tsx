import {
  BadgeCheck,
  Code,
  Database,
  DoorOpen,
  EyeOff,
  FileCog,
  Gem,
  Globe,
  HandCoins,
  Lock,
  Percent,
  ScanEye,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ScrollSection } from "./scroll-section.js";
import { cn } from "../utils/cn.js";

const HUES = [
  { text: "text-brand-blue", border: "border-brand-blue/30", tint: "bg-brand-blue/10" },
  { text: "text-brand-maeve", border: "border-brand-maeve/30", tint: "bg-brand-maeve/10" },
  { text: "text-brand-orange", border: "border-brand-orange/30", tint: "bg-brand-orange/10" },
  { text: "text-brand-purple", border: "border-brand-purple/30", tint: "bg-brand-purple/10" },
  { text: "text-brand-rose", border: "border-brand-rose/30", tint: "bg-brand-rose/10" },
];

const FEATURES: ReadonlyArray<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: HandCoins, title: "Creator-first economy", description: "99% to creators/owners + 1% fee goes to the Creator Fund Airdrop." },
  { icon: Globe, title: "Censorship resistance", description: "Assets and ownership live onchain on decentralized networks." },
  { icon: ShieldCheck, title: "Stark cryptography", description: "All transactions are secured onchain by mathematical proofs." },
  { icon: EyeOff, title: "Privacy by design", description: "Medialane is designed for user privacy and sovereignty." },
  { icon: ScanEye, title: "Zero knowledge", description: "Information can be proven valid without revealing the data behind it." },
  { icon: Percent, title: "Zero-fee protocols", description: "The smart contracts charge zero fees for interaction." },
  { icon: Lock, title: "Immutable contracts", description: "All smart contracts are fully open source and immutable." },
  { icon: DoorOpen, title: "Permissionless", description: "Anyone can create, trade and interact with onchain protocols." },
  { icon: Database, title: "Onchain as the source of truth", description: "Assets, ownership, markets and data are read directly onchain." },
  { icon: FileCog, title: "Programmable IP", description: "Licensing terms and rights are stored with the assets." },
  { icon: Gem, title: "Decentralized portfolio", description: "Assets are stored onchain with licensing and metadata on IPFS." },
  { icon: Scale, title: "Protection compliance", description: "Authorship and license are protected under international laws." },
  { icon: Code, title: "Open source and auditable", description: "The code is public to audit, review and collaborate on." },
];

export function DiscoverFeatures() {
  return (
    <ScrollSection icon={<BadgeCheck />} title="Medialane features">
      {FEATURES.map(({ icon: Icon, title, description }, i) => {
        const hue = HUES[i % HUES.length]!;
        return (
          <div
            key={title}
            className={cn(
              "flex min-h-[168px] w-56 shrink-0 snap-start flex-col gap-4 rounded-2xl border bg-card p-6 sm:w-64",
              hue.border,
            )}
          >
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", hue.tint)}>
              <Icon className={cn("h-6 w-6", hue.text)} />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-black leading-snug tracking-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        );
      })}
    </ScrollSection>
  );
}
