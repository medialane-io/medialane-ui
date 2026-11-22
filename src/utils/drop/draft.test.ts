import { expect, test } from "bun:test";
import { EMPTY_DRAFT, draftTokens, firstMissing, hasErrors, newAsset, validateDropDraft, type DropDraft } from "./draft.js";

const NOW = 1_800_000_000;
const png = (name: string) => new File(["x"], `${name}.png`, { type: "image/png" });
const named = (patch: Partial<DropDraft> = {}): DropDraft => ({
  ...EMPTY_DRAFT,
  collection: { ...EMPTY_DRAFT.collection, name: "Drop" },
  assets: [newAsset(png("a"))],
  ...patch,
});

test("an empty draft asks for a collection name and an asset", () => {
  const e = validateDropDraft(EMPTY_DRAFT, NOW);
  expect(e.collection.name).toBe("Name the collection");
  expect(e.assets.list).toBe("Add an asset");
  expect(firstMissing(e)).toEqual({ panel: "collection", message: "Name the collection" });
  expect(hasErrors(e)).toBe(true);
});

test("a named draft with one asset is complete", () => {
  const e = validateDropDraft(named(), NOW);
  expect(hasErrors(e)).toBe(false);
  expect(firstMissing(e)).toBeNull();
});

test("a new asset starts with one copy and no details", () => {
  const a = newAsset(png("a"));
  expect(a).toMatchObject({ name: "", description: "", copies: "1", traits: [] });
  expect(a.file.name).toBe("a.png");
});

test("tokens are the sum of copies and stop at 2,000", () => {
  const d = named({ assets: [{ ...newAsset(png("a")), copies: "1500" }, { ...newAsset(png("b")), copies: "501" }] });
  expect(draftTokens(d)).toBe(2001);
  expect(validateDropDraft(d, NOW).assets.list).toBe("Up to 2,000 tokens");
  expect(firstMissing(validateDropDraft(d, NOW))).toEqual({ panel: "assets", message: "Up to 2,000 tokens" });
});

test("copies must be a whole number from 1", () => {
  for (const copies of ["", "0", "1.5", "x"]) {
    const a = { ...newAsset(png("a")), copies };
    const e = validateDropDraft(named({ assets: [a] }), NOW);
    expect(e.assets.byId[a.id]?.copies).toBe("Enter 1 or more");
    expect(firstMissing(e)).toEqual({ panel: "assets", message: "Enter 1 or more" });
  }
});

test("reserved trait names are refused; blank rows are ignored", () => {
  const a = { ...newAsset(png("a")), traits: [{ key: "License", value: "x" }] };
  expect(validateDropDraft(named({ assets: [a] }), NOW).assets.byId[a.id]?.traits).toBe("License is set by the license terms");
  const b = { ...newAsset(png("b")), traits: [{ key: "", value: "" }] };
  expect(validateDropDraft(named({ assets: [b] }), NOW).assets.byId[b.id]).toBeUndefined();
});

test("the external link must start with https://", () => {
  const d = named({ collection: { ...EMPTY_DRAFT.collection, name: "Drop", externalUrl: "http://x" } });
  expect(validateDropDraft(d, NOW).collection.externalUrl).toBe("Add a link starting with https://");
  const ok = named({ collection: { ...EMPTY_DRAFT.collection, name: "Drop", externalUrl: "https://x.io" } });
  expect(validateDropDraft(ok, NOW).collection.externalUrl).toBeUndefined();
});

test("a list drop needs readable wallet addresses; exclusive content needs a link", () => {
  expect(validateDropDraft(named({ listOnly: true, allowlist: "" }), NOW).settings.allowlist).toBe("Add at least one wallet address");
  expect(validateDropDraft(named({ listOnly: true, allowlist: "0x1\nnope" }), NOW).settings.allowlist).toBe("1 line isn't a wallet address: nope");
  expect(validateDropDraft(named({ gated: { enabled: true, title: "", url: "ftp://x", type: "" } }), NOW).settings.gated).toBe("Add a link starting with https://");
});

test("sale errors land in settings", () => {
  const e = validateDropDraft(named({ sale: { ...EMPTY_DRAFT.sale, paid: true, price: "" } }), NOW);
  expect(e.settings.price).toBe("Enter a price above 0");
  expect(firstMissing(e)).toEqual({ panel: "settings", message: "Enter a price above 0" });
});
