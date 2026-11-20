"use client";

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
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";
import { IconTile } from "./icon-tile.js";

const HUES = [
  { border: "border-brand-blue/30" },
  { border: "border-brand-maeve/30" },
  { border: "border-brand-orange/30" },
  { border: "border-brand-purple/30" },
  { border: "border-brand-rose/30" },
];

const FEATURES: ReadonlyArray<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: HandCoins, title: msg("Creator-first economy"), description: msg("99% to creators/owners + 1% fee goes to the Creator Fund Airdrop.") },
  { icon: Globe, title: msg("Censorship resistance"), description: msg("Assets and ownership live onchain on decentralized networks.") },
  { icon: ShieldCheck, title: msg("Stark cryptography"), description: msg("All transactions are secured onchain by mathematical proofs.") },
  { icon: EyeOff, title: msg("Privacy by design"), description: msg("Medialane is designed for user privacy and sovereignty.") },
  { icon: ScanEye, title: msg("Zero knowledge"), description: msg("Information can be proven valid without revealing the data behind it.") },
  { icon: Percent, title: msg("Zero-fee protocols"), description: msg("The smart contracts charge zero fees for interaction.") },
  { icon: Lock, title: msg("Immutable contracts"), description: msg("All smart contracts are fully open source and immutable.") },
  { icon: DoorOpen, title: msg("Permissionless"), description: msg("Anyone can create, trade and interact with onchain protocols.") },
  { icon: Database, title: msg("Onchain as the source of truth"), description: msg("Assets, ownership, markets and data are read directly onchain.") },
  { icon: FileCog, title: msg("Programmable IP"), description: msg("Licensing terms and rights are stored with the assets.") },
  { icon: Gem, title: msg("Decentralized portfolio"), description: msg("Assets are stored onchain with licensing and metadata on IPFS.") },
  { icon: Scale, title: msg("Protection compliance"), description: msg("Authorship and license are protected under international laws.") },
  { icon: Code, title: msg("Open source and auditable"), description: msg("The code is public to audit, review and collaborate on.") },
];

export function DiscoverFeatures() {
  const t = useT();
  return (
    <ScrollSection icon={<BadgeCheck />} title={t("Medialane features")}>
      {FEATURES.map(({ icon: Icon, title, description }, i) => {
        const hue = HUES[i % HUES.length]!;
        return (
          <div
            key={title}
            className={cn(
              "panel flex min-h-[168px] w-56 shrink-0 snap-start flex-col gap-4 p-6 sm:w-64",
              hue.border,
            )}
          >
            <IconTile>
              <Icon />
            </IconTile>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-black leading-snug tracking-tight">{t(title)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(description)}</p>
            </div>
          </div>
        );
      })}
    </ScrollSection>
  );
}
