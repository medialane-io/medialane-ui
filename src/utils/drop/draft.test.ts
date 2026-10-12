import { expect, test } from "bun:test";
import { EMPTY_DRAFT, draftSupply, validateDropDraft } from "./draft.js";

const NOW = 1_800_000_000;
const img = new File(["x"], "a.png", { type: "image/png" });
const item = (id: string) => ({ id, file: img, previewUrl: "blob:", name: "", description: "" });

test("an empty draft asks for artwork, a name and a symbol", () => {
  expect(validateDropDraft(EMPTY_DRAFT, NOW)).toEqual({
    artwork: "Add the artwork", name: "Name your drop", symbol: "Use 1–10 capital letters or digits",
  });
});

test("edition supply is 1 to 2,000; a collection needs items", () => {
  const edition = { ...EMPTY_DRAFT, edition: img, name: "N", symbol: "N" };
  expect(validateDropDraft({ ...edition, supply: "2001" }, NOW).supply).toBe("Enter a supply from 1 to 2,000");
  expect(validateDropDraft({ ...edition, supply: "0" }, NOW).supply).toBe("Enter a supply from 1 to 2,000");
  expect(validateDropDraft({ ...edition, supply: "2000" }, NOW)).toEqual({});
  expect(draftSupply({ ...edition, supply: "25" })).toBe(25);
  const collection = { ...EMPTY_DRAFT, kind: "collection" as const, name: "N", symbol: "N" };
  expect(validateDropDraft(collection, NOW).artwork).toBe("Add at least one item");
  expect(draftSupply({ ...collection, items: [item("a"), item("b")] })).toBe(2);
});

test("a list drop needs readable wallet addresses; exclusive content needs a link", () => {
  const ok = { ...EMPTY_DRAFT, edition: img, name: "N", symbol: "N" };
  expect(validateDropDraft({ ...ok, listOnly: true, allowlist: "" }, NOW).allowlist).toBe("Add at least one wallet address");
  expect(validateDropDraft({ ...ok, listOnly: true, allowlist: "0x1\nnope" }, NOW).allowlist).toBe("1 line isn't a wallet address: nope");
  expect(validateDropDraft({ ...ok, gated: { enabled: true, title: "", url: "ftp://x", type: "" } }, NOW).gated).toBe("Add a link starting with https://");
});

test("sale errors come through", () => {
  const d = { ...EMPTY_DRAFT, edition: img, name: "N", symbol: "N", sale: { ...EMPTY_DRAFT.sale, paid: true, price: "" } };
  expect(validateDropDraft(d, NOW).price).toBe("Enter a price above 0");
});
