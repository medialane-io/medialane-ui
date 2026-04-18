"use client";

import Link from "next/link";
import { ArrowRight, Rocket, type LucideIcon } from "lucide-react";

export interface FeatureItem {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  /** Tailwind gradient string e.g. "from-violet-500 to-purple-600" */
  accent: string;
  href: string;
}

export interface LaunchpadGridProps {
  title?: string;
  titleHref?: string;
  titleHrefLabel?: string;
  features: FeatureItem[];
}

function ServiceCard({ feature }: { feature: FeatureItem }) {
  const { icon: Icon, label, subtitle, accent, href } = feature;
  return (
    <Link href={href} className="group block">
      <div className="card-base overflow-hidden">
        <div className={`relative aspect-[3/4] w-full bg-gradient-to-br ${accent}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.14),transparent_60%)]" />
          <div className="absolute -bottom-6 -right-6 opacity-[0.12] pointer-events-none">
            <Icon className="h-36 w-36 text-white" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20 group-hover:bg-white/[0.18] transition-colors duration-300">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-white leading-tight tracking-tight">{label}</p>
              <p className="text-xs text-white/65 mt-1.5 leading-relaxed">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LaunchpadGrid({
  title = "Creator Launchpad",
  titleHref = "/launchpad",
  titleHrefLabel = "All services",
  features,
}: LaunchpadGridProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md shadow-primary/20">
            <Rocket className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        </div>
        <Link href={titleHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
          {titleHrefLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 snap-x snap-mandatory pb-2" style={{ width: "max-content" }}>
          {features.map((f) => (
            <div key={f.label} className="w-56 sm:w-64 snap-start shrink-0">
              <ServiceCard feature={f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
