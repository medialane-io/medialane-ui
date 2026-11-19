"use client";

import { Award } from "lucide-react";
import { buildCollectionMetadata } from "@medialane/sdk";
import { executeIntent } from "@medialane/sdk/starknet";
import { Input } from "../../input.js";
import { getMintFormatCopy } from "../../../data/launchpad-services.js";
import { cn } from "../../../utils/cn.js";
import { uploadJsonToIpfs } from "../../../utils/ipfs-upload.js";
import { getDefaultClaimWindow } from "../../../utils/launchpad-defaults.js";
import { isSymbol } from "../../../utils/launchpad-rules.js";
import { claimEndTimestamp, popEventAttributes, popEventIntent } from "../../../utils/launchpad-actions.js";
import { EVENT_TYPES, type PopEventType } from "../../launchpad/pop-create-fields.js";
import { defineFormat, type FormatFieldsProps } from "./types.js";
import { useT } from "../../../i18n/provider.js";
import { msg } from "../../../i18n/translate.js";

interface PopState {
  eventType: PopEventType;
  isPublic: boolean;
  claimEndDate: string;
  claimEndTime: string;
}

function PopFields({ shared, state, update }: FormatFieldsProps<PopState>) {
  const t = useT();
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("What kind of event is this?")}</label>
        <div className="grid grid-cols-4 gap-2">
          {EVENT_TYPES.map(({ value, label, icon: Icon }) => {
            const selected = state.eventType === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ eventType: value })}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all",
                  selected
                    ? "border-brand-blue bg-brand-blue/5 text-brand-blue"
                    : "border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-2xs font-semibold leading-tight">{t(label)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="fast-mint-symbol">{t("Symbol *")}</label>
        <Input
          id="fast-mint-symbol"
          value={shared.draft.symbol}
          onChange={(e) => shared.draft.setSymbol(e.target.value.toUpperCase())}
          placeholder={t("SKHACK")}
          className="max-w-[160px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("Claim window closes *")}</label>
        <div className="flex gap-2 items-center">
          <Input type="date" aria-label={t("Claim window closing date")} value={state.claimEndDate} onChange={(e) => update({ claimEndDate: e.target.value })} className="flex-1" />
          <Input type="time" aria-label={t("Claim window closing time")} value={state.claimEndTime} onChange={(e) => update({ claimEndTime: e.target.value })} className="w-28" />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{t("Event visibility")}</p>
          <p className="text-xs text-muted-foreground">
            {state.isPublic ? t("Listed publicly on the POP launchpad") : t("Only accessible via direct link")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-label={t("Event visibility")}
          aria-checked={state.isPublic}
          onClick={() => update({ isPublic: !state.isPublic })}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state.isPublic ? "bg-brand-blue" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
              state.isPublic ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>
    </>
  );
}

export const POP_FORMAT = defineFormat<PopState>({
  key: "pop",
  title: getMintFormatCopy("pop-protocol").name,
  hint: getMintFormatCopy("pop-protocol").hint,
  icon: Award,
  submitLabel: () => msg("Create certificate"),
  initial: () => ({ eventType: "Conference", isPublic: false, ...getDefaultClaimWindow() }),
  Fields: PopFields,
  isReady: (shared, state) =>
    isSymbol(shared.draft.symbol) &&
    !!state.claimEndDate &&
    claimEndTimestamp(state.claimEndDate, state.claimEndTime || "23:59") * 1000 > Date.now(),
  previewLabel: (shared) => shared.draft.symbol || "POP",
  submit: async (shared, state, runtime) => {
    const { client, signer, onStep } = runtime;
    const values = shared.form.getValues();
    const uploadToken = await runtime.getUploadToken();
    if (!uploadToken) throw new Error("Sign in first");

    onStep({ label: msg("Creating"), index: 1, total: 1 });
    const baseUri = await uploadJsonToIpfs(client.api, {
      ...buildCollectionMetadata({
        name: values.name,
        description: values.description,
        image: shared.image,
        externalLink: values.external_url,
        owner: shared.walletAddress,
      }),
      attributes: popEventAttributes(state.eventType, state.isPublic),
    });
    const intent = await popEventIntent(client.api, {
      owner: shared.walletAddress,
      name: values.name,
      symbol: shared.draft.symbol,
      baseUri,
      claimEndTimestamp: claimEndTimestamp(state.claimEndDate, state.claimEndTime || "23:59"),
    });
    await executeIntent(signer, client, intent);

    return {
      headline: msg("Certificate created"),
      detail: msg("It is recorded onchain with your wallet as owner."),
      name: values.name,
      links: [{ href: "/launchpad/pop", label: msg("Open POP"), icon: Award }],
      reward: "launch_launchpad",
    };
  },
});
