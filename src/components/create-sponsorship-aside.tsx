"use client";

import { Handshake, ShieldCheck, Coins, Gift } from "lucide-react";
import { ClaimRail } from "./claim-rail.js";
import { useT } from "../i18n/provider.js";

export function CreateSponsorshipAside() {
  const t = useT();
  return (
    <ClaimRail
      included={[
        { icon: Handshake, title: t("Direct settlement"), desc: t("The sponsor pays directly.") },
        { icon: ShieldCheck, title: t("Owner-verified"), desc: t("For assets you own.") },
        { icon: Coins, title: t("Open bidding"), desc: t("Open to any sponsor.") },
      ]}
      steps={[
        t("Choose the terms"),
        t("The other side responds"),
        t("License and payment settle instantly"),
      ]}
      trustIcon={Gift}
      trustLead={t("Direct settlement.")}
      trust={t("Funds go from sponsor to author.")}
    />
  );
}
