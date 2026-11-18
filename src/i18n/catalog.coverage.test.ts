import { expect, test } from "bun:test";
import { join } from "node:path";
import { loadCatalog } from "./catalogs.js";
import { LOCALES } from "./locales.js";
import { readSources, scanSentences } from "./tools/scan.js";
import type { Catalog } from "./translate.js";

const SRC = join(import.meta.dir, "..");

const { sentences, plurals } = scanSentences(readSources(SRC));
const known = new Set([...sentences, ...plurals]);
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
const values = (entry: Catalog[string]) => (typeof entry === "string" ? [entry] : Object.values(entry).filter((v): v is string => !!v));
const otherLocales = LOCALES.filter((locale) => locale.code !== "en");

test("no catalog value is empty", async () => {
  for (const { code } of otherLocales) {
    const catalog = await loadCatalog(code);
    for (const [sentence, entry] of Object.entries(catalog)) {
      expect(values(entry).every((value) => value.trim() !== ""), `${code}: ${sentence}`).toBe(true);
    }
  }
});

test("every translation key is a sentence the code still uses", async () => {
  for (const { code } of otherLocales) {
    const obsolete = Object.keys(await loadCatalog(code)).filter((sentence) => !known.has(sentence));
    expect(obsolete, code).toEqual([]);
  }
});

test("every placeholder in a sentence appears in its translation and no other does", async () => {
  for (const { code } of otherLocales) {
    for (const [sentence, entry] of Object.entries(await loadCatalog(code))) {
      for (const value of values(entry)) {
        expect(placeholders(value), `${code}: ${sentence}`).toEqual(placeholders(sentence));
      }
    }
  }
});

test("plural entries use only categories the language has", async () => {
  for (const { code } of otherLocales) {
    const allowed = new Set([...new Intl.PluralRules(code).resolvedOptions().pluralCategories, "other"]);
    for (const [sentence, entry] of Object.entries(await loadCatalog(code))) {
      if (typeof entry === "string") continue;
      expect(Object.keys(entry).filter((category) => !allowed.has(category as Intl.LDMLPluralRule)), `${code}: ${sentence}`).toEqual([]);
    }
  }
});
