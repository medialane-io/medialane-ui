"use client";

import { useState, type ReactNode } from "react";
import {
  Sparkles,
  CheckCircle2,
  FileCheck,
  Coins,
  Users,
  ImageIcon,
  Shield,
  Info,
  PenLine,
  ShoppingCart,
  UserCheck,
  XCircle,
  ChevronDown,
} from "lucide-react";
import Image from "./image.js";
import Link from "./link.js";
import { MedialaneLogoFull as MedialaneLogo } from "./brand-logo.js";
import { panelTint } from "./panel.js";
import { IconTile } from "./icon-tile.js";

interface Card {
  title: string;
  body: string;
}

interface TaggedCard extends Card {
  tag: string;
}

export interface MintLandingCopy {
  image: { src: string; alt: string; fallback: string };
  badge?: string;
  headline: { lead: string; highlight: string };
  intro?: string;
  chips: string[];
  learnMore: string;
  fund: { title: string; cards: [Card, Card, Card] };
  how: { eyebrow: string; title: string; account: TaggedCard; create: TaggedCard; trade: TaggedCard };
  phases: { eyebrow: string; title: string; first: TaggedCard; second: TaggedCard; note: string };
  eligibility: { eyebrow: string; title: string; items: Array<{ ok: boolean; text: string }> };
  disclaimer: {
    title: string;
    paragraphs: string[];
    agree: { lead: string; campaignTerms: string; and: string; terms: string };
  };
  footer: {
    line: string;
    campaignTerms: string;
    links: { terms: string; privacy: string; campaign: string; about: string };
  };
}

const DOCS = "https://docs.medialane.io";
const FUND_ICONS = [FileCheck, Coins, Users];

function EventCard({ image }: { image: MintLandingCopy["image"] }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20 aspect-square w-full">
      {errored ? (
        <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">{image.fallback}</p>
        </div>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}

const DocLink = ({ path, className, children }: { path: string; className: string; children: ReactNode }) => (
  <a href={`${DOCS}${path}`} target="_blank" rel="noopener noreferrer" className={className}>
    {children}
  </a>
);

export function MintLanding({ copy, mint }: { copy: MintLandingCopy; mint: ReactNode }) {
  const { how, phases, eligibility, disclaimer, footer } = copy;
  return (
    <div className="min-h-screen flex flex-col bg-background">

      <header className="px-6 py-4 flex items-center border-b border-border/30">
        <Link href="/"><MedialaneLogo /></Link>
      </header>

      <div className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">

          <section className="py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

              <div className="space-y-5">
                {copy.badge && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/15 px-3 py-1">
                    <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
                    <span className="text-xs font-semibold text-brand-orange">{copy.badge}</span>
                  </div>
                )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                  {copy.headline.lead}{" "}
                  <span className="text-brand-orange">
                    {copy.headline.highlight}
                  </span>
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  {copy.chips.map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                      <CheckCircle2 className="h-3 w-3 text-brand-blue/70" />
                      {t}
                    </div>
                  ))}
                </div>

                {mint}

                {copy.intro && <p className="text-sm text-muted-foreground leading-relaxed">{copy.intro}</p>}
              </div>

              <div className="lg:sticky lg:top-24">
                <EventCard image={copy.image} />
              </div>

            </div>
          </section>

          <details className="group border-t border-border/30">
            <summary className="flex items-center justify-center gap-2 py-6 cursor-pointer list-none text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&::-webkit-details-marker]:hidden">
              {copy.learnMore}
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>

            <div className="pb-8 space-y-0">

              <section className="py-8 border-t border-border/30 space-y-6">
                <h2 className="text-2xl sm:text-3xl font-black">{copy.fund.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {copy.fund.cards.map(({ title, body }, i) => {
                    const Icon = FUND_ICONS[i];
                    return (
                      <div key={title} className="panel flex flex-col gap-4 p-5">
                        <IconTile>
                          <Icon />
                        </IconTile>
                        <div>
                          <p className="font-bold">{title}</p>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="py-8 border-t border-border/30 space-y-6">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{how.eyebrow}</p>
                  <h2 className="text-2xl sm:text-3xl font-black">{how.title}</h2>
                </div>

                <div className="panel p-6" style={panelTint("blue")}>
                  <div className="flex items-start gap-4">
                    <IconTile>
                      <UserCheck />
                    </IconTile>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-lg">{how.account.title}</p>
                        <span className="text-xs font-bold bg-brand-blue/15 text-brand-blue px-2.5 py-0.5 rounded-full">{how.account.tag}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {how.account.body}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="panel p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <IconTile>
                        <PenLine />
                      </IconTile>
                      <span className="text-xs font-semibold text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-full">{how.create.tag}</span>
                    </div>
                    <div>
                      <p className="font-bold">{how.create.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {how.create.body}
                      </p>
                    </div>
                  </div>
                  <div className="panel p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <IconTile>
                        <ShoppingCart />
                      </IconTile>
                      <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-full">{how.trade.tag}</span>
                    </div>
                    <div>
                      <p className="font-bold">{how.trade.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {how.trade.body}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="py-8 border-t border-border/30 space-y-6">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{phases.eyebrow}</p>
                  <h2 className="text-2xl sm:text-3xl font-black">{phases.title}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="panel p-5 space-y-3" style={panelTint("blue")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-lg">{phases.first.title}</p>
                      <span className="text-xs font-semibold bg-brand-blue/10 text-brand-blue px-2.5 py-1 rounded-full">{phases.first.tag}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {phases.first.body}
                    </p>
                  </div>
                  <div className="panel p-5 space-y-3" style={panelTint("purple")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-lg">{phases.second.title}</p>
                      <span className="text-xs font-semibold bg-brand-purple/10 text-brand-purple px-2.5 py-1 rounded-full">{phases.second.tag}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {phases.second.body}
                    </p>
                  </div>
                </div>
                <div className="panel p-4 flex items-start gap-3">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {phases.note}
                  </p>
                </div>
              </section>

              <section className="py-8 border-t border-border/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{eligibility.eyebrow}</p>
                      <h2 className="text-2xl font-black">{eligibility.title}</h2>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      {eligibility.items.map(({ ok, text }) => (
                        <div key={text} className="flex items-start gap-3">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ok ? "bg-brand-blue/10" : "bg-destructive/10"}`}>
                            {ok
                              ? <CheckCircle2 className="h-3 w-3 text-brand-blue" />
                              : <XCircle className="h-3 w-3 text-destructive" />}
                          </div>
                          <span className="text-muted-foreground leading-relaxed">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-2xl font-black">{disclaimer.title}</h2>
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      {disclaimer.paragraphs.map((p) => <p key={p}>{p}</p>)}
                      <p>
                        {disclaimer.agree.lead}{" "}
                        <DocLink path="/guidelines/campaign-terms" className="underline underline-offset-2 hover:text-foreground transition-colors">{disclaimer.agree.campaignTerms}</DocLink>
                        {" "}{disclaimer.agree.and}{" "}
                        <DocLink path="/guidelines/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">{disclaimer.agree.terms}</DocLink>.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </details>

          <div className="pb-12" />
        </div>
      </div>

      <footer className="border-t border-border/40">
        <p className="text-2xs text-center text-muted-foreground/50 px-5 pt-4">
          {footer.line}{" "}
          <DocLink path="/guidelines/campaign-terms" className="underline underline-offset-2 hover:text-muted-foreground/80 transition-colors">
            {footer.campaignTerms}
          </DocLink>
        </p>
        <div className="px-5 py-4 flex items-center justify-center gap-5 text-xs text-muted-foreground flex-wrap">
          <DocLink path="/guidelines/terms" className="hover:text-foreground transition-colors">{footer.links.terms}</DocLink>
          <DocLink path="/guidelines/privacy" className="hover:text-foreground transition-colors">{footer.links.privacy}</DocLink>
          <DocLink path="/guidelines/campaign-terms" className="hover:text-foreground transition-colors">{footer.links.campaign}</DocLink>
          <DocLink path="/about" className="hover:text-foreground transition-colors">{footer.links.about}</DocLink>
          <span>© {new Date().getFullYear()} Medialane</span>
        </div>
      </footer>
    </div>
  );
}
