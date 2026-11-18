import { expect, test } from "bun:test";
import { loadCatalog } from "./catalogs.js";
import { LOCALES } from "./locales.js";
import { translate, translatePlural } from "./translate.js";

test("Portuguese is offered and loads its catalog", async () => {
  expect(LOCALES.map((locale) => locale.code)).toContain("pt");
  const messages = await loadCatalog("pt");
  expect(translate({ messages, text: "Cancel" })).toBe("Cancelar");
  expect(translate({ messages, text: "Level {level}", vars: { level: 3 } })).toBe("Nível 3");
});

test("Portuguese plurals follow its own rules", async () => {
  const messages = await loadCatalog("pt");
  const holders = (count: number) =>
    translatePlural({ locale: "pt", messages, one: "{count} holder", other: "{count} holders", count });
  expect(holders(1)).toBe("1 portador");
  expect(holders(5)).toBe("5 portadores");
});

test("a sentence without a translation shows as written", async () => {
  const messages = await loadCatalog("pt");
  expect(translate({ messages, text: "A sentence nobody translated" })).toBe("A sentence nobody translated");
});
