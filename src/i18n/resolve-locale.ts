import { DEFAULT_LOCALE, LOCALES, type LocaleInfo } from "./locales.js";

export const LOCALE_COOKIE = "ml_locale";

export interface ResolveInput {
  pathname: string;
  cookie?: string | null;
  acceptLanguage?: string | null;
}

export interface ResolvedLocale {
  locale: string;
  pathname: string;
  redirectTo?: string;
}

const sitePath = (path: string): string => `/${path.replace(/^\/+/, "")}`;

function fromHeader(header: string, codes: string[]): string | null {
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const quality = Number(params.find((param) => param.trim().startsWith("q="))?.trim().slice(2) ?? "1");
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality, index };
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  for (const { tag } of ranked) {
    const match = codes.find((code) => tag === code || tag.startsWith(`${code}-`));
    if (match) return match;
  }
  return null;
}

export function resolveLocale({ pathname, cookie, acceptLanguage }: ResolveInput, locales: readonly LocaleInfo[] = LOCALES): ResolvedLocale {
  const codes = locales.map((info) => info.code.toLowerCase());
  const [, first = "", ...rest] = pathname.split("/");
  const prefix = codes.find((code) => code === first.toLowerCase());
  if (prefix) {
    const stripped = rest.length ? `/${rest.join("/")}` : "/";
    if (prefix === DEFAULT_LOCALE) return { locale: DEFAULT_LOCALE, pathname: stripped, redirectTo: sitePath(stripped) };
    return { locale: prefix, pathname: stripped };
  }
  const chosen =
    (cookie && codes.includes(cookie.toLowerCase()) ? cookie.toLowerCase() : null) ??
    (acceptLanguage ? fromHeader(acceptLanguage, codes) : null) ??
    DEFAULT_LOCALE;
  if (chosen === DEFAULT_LOCALE) return { locale: DEFAULT_LOCALE, pathname };
  const target = sitePath(pathname);
  return { locale: chosen, pathname, redirectTo: target === "/" ? `/${chosen}` : `/${chosen}${target}` };
}
