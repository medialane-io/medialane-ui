"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface CoinGuaranteesData {
  isLaunched: boolean;
  launchedAtBlock: number | null;
  totalSupplyRaw: string;
  teamAllocationRaw: string;
  teamAllocationPercent: number | null;
  liquidityPositionId: string | null;
}

export interface CoinGuaranteesProps {
  data: CoinGuaranteesData | null;
  isLoading?: boolean;
  decimals?: number;
  maxTeamAllocationPercent: number;

  contractUrl?: string;
  liquidityUrl?: string;
  blockUrl?: string;
  className?: string;
}

function whole(raw: string, decimals: number): number | null {
  try {
    const units = BigInt(raw);
    if (units <= 0n) return null;
    const v = Number(units) / 10 ** decimals;
    return isFinite(v) && v >= 1 ? v : null;
  } catch {
    return null;
  }
}

const compact = (n: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(n);

function Line({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string;
  detail?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
      {href && <ExternalLink className="h-3 w-3 text-muted-foreground/60" />}
    </>
  );

  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 py-2.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-baseline gap-1.5 transition-colors hover:text-primary active:opacity-70"
        >
          {body}
        </a>
      ) : (
        <span className="inline-flex items-baseline gap-1.5">{body}</span>
      )}
    </div>
  );
}

export function CoinGuarantees({
  data,
  isLoading,
  decimals = 18,
  maxTeamAllocationPercent,
  contractUrl,
  liquidityUrl,
  blockUrl,
  className,
}: CoinGuaranteesProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-2.5", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded bg-muted-foreground/10" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const supply = whole(data.totalSupplyRaw, decimals);
  const allocation = whole(data.teamAllocationRaw, decimals);
  const pct = data.teamAllocationPercent;

  return (
    <div className={className}>
      <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        Guaranteed by the contract
      </p>

      <Line
        label="Creator allocation"
        value={pct != null ? `${pct}%` : allocation != null ? compact(allocation) : "—"}
        detail={`capped at ${maxTeamAllocationPercent}%`}
        href={contractUrl}
      />

      <Line
        label="Total supply"
        value={supply != null ? compact(supply) : "—"}
        detail="fixed, cannot be increased"
        href={contractUrl}
      />

      {data.isLaunched ? (
        <Line
          label="Liquidity"
          value="Locked permanently"
          detail={data.liquidityPositionId ? `position #${data.liquidityPositionId}` : undefined}
          href={liquidityUrl}
        />
      ) : (
        <Line label="Liquidity" value="Not launched yet" />
      )}

      {data.launchedAtBlock != null && (
        <Line
          label="Launched"
          value={`Block ${data.launchedAtBlock.toLocaleString()}`}
          href={blockUrl}
        />
      )}
    </div>
  );
}
