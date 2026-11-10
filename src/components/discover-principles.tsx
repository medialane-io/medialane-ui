import {
  BadgeCheck,
  DoorOpen,
  EyeOff,
  FileCog,
  Globe,
  HandCoins,
  Lock,
  PenLine,
  Percent,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const PRINCIPLES: ReadonlyArray<{ icon: LucideIcon; title: string; line: string }> = [
  { icon: HandCoins, title: "99% to creators", line: "Creators and owners keep 99% of every sale." },
  { icon: Globe, title: "No one can take it down", line: "Your work stays up, whatever anyone thinks of it." },
  { icon: ShieldCheck, title: "Security you can verify", line: "Protected by mathematical proof, not promises." },
  { icon: EyeOff, title: "Private by design", line: "You choose what to share. The rest stays yours." },
  { icon: Percent, title: "No fees in the technology", line: "The technology itself charges nothing." },
  { icon: Lock, title: "Rules that never change", line: "Once launched, they stay exactly as written." },
  { icon: DoorOpen, title: "Open to everyone", line: "Create, sell and buy without asking permission." },
  { icon: BadgeCheck, title: "Ownership anyone can check", line: "What you own is public and verifiable." },
  { icon: FileCog, title: "Programmable IP", line: "Set your license once and it travels with your work." },
  { icon: PenLine, title: "Authorship, recorded for good", line: "Your claim to your work is permanent." },
];

export function DiscoverPrinciples() {
  return (
    <section>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
        {PRINCIPLES.map(({ icon: Icon, title, line }) => (
          <div key={title} className="space-y-3 border-t border-border/50 pt-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
              <Icon className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <dt className="text-sm font-semibold leading-snug">{title}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{line}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
