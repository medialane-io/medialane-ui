"use client";

import dynamic from "next/dynamic";
import { CurrencyIcon } from "./currency-icon.js";
import { RemixesTab } from "./remixes-tab.js";
import { CreationRecord } from "./creation-record.js";
import { formatDisplayPrice } from "../utils/format.js";
import { timeAgo } from "../utils/time.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import {
  ShoppingCart, Tag, HandCoins, ArrowRightLeft, X, CheckCircle,
  TrendingUp, Activity, ArrowRight, ExternalLink, Fingerprint, UserCheck,
} from "lucide-react";
import type { ApiActivity } from "@medialane/sdk";
import { useT } from "../i18n/provider.js";
import { ACTIVITY_TYPE_CONFIG } from "../data/activity.js";
import { Panel } from "./panel.js";
import { msg } from "../i18n/translate.js";
import { useFormat } from "../i18n/use-format.js";

const PriceHistoryChart = dynamic(
  () => import("./price-history-chart.js").then((m) => m.PriceHistoryChart),
  {
    ssr: false,
    loading: () => <div className="h-48 w-full animate-pulse rounded-xl bg-muted/40" />,
  },
);

const tint = (type: keyof typeof ACTIVITY_TYPE_CONFIG) => `${ACTIVITY_TYPE_CONFIG[type].bgClass} ${ACTIVITY_TYPE_CONFIG[type].colorClass}`;

const EVENT_STYLE: Record<string, { label: string; icon: React.ReactNode; badgeCls: string }> = {
  sale:      { label: msg("Sale"),      icon: <ShoppingCart className="h-3.5 w-3.5" />,   badgeCls: tint("sale") },
  mint:      { label: msg("Minted"),    icon: <CheckCircle className="h-3.5 w-3.5" />,    badgeCls: tint("mint") },
  listing:   { label: msg("Listed"),    icon: <Tag className="h-3.5 w-3.5" />,            badgeCls: tint("listing") },
  offer:     { label: msg("Offer"),     icon: <HandCoins className="h-3.5 w-3.5" />,      badgeCls: tint("offer") },
  transfer:  { label: msg("Transfer"),  icon: <ArrowRightLeft className="h-3.5 w-3.5" />, badgeCls: tint("transfer") },
  cancelled: { label: msg("Cancelled"), icon: <X className="h-3.5 w-3.5" />,              badgeCls: tint("cancelled") },
};

interface AssetProvenanceTabProps {
  history: ApiActivity[];
  contract: string;
  tokenId: string;
  remixCount: number;
  originalCreator?: string;
  registeredAt?: number;
}

export function AssetProvenanceTab({
  history,
  contract,
  tokenId,
  remixCount,
  originalCreator,
  registeredAt,
}: AssetProvenanceTabProps) {
  const intl = useFormat();
  const t = useT();
  const sales = history.filter((e) => e.type === "sale");

  const totalVolumeParts = sales.reduce<Record<string, { amount: number; currency: string }>>((acc, e) => {
    if (!e.price?.formatted || !e.price.currency) return acc;
    const key = e.price.currency;
    const parsed = parseFloat(e.price.formatted.replace(/,/g, ""));
    if (!isNaN(parsed)) {
      acc[key] = { amount: (acc[key]?.amount ?? 0) + parsed, currency: key };
    }
    return acc;
  }, {});
  const volumeSummary = Object.values(totalVolumeParts);

  const allActors = new Set(
    history.flatMap((e) => [e.offerer, e.fulfiller, e.from].filter(Boolean))
  );
  const firstEvent = history[history.length - 1];

  return (
    <div className="mt-4 space-y-6">

      <Panel tone={["blue", "purple"]} className="flex items-center gap-2 px-4 py-2.5">
        <Fingerprint className="h-4 w-4 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">{t("Onchain provenance")}</p>
          <p className="text-xs text-muted-foreground">{t("Every transfer and sale is immutably recorded on Starknet — this history cannot be altered.")}</p>
        </div>
        <a
          href={`${EXPLORER_URL}/contract/${contract}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          {t("Contract")} <ExternalLink className="h-3 w-3" />
        </a>
      </Panel>

      {originalCreator && registeredAt ? (
        <CreationRecord originalCreator={originalCreator} registeredAt={registeredAt} />
      ) : null}

      {history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-muted/20 p-3 text-center">
            <Activity className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{history.length}</p>
            <p className="text-2xs text-muted-foreground">{t("Events")}</p>
          </div>
          <div className="rounded-xl bg-muted/20 p-3 text-center">
            <ShoppingCart className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{sales.length}</p>
            <p className="text-2xs text-muted-foreground">{t("Sales")}</p>
          </div>
          <div className="rounded-xl bg-muted/20 p-3 text-center">
            <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            {volumeSummary.length > 0 ? (
              <div className="space-y-0.5">
                {volumeSummary.map((v) => (
                  <p key={v.currency} className="text-sm font-bold leading-tight">
                    {v.amount.toFixed(v.amount < 1 ? 4 : 2)} {v.currency}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-lg font-bold">—</p>
            )}
            <p className="text-2xs text-muted-foreground">{t("Volume")}</p>
          </div>
          <div className="rounded-xl bg-muted/20 p-3 text-center">
            <UserCheck className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{allActors.size}</p>
            <p className="text-2xs text-muted-foreground">{t("Participants")}</p>
          </div>
        </div>
      )}

      {remixCount > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">{t("Remixes ({remixCount})", { remixCount })}</p>
          <RemixesTab contractAddress={contract} tokenId={tokenId} />
        </div>
      )}

      <PriceHistoryChart history={history} />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {t("History")}
          {firstEvent && (
            <span className="ml-2 font-normal normal-case">{t("· first activity {timeAgo}", { timeAgo: timeAgo(firstEvent.timestamp) })}
            </span>
          )}
        </p>

        {history.length === 0 ? (
          <div className="rounded-xl bg-muted/10 py-12 flex flex-col items-center gap-3 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("No activity recorded yet.")}</p>
          </div>
        ) : (
          <div className="relative">

            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border/60" />

            <div className="space-y-1">
              {history.map((event, i) => {
                const style = EVENT_STYLE[event.type] ?? {
                  label: event.type,
                  icon: <Activity className="h-3.5 w-3.5" />,
                  badgeCls: "bg-muted/60 text-muted-foreground",
                };
                const actor = event.offerer ?? event.from ?? "";
                const toAddr = event.to;
                const counterpart = event.fulfiller && event.fulfiller !== actor
                  ? event.fulfiller
                  : (event.type === "transfer" || event.type === "mint") && toAddr
                  ? toAddr
                  : null;
                const amount = event.amount;
                const txLink = event.txHash ? `${EXPLORER_URL}/tx/${event.txHash}` : null;
                const voyagerActor = actor ? `${EXPLORER_URL}/contract/${actor}` : null;

                return (
                  <div key={i} className="relative flex gap-4 group">

                    <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${style.badgeCls}`}>
                      {style.icon}
                    </div>

                    <Panel
                      className={`flex-1 min-w-0 px-3 py-2.5 transition-colors group-hover:bg-background/40 ${txLink ? "cursor-pointer" : ""}`}
                      onClick={() => txLink && window.open(txLink, "_blank", "noopener,noreferrer")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${style.badgeCls}`}>
                              {style.icon}
                              {t(style.label)}
                            </span>
                            {actor && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                {voyagerActor ? (
                                  <a
                                    href={voyagerActor}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="hover:text-foreground transition-colors tabular-nums"
                                  >
                                    {actor.slice(0, 6)}…{actor.slice(-4)}
                                  </a>
                                ) : (
                                  <span className="tabular-nums">{actor.slice(0, 6)}…{actor.slice(-4)}</span>
                                )}
                              </span>
                            )}
                            {counterpart && (
                              <>
                                <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                <a
                                  href={`${EXPLORER_URL}/contract/${counterpart}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors tabular-nums"
                                >
                                  {counterpart.slice(0, 6)}…{counterpart.slice(-4)}
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {amount && BigInt(amount) > 1n && (
                            <span className="text-2xs text-muted-foreground tabular-nums bg-muted/60 px-1.5 py-0.5 rounded-full">
                              ×{amount}
                            </span>
                          )}
                          {event.price?.formatted && (
                            <span className="text-sm font-bold inline-flex items-center gap-1">
                              {formatDisplayPrice(event.price.formatted)}
                              <CurrencyIcon symbol={event.price.currency ?? ""} size={13} />
                            </span>
                          )}
                          <span
                            className="text-2xs text-muted-foreground/60 whitespace-nowrap"
                            title={intl.dateTime(new Date(event.timestamp))}
                          >
                            {timeAgo(event.timestamp)}
                          </span>
                          {txLink && (
                            <a
                              href={txLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                              title={t("View transaction")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Panel>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
