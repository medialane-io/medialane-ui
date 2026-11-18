import { expect, test } from "bun:test";
import { join } from "node:path";
import { readSources } from "./i18n/tools/scan.js";

test('a "use client" directive appears once and before any code', () => {
  const offenders = Object.entries(readSources(import.meta.dir, new Set()))
    .filter(([, text]) => text.includes('"use client"'))
    .filter(([, text]) => {
      const lines = text.split("\n");
      const first = lines.findIndex((line) => line.trim() !== "" && !line.trim().startsWith("//") && !line.trim().startsWith("/*") && !line.trim().startsWith("*"));
      const directives = lines.filter((line) => /^\s*["']use client["'];?\s*$/.test(line)).length;
      return directives !== 1 || !/^\s*["']use client["']/.test(lines[first] ?? "");
    })
    .map(([file]) => file.slice(join(import.meta.dir, "..").length + 1));
  expect(offenders).toEqual([]);
});
