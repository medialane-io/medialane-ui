"use client";

import { Eye, Ticket, Users } from "lucide-react";
import { buildCollectionMetadata, collectionHref, getService } from "@medialane/sdk";
import { deployedCollectionFromReceipt, executeIntent, executeIntents } from "@medialane/sdk/starknet";
import { Input } from "../../input.js";
import { getMintFormatCopy } from "../../../data/launchpad-services.js";
import { pinAssetMetadata, uploadJsonToIpfs } from "../../../utils/ipfs-upload.js";
import { isPositiveInteger } from "../../../utils/launchpad-rules.js";
import { dateToUnixTimestamp, serviceCollectionIntent, tierIntents, tierTraits } from "../../../utils/launchpad-actions.js";
import { CLUB_TIER_PRESET, TICKETS_TIER_PRESET, type TierMintPreset } from "../../launchpad/tier-mint-presets.js";
import { CollectionSection, type CollectionMode } from "../collection-section.js";
import { LicensingSection } from "../licensing-section.js";
import { createThenAdd } from "../create-then-add.js";
import { defineFormat, type FormatFieldsProps, type FormatShared } from "./types.js";
import { useT } from "../../../i18n/provider.js";
import { msg } from "../../../i18n/translate.js";

interface TierState {
  mode: CollectionMode;
  existingContract: string;
  supply: string;
  startDate: string;
  endDate: string;
}

interface TierText {
  collectionLabel: string;
  newCollection: string;
  creating: string;
  adding: string;
  unfinished: string;
  unreadable: string;
}

function makeTierFormat(config: {
  key: "tickets" | "club";
  service: string;
  preset: TierMintPreset;
  icon: typeof Ticket;
  supplyLabel: string;
  submitLabel: string;
  text: TierText;
}) {
  const { preset, text } = config;
  const copy = getMintFormatCopy(config.service);

  const ownCollections = (shared: FormatShared) =>
    shared.collections.filter((c) => getService(c.service)?.id === preset.service && !!c.contractAddress);

  function Fields({ shared, state, update }: FormatFieldsProps<TierState>) {
  const t = useT();
    return (
      <>
        <CollectionSection
          label={text.collectionLabel}
          mode={state.mode}
          onModeChange={(mode) => update({ mode })}
          collections={ownCollections(shared)}
          value={state.existingContract}
          onValue={(existingContract) => update({ existingContract })}
          valueOf={(c) => c.contractAddress}
          draft={shared.draft}
          previewImage={shared.previewImage}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`fast-mint-${config.key}-supply`}>{t(config.supplyLabel)}</label>
          <Input
            id={`fast-mint-${config.key}-supply`}
            type="number"
            min={1}
            value={state.supply}
            onChange={(e) => update({ supply: e.target.value })}
            className="max-w-[160px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("Valid")}</label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" aria-label={t("Valid from")} value={state.startDate} onChange={(e) => update({ startDate: e.target.value })} />
            <Input type="date" aria-label={t("Valid until")} value={state.endDate} onChange={(e) => update({ endDate: e.target.value })} />
          </div>
          <p className="text-xs text-muted-foreground">{t(preset.copy.validUntilHint)}</p>
        </div>

        <LicensingSection form={shared.form} />
      </>
    );
  }

  return defineFormat<TierState>({
    key: config.key,
    title: copy.name,
    hint: copy.hint,
    icon: config.icon,
    submitLabel: () => config.submitLabel,
    initial: () => ({ mode: "existing", existingContract: "", supply: "100", startDate: "", endDate: "" }),
    Fields,
    isReady: (shared, state) => {
      if (!isPositiveInteger(state.supply)) return false;
      if (state.mode === "new") return shared.draft.name.trim().length > 0 && shared.draft.symbol.trim().length > 0;
      return state.existingContract !== "";
    },
    previewLabel: (shared, state, t) =>
      state.mode === "new"
        ? shared.draft.name || t(text.newCollection)
        : ownCollections(shared).find((c) => c.contractAddress === state.existingContract)?.name || undefined,
    submit: async (shared, state, runtime) => {
      const { client, signer, onStep } = runtime;
      const owner = shared.walletAddress;
      const values = shared.form.getValues();
      const supply = state.supply.trim();

      const uploadToken = await runtime.getUploadToken();
      if (!uploadToken) throw new Error(msg("Sign in first"));

      const existing = (runtime.resume as string | null) ?? (state.mode === "existing" && state.existingContract ? state.existingContract : null);

      const contract = await createThenAdd<string, string>({
        existing,
        unfinished: text.unfinished,
        labels: { create: text.creating, add: text.adding },
        onStep,
        create: async () => {
          const baseUri = await uploadJsonToIpfs(
            client.api,
            buildCollectionMetadata({
              name: shared.draft.name,
              description: shared.draft.description,
              image: shared.image,
              externalLink: values.external_url,
              owner,
            }),
          );
          const created = await serviceCollectionIntent(client.api, {
            owner,
            name: shared.draft.name,
            symbol: shared.draft.symbol,
            baseUri,
            service: preset.service,
          });
          const { receipt } = await executeIntent(signer, client, created);
          const deployed = deployedCollectionFromReceipt(receipt, preset.service);
          if (!deployed) throw new Error(text.unreadable);
          return deployed;
        },
        add: async (address) => {
          const pinned = await pinAssetMetadata(client.api, {
            name: values.name,
            description: values.description,
            imageUri: shared.image,
            externalUrl: values.external_url,
            ipType: "NFT",
            licenseType: values.licenseType,
            commercialUse: values.commercialUse,
            derivatives: values.derivatives,
            attribution: values.attribution,
            geographicScope: values.geographicScope,
            aiPolicy: values.aiPolicy,
            royalty: String(values.royalty),
            creator: owner,
            templateTraits: tierTraits(preset.traitType, supply, address),
          });
          const intents = await tierIntents(client.api, {
            owner,
            contract: address,
            service: preset.service,
            tierId: await preset.predictNextId(client.api, address),
            maxSupply: supply,
            startTime: dateToUnixTimestamp(state.startDate),
            endTime: dateToUnixTimestamp(state.endDate),
            royaltyBps: Math.round(values.royalty * 100),
            metadataUri: pinned.uri,
          });
          await executeIntents(signer, client, intents);
          return address;
        },
      });

      return {
        headline: preset.success.title,
        detail: preset.success.description,
        name: values.name,
        collectionLabel: ownCollections(shared).find((c) => c.contractAddress === contract)?.name || (state.mode === "new" ? shared.draft.name : undefined),
        links: [{ href: collectionHref("STARKNET", contract), label: msg("View collection"), icon: Eye }],
        reward: "launch_launchpad",
      };
    },
  });
}

export const TICKETS_FORMAT = makeTierFormat({
  key: "tickets",
  preset: TICKETS_TIER_PRESET,
  service: "ip-tickets",
  icon: Ticket,
  supplyLabel: msg("Number of tickets"),
  submitLabel: msg("Create tickets"),
  text: {
    collectionLabel: msg("Ticket collection"),
    newCollection: msg("New ticket collection"),
    creating: msg("Creating the ticket collection"),
    adding: msg("Publishing tickets"),
    unfinished: msg("Your ticket collection was created, but the last step did not finish."),
    unreadable: msg("The ticket collection was created, but its address couldn't be read — check My Collections."),
  },
});

export const CLUB_FORMAT = makeTierFormat({
  key: "club",
  preset: CLUB_TIER_PRESET,
  service: "ip-club",
  icon: Users,
  supplyLabel: msg("Number of memberships"),
  submitLabel: msg("Create membership"),
  text: {
    collectionLabel: msg("Club"),
    newCollection: msg("New club"),
    creating: msg("Creating the club"),
    adding: msg("Publishing memberships"),
    unfinished: msg("Your club was created, but the last step did not finish."),
    unreadable: msg("The club was created, but its address couldn't be read — check My Collections."),
  },
});
