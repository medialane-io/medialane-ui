"use client";

import { Eye, Ticket, Users } from "lucide-react";
import { buildCollectionMetadata, collectionHref, getService } from "@medialane/sdk";
import { deployedCollectionFromReceipt, executeIntent, executeIntents } from "@medialane/sdk/starknet";
import { Input } from "../../input.js";
import { pinAssetMetadata, uploadJsonToIpfs } from "../../../utils/ipfs-upload.js";
import { dateToUnixTimestamp, serviceCollectionIntent, tierIntents, tierTraits } from "../../../utils/launchpad-actions.js";
import { CLUB_TIER_PRESET, TICKETS_TIER_PRESET, type TierMintPreset } from "../../launchpad/tier-mint-presets.js";
import { CollectionSection, type CollectionMode } from "../collection-section.js";
import { LicensingSection } from "../licensing-section.js";
import { createThenAdd } from "../create-then-add.js";
import { defineFormat, type FormatFieldsProps, type FormatShared } from "./types.js";

interface TierState {
  mode: CollectionMode;
  existingContract: string;
  supply: string;
  startDate: string;
  endDate: string;
}

const SUPPLY_PATTERN = /^[1-9]\d*$/;

function makeTierFormat(config: {
  key: "tickets" | "club";
  preset: TierMintPreset;
  title: string;
  hint: string;
  icon: typeof Ticket;
  noun: string;
  supplyLabel: string;
  submitLabel: string;
  addLabel: string;
}) {
  const { preset, noun } = config;

  const ownCollections = (shared: FormatShared) =>
    shared.collections.filter((c) => getService(c.service)?.id === preset.service && !!c.contractAddress);

  function Fields({ shared, state, update }: FormatFieldsProps<TierState>) {
    return (
      <>
        <CollectionSection
          noun={noun}
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
          <label className="text-sm font-medium" htmlFor={`fast-mint-${config.key}-supply`}>{config.supplyLabel} *</label>
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
          <label className="text-sm font-medium">Valid</label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" aria-label="Valid from" value={state.startDate} onChange={(e) => update({ startDate: e.target.value })} />
            <Input type="date" aria-label="Valid until" value={state.endDate} onChange={(e) => update({ endDate: e.target.value })} />
          </div>
          <p className="text-xs text-muted-foreground">{preset.copy.validUntilHint}</p>
        </div>

        <LicensingSection form={shared.form} />
      </>
    );
  }

  return defineFormat<TierState>({
    key: config.key,
    title: config.title,
    hint: config.hint,
    icon: config.icon,
    submitLabel: () => config.submitLabel,
    initial: () => ({ mode: "existing", existingContract: "", supply: "100", startDate: "", endDate: "" }),
    Fields,
    isReady: (shared, state) => {
      if (!SUPPLY_PATTERN.test(state.supply.trim())) return false;
      if (state.mode === "new") return shared.draft.name.trim().length > 0 && shared.draft.symbol.trim().length > 0;
      return state.existingContract !== "";
    },
    previewLabel: (shared, state) =>
      state.mode === "new"
        ? shared.draft.name || `New ${noun}`
        : ownCollections(shared).find((c) => c.contractAddress === state.existingContract)?.name || undefined,
    submit: async (shared, state, runtime) => {
      const { client, signer, onStep } = runtime;
      const owner = shared.walletAddress;
      const values = shared.form.getValues();
      const supply = state.supply.trim();

      const uploadToken = await runtime.getUploadToken();
      if (!uploadToken) throw new Error("Sign in first");

      const existing = (runtime.resume as string | null) ?? (state.mode === "existing" && state.existingContract ? state.existingContract : null);

      const contract = await createThenAdd<string, string>({
        existing,
        noun,
        labels: { create: `Creating the ${noun}`, add: config.addLabel },
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
          if (!deployed) throw new Error(`The ${noun} was deployed, but its address couldn't be read — check My Collections.`);
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
        links: [{ href: collectionHref("STARKNET", contract), label: "View collection", icon: Eye }],
        reward: "launch_launchpad",
      };
    },
  });
}

export const TICKETS_FORMAT = makeTierFormat({
  key: "tickets",
  preset: TICKETS_TIER_PRESET,
  title: "IP Ticket",
  hint: "Tickets people hold and show at the door",
  icon: Ticket,
  noun: "ticket collection",
  supplyLabel: "Number of tickets",
  submitLabel: "Create tickets",
  addLabel: "Minting tickets",
});

export const CLUB_FORMAT = makeTierFormat({
  key: "club",
  preset: CLUB_TIER_PRESET,
  title: "IP Club",
  hint: "Membership cards for your community",
  icon: Users,
  noun: "club",
  supplyLabel: "Number of memberships",
  submitLabel: "Create membership",
  addLabel: "Minting memberships",
});
