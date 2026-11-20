"use client";

import type { ElementType } from "react";
import { CalendarX2, CheckCircle2, Clock, Infinity as InfinityIcon, Ticket, Users } from "lucide-react";
import { useIsMemberOf, useMembershipOnchain, useTicketOnchain, type TierOnchain } from "../utils/use-tiers.js";
import { useMedialaneApp } from "./medialane-app.js";
import { cn } from "../utils/cn.js";
import { useT } from "../i18n/provider.js";
import { Panel, Pill } from "./panel.js";
import type { T } from "../i18n/make-t.js";
import { useFormat, type Format } from "../i18n/use-format.js";

type TierStatus = "upcoming" | "active" | "ended" | "always";

function tierStatus(t: TierOnchain): TierStatus {
  if (t.startTime == null && t.endTime == null) return "always";
  const now = Date.now() / 1000;
  if (t.startTime != null && now < t.startTime) return "upcoming";
  if (t.endTime != null && now >= t.endTime) return "ended";
  return "active";
}

const STYLED = { dateStyle: "medium", timeStyle: "short" } as const;

function windowLabel(tier: TierOnchain, t: T, intl: Format): string | null {
  const when = (ts: number) => intl.dateTime(ts * 1000, STYLED);
  if (tier.startTime != null && tier.endTime != null) return t("{from} – {until}", { from: when(tier.startTime), until: when(tier.endTime) });
  if (tier.startTime != null) return t("From {date}", { date: when(tier.startTime) });
  if (tier.endTime != null) return t("Until {date}", { date: when(tier.endTime) });
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
  labels: Partial<Record<TierStatus, string>>;
  footer?: React.ReactNode;
}) {
  const t = useT();
  const intl = useFormat();
  const status = tierStatus(tier);
  const window = windowLabel(tier, t, intl);
  const StatusIcon = STATUS_ICON[status];
  return (
    <Panel className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", iconClassName)} />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {labels[status] ? (
          <Pill color={status === "upcoming" || status === "ended" ? undefined : "blue"}>
            <StatusIcon className="h-3.5 w-3.5" />
            {labels[status]}
          </Pill>
        ) : null}
      </div>
      {window ? <p className="text-sm text-muted-foreground">{window}</p> : null}
      {footer}
    </Panel>
  );
}

export interface AssetTypePanelProps {
  contract: string;
  tokenId: string;
  quantityOwned?: string;
}

export function TicketPanel({ contract, tokenId }: AssetTypePanelProps) {
  const t = useT();
  const { ticket } = useTicketOnchain(contract, tokenId);
  if (!ticket) return null;
  return (
    <TierPanel
      tier={ticket}
      icon={Ticket}
      iconClassName="text-brand-blue"
      title={t("Ticket")}
      labels={{ upcoming: "Upcoming", active: t("Happening now"), ended: "Ended" }}
    />
  );
}

export function MembershipPanel({ contract, tokenId, quantityOwned }: AssetTypePanelProps) {
  const t = useT();
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
      title={t("Membership")}
      labels={{ upcoming: "Upcoming", active: "Active", ended: "Ended", always: "Lifetime" }}
      footer={cards > 0 ? (
        <div className="flex items-center gap-2 border-t border-border/60 pt-3">
          {isMember ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-brand-blue" />
              <p className="text-sm font-medium">{t("Active member · {cardLabel}", { cardLabel })}</p>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{status === "upcoming" ? t("Starts soon") : t("Ended")} · {cardLabel}</p>
            </>
          )}
        </div>
      ) : null}
    />
  );
}
