"use client";

import { Handshake, ShieldCheck, Coins, Gift } from "lucide-react";
import { ClaimRail } from "./claim-rail.js";
import { useT } from "../i18n/provider.js";

export function CreateSponsorshipAside() {
  const t = useT();
  return (
    <ClaimRail
      included={[
        { icon: Handshake, title: t("Direct settlement"), desc: t("Sponsor pays you directly — no escrow, no middleman.") },
        { icon: ShieldCheck, title: t("Owner-verified"), desc: t("You must own the asset, checked on-chain when you create and when you accept.") },
        { icon: Coins, title: t("Open bidding"), desc: t("Any sponsor can bid, or invite one specific sponsor.") },
      ]}
      steps={[
        t("Choose your terms — an asset you own, or one you'd like to sponsor"),
        t("The other side responds — bids come in, or a proposal is accepted"),
        t("Settle instantly: they receive a license, you receive payment"),
      ]}
      trustIcon={Gift}
      trustLead={t("No escrow, ever.")}
      trust={t("The contract never holds funds — settlement is direct, sponsor to author.")}
    />
  );
}
