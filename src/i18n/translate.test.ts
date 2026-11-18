import { expect, test } from "bun:test";
import { translate } from "./translate.js";
import { EN, loadCatalog } from "./catalogs.js";

test("returns the key when the messages lack it", () => {
  expect(translate({ locale: "en", messages: {}, key: "nav.home" })).toBe("nav.home");
});

test("loadCatalog returns English for en and a language's own strings for another", async () => {
  const pt = { "nav.home": "Início" };
  const loaders = { pt: async () => pt };
  expect(await loadCatalog("en", loaders)).toBe(EN);
  expect(await loadCatalog("pt", loaders)).toBe(pt);
  expect(await loadCatalog("xx", loaders)).toBe(EN);
});

test("replaces {name} placeholders", () => {
  expect(translate({ locale: "en", messages: { hi: "Hello {name}, you have {n} new" }, key: "hi", vars: { name: "Ana", n: 3 } })).toBe(
    "Hello Ana, you have 3 new",
  );
});

test("leaves a placeholder untouched when its var is missing", () => {
  expect(translate({ locale: "en", messages: { hi: "Hello {name}" }, key: "hi", vars: {} })).toBe("Hello {name}");
});

test("picks the plural form from count", () => {
  const en = { "items.one": "{count} item", "items.other": "{count} items" };
  expect(translate({ locale: "en", messages: en, key: "items", vars: { count: 1 } })).toBe("1 item");
  expect(translate({ locale: "en", messages: en, key: "items", vars: { count: 2 } })).toBe("2 items");
  const ru = { "items.one": "{count} штука", "items.few": "{count} штуки", "items.many": "{count} штук", "items.other": "{count} штуки" };
  expect(translate({ locale: "ru", messages: ru, key: "items", vars: { count: 21 } })).toBe("21 штука");
  expect(translate({ locale: "ru", messages: ru, key: "items", vars: { count: 3 } })).toBe("3 штуки");
  expect(translate({ locale: "ru", messages: ru, key: "items", vars: { count: 5 } })).toBe("5 штук");
});

test("falls back from a missing plural form to other", () => {
  const messages = { "items.other": "{count} items" };
  expect(translate({ locale: "en", messages, key: "items", vars: { count: 1 } })).toBe("1 items");
});
