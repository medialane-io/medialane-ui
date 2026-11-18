import { expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { EN, loadCatalog } from "./catalogs.js";
import { LOCALES } from "./locales.js";
import type { Catalog } from "./translate.js";

const SRC = join(import.meta.dir, "..");

function missingFrom(base: Catalog, other: Catalog): string[] {
  return Object.keys(other).filter((key) => !(key in base));
}

function emptyValues(catalog: Catalog): string[] {
  return Object.keys(catalog).filter((key) => catalog[key].trim() === "");
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

function usedKeys(source: string): string[] {
  const keys: string[] = [];
  for (const match of source.matchAll(/\bt\(\s*(["'`])([^"'`$]+)\1/g)) keys.push(match[2]);
  return keys;
}

function isKnown(catalog: Catalog, key: string): boolean {
  return key in catalog || `${key}.other` in catalog;
}

test("the checks catch a key missing from English and an empty value", () => {
  expect(missingFrom({ a: "A" }, { a: "A", b: "B" })).toEqual(["b"]);
  expect(emptyValues({ a: "A", b: " " })).toEqual(["b"]);
  expect(usedKeys(`t("nav.home"); t('items', { count: 2 }); t(dynamic); t(\`a.\${b}\`)`)).toEqual(["nav.home", "items"]);
});

test("every non-English catalog key exists in English", async () => {
  for (const { code } of LOCALES.filter((locale) => locale.code !== "en")) {
    expect(missingFrom(EN, await loadCatalog(code))).toEqual([]);
  }
});

test("no catalog value is empty", async () => {
  for (const { code } of LOCALES) {
    expect(emptyValues(await loadCatalog(code))).toEqual([]);
  }
});

test("every key passed to useT or t( in src exists in English", () => {
  const unknown = sourceFiles(SRC).flatMap((file) =>
    usedKeys(readFileSync(file, "utf8"))
      .filter((key) => !isKnown(EN, key))
      .map((key) => `${file.slice(SRC.length + 1)}: ${key}`),
  );
  expect(unknown).toEqual([]);
});
