import { expect, test } from "bun:test";
import { join } from "node:path";
import { loadCatalog } from "./catalogs.js";
import { LOCALES } from "./locales.js";
import { readSources, scanSentences, scanUnmarkedMessages } from "./tools/scan.js";
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

test("every sentence has a translation", async () => {
  for (const { code } of otherLocales) {
    const catalog = await loadCatalog(code);
    expect([...known].filter((sentence) => !(sentence in catalog)).sort(), code).toEqual([]);
  }
});

test("every validation and form error message is marked for translation", () => {
  const unmarked = scanUnmarkedMessages(readSources(SRC)).map((found) => `${found.file.slice(SRC.length + 1)}: ${found.text}`);
  expect(unmarked.sort()).toEqual([]);
});

test("the message check sees schema rules, field helpers, form errors and message constants", () => {
  const source = `
    const LINK_MESSAGE = "Must be a link";
    z.string().min(1, "Name required").max(10, \`Max ${"$"}{n} characters\`).regex(/a/, "Letters only");
    z.string().refine(ok, { message: "Bad link" });
    context.addIssue({ code: "custom", message: "Date is wrong" });
    positiveIntegerField("Copies required");
    setFormError(offer ? "Choose a work." : msg("Pick a work."));
    setError(err instanceof Error ? err.message : "Upload did not finish");
    z.string().min(1, msg("Marked already"));
    Math.max(0, value);
  `;
  expect(scanUnmarkedMessages({ "a.ts": source }).map((found) => found.text).sort()).toEqual(
    ["Bad link", "Choose a work.", "Copies required", "Date is wrong", "Letters only", "Max ${n} characters", "Must be a link", "Name required", "Upload did not finish"].sort(),
  );
});
