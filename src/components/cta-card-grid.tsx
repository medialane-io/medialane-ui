import type { ElementType } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface CtaCardItem {
  icon: ElementType;
  title: string;
  description: string;
  links: { label: string; href: string }[];
  href: string;
  /** Tailwind gradient class applied as a 3% opacity hover overlay */
  gradient: string;
  /** Tailwind gradient + shadow class for the icon pill */
  iconGradient: string;
}

export interface CtaCardGridProps {
  cards: CtaCardItem[];
}

function CtaCard({ icon: Icon, title, description, links, href, gradient, iconGradient }: CtaCardItem) {
  return (
    <div className="bento-cell p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-border/80 transition-colors">
      <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${gradient} pointer-events-none`} />

      <div className="relative z-10 space-y-3">
        <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg", iconGradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{description}</p>
        </div>
      </div>

      <ul className="relative z-10 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group/link">
              <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0 -ml-0.5" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-auto">
        <Link href={href} className="inline-flex items-center gap-1.5 text-sm border border-border rounded-md px-3 py-1.5 hover:border-primary/40 transition-colors group-hover:border-primary/40">
          Explore {title} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Link>
      </div>
    </div>
  );
}

export function CtaCardGrid({ cards }: CtaCardGridProps) {
  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <CtaCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
