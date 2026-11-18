import { expect, test } from "bun:test";
import { translate, translatePlural, msg } from "./translate.js";
import { loadCatalog } from "./catalogs.js";

test("returns the sentence as written when no translation exists", () => {
  expect(translate({ messages: {}, text: "View details" })).toBe("View details");
});

test("uses the translation when one exists", () => {
  expect(translate({ messages: { "View details": "Ver detalhes" }, text: "View details" })).toBe("Ver detalhes");
});

test("replaces {name} placeholders", () => {
  expect(translate({ messages: {}, text: "Hello {name}, you have {n} new", vars: { name: "Ana", n: 3 } })).toBe(
    "Hello Ana, you have 3 new",
  );
});

test("leaves a placeholder untouched when its var is missing", () => {
  expect(translate({ messages: {}, text: "Hello {name}", vars: {} })).toBe("Hello {name}");
});

test("plural picks the form by the language's own rules", () => {
  const messages = {
    "{count} item": { one: "{count} штука", few: "{count} штуки", many: "{count} штук", other: "{count} штуки" },
  };
  const pick = (count: number) => translatePlural({ locale: "ru", messages, one: "{count} item", other: "{count} items", count });
  expect(pick(21)).toBe("21 штука");
  expect(pick(3)).toBe("3 штуки");
  expect(pick(5)).toBe("5 штук");
});

test("plural without an entry uses the English rules even under another language", () => {
  const pick = (count: number) => translatePlural({ locale: "ru", messages: {}, one: "{count} item", other: "{count} items", count });
  expect(pick(1)).toBe("1 item");
  expect(pick(2)).toBe("2 items");
  expect(pick(21)).toBe("21 items");
});

test("plural with a missing category falls back to other", () => {
  const messages = { "{count} item": { other: "{count} itens" } };
  expect(translatePlural({ locale: "pt", messages, one: "{count} item", other: "{count} items", count: 1 })).toBe("1 itens");
});

test("plural accepts a plain string translation", () => {
  const messages = { "{count} item": "{count} 件" };
  expect(translatePlural({ locale: "ja", messages, one: "{count} item", other: "{count} items", count: 4 })).toBe("4 件");
});

test("msg returns its text unchanged", () => {
  expect(msg("Launch a drop")).toBe("Launch a drop");
});

test("loadCatalog returns an empty catalog for en and an unknown language, and the language's catalog for a registered one", async () => {
  const pt = { "View details": "Ver detalhes" };
  const loaders = { pt: async () => pt };
  expect(await loadCatalog("en", loaders)).toEqual({});
  expect(await loadCatalog("xx", loaders)).toEqual({});
  expect(await loadCatalog("pt", loaders)).toBe(pt);
});
