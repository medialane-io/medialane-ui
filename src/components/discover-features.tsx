import {
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
import { cn } from "../utils/cn.js";

const HUES = [
  { text: "text-brand-blue", border: "border-brand-blue/30", tint: "bg-brand-blue/10" },
  { text: "text-brand-maeve", border: "border-brand-maeve/30", tint: "bg-brand-maeve/10" },
  { text: "text-brand-orange", border: "border-brand-orange/30", tint: "bg-brand-orange/10" },
  { text: "text-brand-purple", border: "border-brand-purple/30", tint: "bg-brand-purple/10" },
  { text: "text-brand-rose", border: "border-brand-rose/30", tint: "bg-brand-rose/10" },
];

const FEATURES: ReadonlyArray<{ icon: LucideIcon; title: string }> = [
  { icon: HandCoins, title: "99% to creators and owners" },
  { icon: Globe, title: "Censorship resistance" },
  { icon: ShieldCheck, title: "Stark cryptography" },
  { icon: EyeOff, title: "Privacy by design" },
  { icon: ScanEye, title: "Zero knowledge proof with Starknet" },
  { icon: Percent, title: "Zero fees on protocols" },
  { icon: Lock, title: "Immutable smart contracts" },
  { icon: DoorOpen, title: "Permissionless" },
  { icon: Database, title: "Smart contracts are the source of truth" },
  { icon: FileCog, title: "Programmable IP" },
  { icon: Gem, title: "Immutable assets" },
  { icon: Scale, title: "IP protection compliance" },
  { icon: Code, title: "Open source and auditable" },
];

export function DiscoverFeatures() {
  return (
    <section className="w-full overflow-x-auto scrollbar-hide">
      <ul className="flex snap-x snap-mandatory gap-5 pb-2 sm:gap-6" style={{ width: "max-content" }}>
        {FEATURES.map(({ icon: Icon, title }, i) => {
          const hue = HUES[i % HUES.length]!;
          return (
            <li
              key={title}
              className={cn(
                "flex min-h-[168px] w-56 shrink-0 snap-start flex-col gap-4 rounded-2xl border bg-card p-6 sm:w-64",
                hue.border,
              )}
            >
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", hue.tint)}>
                <Icon className={cn("h-6 w-6", hue.text)} />
              </span>
              <h3 className="text-lg font-black leading-snug tracking-tight">{title}</h3>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
