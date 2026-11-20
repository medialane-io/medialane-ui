"use client";

import Image from "./image.js";
import { TrendingUp } from "lucide-react";
import { cn } from "../utils/cn.js";
import { CurrencyIcon } from "./currency-icon.js";
import { useT } from "../i18n/provider.js";
import { useFormat } from "../i18n/use-format.js";

export interface CoinPreviewData {
  name: string;
  symbol: string;
  description: string;

  imageUrl: string | null;

  supplyHuman: number | null;
  price: number;
  quoteSymbol: string;
  teamPct: number;
}

const COIN_GRADIENT = "linear-gradient(135deg, hsl(var(--brand-orange)), hsl(var(--brand-maeve)))";

function StatValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold tabular-nums text-brand-maeve">
      {children}
    </span>
  );
}

export function CoinLaunchPreview({ data, className }: { data: CoinPreviewData; className?: string }) {
  const intl = useFormat();
  const t = useT();
  const { name, symbol, description, imageUrl, supplyHuman, price, quoteSymbol, teamPct } = data;
  const marketCap = supplyHuman != null ? supplyHuman * price : null;
  const yourCoins = supplyHuman != null ? supplyHuman * (teamPct / 100) : null;

  return (
    <div className={cn("rounded-2xl bg-muted/50 dark:bg-card overflow-hidden", className)}>
      <div className="px-5 pt-4">
        <p className="section-label">{t("Live preview")}</p>
      </div>

      <div className="p-5 space-y-4">

        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-full p-[2px]" style={{ background: COIN_GRADIENT }}>
            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-card flex items-center justify-center">
              {imageUrl ? (
                <Image src={imageUrl} alt="" fill sizes="56px" className="object-cover" unoptimized />
              ) : (
                <TrendingUp className="h-6 w-6 text-brand-orange/70" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("font-bold text-lg leading-snug truncate", !name && "text-muted-foreground/50")}>
              {name || t("Your coin")}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">{symbol ? `$${symbol}` : t("$SYMBOL")}</p>
          </div>
        </div>

        {description ? (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
        ) : null}

        <div className="rounded-xl bg-muted/50 dark:bg-muted/30 p-4 space-y-3">
          <div>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">{t("Market cap")}</p>
            <p className="text-2xl">
              {marketCap != null ? (
                <StatValue>
                  <CurrencyIcon symbol={quoteSymbol} size={18} />
                  {intl.number(marketCap)} {quoteSymbol}
                </StatValue>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </p>
          </div>
          <div className="flex items-center justify-between text-sm border-t border-border/60 pt-3">
            <span className="text-muted-foreground">{t("Launch price")}</span>
            <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
              <CurrencyIcon symbol={quoteSymbol} size={14} />
              {t("{price} {quoteSymbol} / coin", { price, quoteSymbol })}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-brand-orange">
              {t("You keep")} {teamPct}%{yourCoins != null ? ` · ${intl.number(yourCoins)} ${symbol || "coins"}` : ""}
            </span>
            <span className="text-muted-foreground">{t("Community")} {100 - teamPct}%</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted-foreground/15">
            {teamPct > 0 && <div style={{ width: `${teamPct}%`, background: COIN_GRADIENT }} />}
            <div className="flex-1" />
          </div>
        </div>

        <p className="text-2xs text-muted-foreground/70">
          {t("Liquidity locks permanently at launch.")}
        </p>
      </div>
    </div>
  );
}
