import { expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { join } from "node:path";
import { readSources } from "./tools/scan.js";
import { createElement } from "react";
import { formatDate, formatDateTime, formatNumber } from "./format.js";
import { I18nProvider } from "./provider.js";
import { useFormat } from "./use-format.js";

const noon = new Date(Date.UTC(2026, 10, 18, 12, 0, 0));

test("numbers use the language's separators, and English by default", () => {
  expect(formatNumber(1234.5)).toBe("1,234.5");
  expect(formatNumber(1234.5, "en")).toBe("1,234.5");
  expect(formatNumber(1234.5, "pt")).toBe("1.234,5");
  expect(formatNumber(1234.5, "en", { minimumFractionDigits: 2 })).toBe("1,234.50");
});

test("the same call returns the same string whatever the process locale is", () => {
  const before = formatNumber(1234567.891);
  const saved = [process.env.LC_ALL, process.env.LANG];
  process.env.LC_ALL = "pt_BR.UTF-8";
  process.env.LANG = "pt_BR.UTF-8";
  expect(formatNumber(1234567.891)).toBe(before);
  [process.env.LC_ALL, process.env.LANG] = saved as [string, string];
});

test("dates follow the language and accept options", () => {
  expect(formatDate(noon, "en", { month: "short", day: "numeric", timeZone: "UTC" })).toBe("Nov 18");
  expect(formatDate(noon, "pt", { day: "numeric", month: "long", timeZone: "UTC" })).toBe("18 de novembro");
  expect(formatDate(noon.getTime(), "en", { timeZone: "UTC" })).toBe("11/18/2026");
});

test("a date and time reads like the English default", () => {
  expect(formatDateTime(noon, "en", { timeZone: "UTC" })).toBe("11/18/2026, 12:00:00 PM");
});

test("an invalid date is shown as the browser would show it, not thrown", () => {
  expect(formatDate(new Date("nope"), "en")).toBe("Invalid Date");
});

test("useFormat binds the active language and returns one object while it is unchanged", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => createElement(I18nProvider, { locale: "pt", messages: {}, children });
  const { result, rerender } = renderHook(() => useFormat(), { wrapper });
  expect(result.current.number(1234.5)).toBe("1.234,5");
  const first = result.current;
  rerender();
  expect(result.current).toBe(first);
  expect(renderHook(() => useFormat()).result.current.number(1234.5)).toBe("1,234.5");
});

test("options that name date fields replace the defaults, as the browser does", () => {
  expect(formatDateTime(noon, "en", { month: "short", day: "numeric", timeZone: "UTC" })).toBe("Nov 18");
  const styled = { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" } as const;
  expect(formatDateTime(noon, "en", styled)).toBe(noon.toLocaleString("en", styled));
  expect(formatDate(noon, "en", { weekday: "short", timeZone: "UTC" })).toBe("Wed");
});

test("no source file formats with the runtime's default locale", () => {
  const offenders = Object.entries(readSources(join(import.meta.dir, "..")))
    .filter(([file]) => !file.includes("/i18n/"))
    .filter(([, text]) => /\.toLocale(Date|Time)?String\(|new Intl\.(NumberFormat|DateTimeFormat)\(/.test(text))
    .map(([file]) => file);
  expect(offenders).toEqual([]);
});
