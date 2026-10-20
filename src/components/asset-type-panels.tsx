"use client";

import type { ElementType } from "react";
import { CalendarX2, CheckCircle2, Clock, Infinity as InfinityIcon, Ticket, Users } from "lucide-react";
import { useIsMemberOf, useMembershipOnchain, useTicketOnchain, type TierOnchain } from "../utils/use-tiers.js";
import { useMedialaneApp } from "./medialane-app.js";
import { cn } from "../utils/cn.js";

type TierStatus = "upcoming" | "active" | "ended" | "always";

const ON = "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30";
const OFF = "bg-muted text-muted-foreground border-border";

function tierStatus(t: TierOnchain): TierStatus {
  if (t.startTime == null && t.endTime == null) return "always";
  const now = Date.now() / 1000;
  if (t.startTime != null && now < t.startTime) return "upcoming";
  if (t.endTime != null && now >= t.endTime) return "ended";
  return "active";
}

const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function windowLabel(t: TierOnchain): string | null {
  if (t.startTime != null && t.endTime != null) return `Valid from ${fmtDate(t.startTime)} to ${fmtDate(t.endTime)}`;
  if (t.startTime != null) return `Valid from ${fmtDate(t.startTime)}`;
  if (t.endTime != null) return `Valid until ${fmtDate(t.endTime)}`;
  return null;
}

const STATUS_ICON: Record<TierStatus, ElementType> = { upcoming: Clock, active: CheckCircle2, ended: CalendarX2, always: InfinityIcon };

function TierPanel({
  tier,
  icon: Icon,
  iconClassName,
  title,
  labels,
  footer,
}: {
  tier: TierOnchain;
  icon: ElementType;
  iconClassName: string;
  title: string;
  labels: Record<TierStatus, string>;
  footer?: React.ReactNode;
}) {
  const status = tierStatus(tier);
  const window = windowLabel(tier);
  const StatusIcon = STATUS_ICON[status];
  return (
    <div className="rounded-2xl bg-gradient-to-br from-muted/40 to-transparent p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", iconClassName)} />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", status === "upcoming" || status === "ended" ? OFF : ON)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {labels[status]}
        </span>
      </div>
      {window ? <p className="text-sm text-muted-foreground">{window}</p> : null}
      <div className="flex gap-8">
        <div>
          <p className="text-xs text-muted-foreground">Quantity</p>
          <p className="text-sm font-semibold tabular-nums">{tier.maxSupply.toString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Royalty</p>
          <p className="text-sm font-semibold tabular-nums">{(tier.royaltyBps / 100).toFixed(1)}%</p>
        </div>
      </div>
      {footer}
    </div>
  );
}

export interface AssetTypePanelProps {
  contract: string;
  tokenId: string;
  quantityOwned?: string;
}

export function TicketPanel({ contract, tokenId }: AssetTypePanelProps) {
  const { ticket } = useTicketOnchain(contract, tokenId);
  if (!ticket) return null;
  return (
    <TierPanel
      tier={ticket}
      icon={Ticket}
      iconClassName="text-brand-blue"
      title="Ticket"
      labels={{ upcoming: "Upcoming", active: "Valid now", ended: "Ended", always: "Always valid" }}
    />
  );
}

export function MembershipPanel({ contract, tokenId, quantityOwned }: AssetTypePanelProps) {
  const { walletAddress } = useMedialaneApp();
  const { membership } = useMembershipOnchain(contract, tokenId);
  const { isMember } = useIsMemberOf(contract, tokenId, walletAddress);
  if (!membership) return null;
  const cards = quantityOwned ? Number(quantityOwned) : 0;
  const status = tierStatus(membership);
  const cardLabel = `${cards} card${cards > 1 ? "s" : ""}`;
  return (
    <TierPanel
      tier={membership}
      icon={Users}
      iconClassName="text-brand-purple"
      title="Membership"
      labels={{ upcoming: "Upcoming", active: "Active", ended: "Ended", always: "Lifetime" }}
      footer={cards > 0 ? (
        <div className="flex items-center gap-2 border-t border-border/60 pt-3">
          {isMember ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              <p className="text-sm font-medium">Active member · {cardLabel}</p>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{status === "upcoming" ? "Not yet valid" : "Membership ended"} · {cardLabel}</p>
            </>
          )}
        </div>
      ) : null}
    />
  );
}
