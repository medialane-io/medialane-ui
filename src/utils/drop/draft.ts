import type { DraftItem } from "../../components/drop-item-list.js";
import { parseAllowlist } from "./allowlist.js";
import { MAX_DROP_SUPPLY, type DropKind, type DropLicense } from "./metadata.js";
import { EMPTY_SALE, validateSale, type SaleDraft, type SaleErrors } from "./sale.js";

export interface DropDraft {
  kind: DropKind;
  edition: File | null;
  supply: string;
  items: DraftItem[];
  cover: File | null;
  name: string;
  symbol: string;
  description: string;
  license: DropLicense;
  sale: SaleDraft;
  listOnly: boolean;
  allowlist: string;
  gated: { enabled: boolean; title: string; url: string; type: string };
}

export const EMPTY_DRAFT: DropDraft = {
  kind: "edition",
  edition: null,
  supply: "100",
  items: [],
  cover: null,
  name: "",
  symbol: "",
  description: "",
  license: {
    ipType: "Art", licenseType: "CC BY-SA", commercialUse: "Yes", derivatives: "Share-Alike",
    attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Allowed", royalty: "0",
  },
  sale: EMPTY_SALE,
  listOnly: false,
  allowlist: "",
  gated: { enabled: false, title: "", url: "", type: "" },
};

export type DropDraftErrors = SaleErrors & Partial<Record<"artwork" | "supply" | "name" | "symbol" | "allowlist" | "gated", string>>;

export function draftSupply(d: DropDraft): number {
  return d.kind === "edition" ? Number(d.supply) : d.items.length;
}

const thousands = MAX_DROP_SUPPLY.toLocaleString("en-US");

export function validateDropDraft(d: DropDraft, now: number): DropDraftErrors {
  const e: DropDraftErrors = { ...validateSale(d.sale, now) };
  if (d.kind === "edition") {
    if (!d.edition) e.artwork = "Add the artwork";
    if (!/^[1-9]\d*$/.test(d.supply) || Number(d.supply) > MAX_DROP_SUPPLY) e.supply = `Enter a supply from 1 to ${thousands}`;
  } else if (d.items.length === 0) {
    e.artwork = "Add at least one item";
  } else if (d.items.length > MAX_DROP_SUPPLY) {
    e.artwork = `A collection holds up to ${thousands} items`;
  }
  if (!d.name.trim()) e.name = "Name your drop";
  if (!/^[A-Z0-9]{1,10}$/.test(d.symbol)) e.symbol = "Use 1–10 capital letters or digits";
  if (d.listOnly) {
    const list = parseAllowlist(d.allowlist);
    if (list.invalid.length > 0) {
      const n = list.invalid.length;
      e.allowlist = `${n} line${n === 1 ? " isn't a wallet address" : "s aren't wallet addresses"}: ${list.invalid.slice(0, 3).join(", ")}`;
    } else if (list.addresses.length === 0) {
      e.allowlist = "Add at least one wallet address";
    }
  }
  if (d.gated.enabled && !/^https:\/\//.test(d.gated.url)) e.gated = "Add a link starting with https://";
  return e;
}
