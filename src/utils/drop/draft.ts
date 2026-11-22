import { RESERVED_TRAITS } from "@medialane/sdk";
import { isPositiveInteger } from "../launchpad-rules.js";
import { suggestLaunchpadSymbol } from "../launchpad-defaults.js";
import { parseAllowlist } from "./allowlist.js";
import { MAX_DROP_SUPPLY, type DropLicense } from "./metadata.js";
import { EMPTY_SALE, validateSale, type SaleDraft, type SaleErrors } from "./sale.js";
import { formatNumber } from "../../i18n/format.js";
import { msg, type Phrase } from "../../i18n/translate.js";
import { detectMediaKind } from "../../components/fast-mint/media-kind.js";
import type { MediaKind } from "../../components/fast-mint/types.js";

export interface DraftTrait {
  key: string;
  value: string;
}

export interface DraftAsset {
  id: string;
  file: File;
  feature: File | null;
  name: string;
  description: string;
  copies: string;
  traits: DraftTrait[];
}

export interface DropDraft {
  collection: { name: string; description: string; externalUrl: string; cover: File | null };
  assets: DraftAsset[];
  mixOrder: boolean;
  sale: SaleDraft;
  listOnly: boolean;
  allowlist: string;
  license: DropLicense;
  gated: { enabled: boolean; title: string; url: string; type: string };
}

export const EMPTY_DRAFT: DropDraft = {
  collection: { name: "", description: "", externalUrl: "", cover: null },
  assets: [],
  mixOrder: true,
  sale: EMPTY_SALE,
  listOnly: false,
  allowlist: "",
  license: {
    ipType: "Art", licenseType: "CC BY-SA", commercialUse: "Yes", derivatives: "Share-Alike",
    attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Allowed", royalty: "0",
  },
  gated: { enabled: false, title: "", url: "", type: "" },
};

export function newAsset(file: File): DraftAsset {
  return { id: crypto.randomUUID(), file, feature: null, name: "", description: "", copies: "1", traits: [] };
}

export function assetKind(a: DraftAsset): MediaKind {
  return detectMediaKind(a.file.type) ?? "document";
}

export function assetImage(a: DraftAsset): File | null {
  return assetKind(a) === "image" ? a.file : a.feature;
}

export function dropSymbol(name: string): string {
  return suggestLaunchpadSymbol(name) || "DROP";
}

const featureId = (a: DraftAsset) => `${a.id}:feature`;

export function assetUploads(assets: DraftAsset[]): { id: string; file: File }[] {
  return assets.flatMap((a) => [
    { id: a.id, file: a.file },
    ...(assetKind(a) !== "image" && a.feature ? [{ id: featureId(a), file: a.feature }] : []),
  ]);
}

export function assetMedia(a: DraftAsset, uriOf: (id: string) => string | null): { imageUri: string; animationUrl: string | null } {
  if (assetKind(a) === "image") return { imageUri: uriOf(a.id)!, animationUrl: null };
  return { imageUri: uriOf(featureId(a))!, animationUrl: uriOf(a.id) };
}

export function draftTokens(d: DropDraft): number {
  return d.assets.reduce((n, a) => n + (isPositiveInteger(a.copies) ? Number(a.copies) : 0), 0);
}

export type DropPanel = "collection" | "assets" | "settings";

type AssetErrors = Partial<Record<"copies" | "traits" | "feature", Phrase>>;

export interface DropDraftErrors {
  collection: Partial<Record<"name" | "externalUrl", Phrase>>;
  assets: { list?: Phrase; byId: Record<string, AssetErrors> };
  settings: SaleErrors & Partial<Record<"allowlist" | "gated", Phrase>>;
}

const HTTPS = /^https:\/\//;
const RESERVED = new Map([...RESERVED_TRAITS].map((t) => [t.toLowerCase(), t]));

function assetErrors(a: DraftAsset): AssetErrors | null {
  const e: AssetErrors = {};
  if (!assetImage(a)) e.feature = { text: msg("Add a feature image") };
  if (!isPositiveInteger(a.copies)) e.copies = { text: msg("Enter 1 or more") };
  const reserved = a.traits.map((t) => RESERVED.get(t.key.trim().toLowerCase())).find(Boolean);
  if (reserved) e.traits = { text: msg("{name} is set by the license terms"), vars: { name: reserved } };
  return Object.keys(e).length > 0 ? e : null;
}

export function validateDropDraft(d: DropDraft, now: number): DropDraftErrors {
  const collection: DropDraftErrors["collection"] = {};
  if (!d.collection.name.trim()) collection.name = { text: msg("Name the collection") };
  if (d.collection.externalUrl.trim() && !HTTPS.test(d.collection.externalUrl.trim())) collection.externalUrl = { text: msg("Add a link starting with https://") };

  const assets: DropDraftErrors["assets"] = { byId: {} };
  for (const a of d.assets) {
    const e = assetErrors(a);
    if (e) assets.byId[a.id] = e;
  }
  if (d.assets.length === 0) assets.list = { text: msg("Add an asset") };
  else if (draftTokens(d) > MAX_DROP_SUPPLY) assets.list = { text: msg("Up to {count} tokens"), vars: { count: formatNumber(MAX_DROP_SUPPLY) } };

  const settings: DropDraftErrors["settings"] = { ...validateSale(d.sale, now) };
  if (d.listOnly) {
    const list = parseAllowlist(d.allowlist);
    if (list.invalid.length > 0) settings.allowlist = { text: msg("Not wallet addresses: {lines}"), vars: { lines: list.invalid.slice(0, 3).join(", ") } };
    else if (list.addresses.length === 0) settings.allowlist = { text: msg("Add at least one wallet address") };
  }
  if (d.gated.enabled && !HTTPS.test(d.gated.url)) settings.gated = { text: msg("Add a link starting with https://") };
  return { collection, assets, settings };
}

const firstValue = (o: object): Phrase | undefined => Object.values(o).find((v): v is Phrase => !!v && typeof v === "object" && "text" in v);

export function firstMissing(e: DropDraftErrors): { panel: DropPanel; message: Phrase } | null {
  const collection = firstValue(e.collection);
  if (collection) return { panel: "collection", message: collection };
  const asset = e.assets.list ?? Object.values(e.assets.byId).map(firstValue).find(Boolean);
  if (asset) return { panel: "assets", message: asset };
  const settings = firstValue(e.settings);
  if (settings) return { panel: "settings", message: settings };
  return null;
}

export function hasErrors(e: DropDraftErrors): boolean {
  return firstMissing(e) !== null;
}
