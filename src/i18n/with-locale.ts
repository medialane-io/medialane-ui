import { DEFAULT_LOCALE, LOCALES } from "./locales.js";

const startsWithSegment = (path: string, code: string): boolean =>
  path === `/${code}` ||
  path.startsWith(`/${code}/`) ||
  path.startsWith(`/${code}?`) ||
  path.startsWith(`/${code}#`);

export function withLocale(href: string, locale: string): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith("/") || href.startsWith("//")) return href;
  const codes = [locale, ...LOCALES.map((info) => info.code)].filter((code) => code !== DEFAULT_LOCALE);
  if (codes.some((code) => startsWithSegment(href, code))) return href;
  const isRoot = href === "/" || href.startsWith("/?") || href.startsWith("/#");
  return `/${locale}${isRoot ? href.slice(1) : href}`;
}

export function stripLocale(pathname: string, locale: string): string {
  if (locale === DEFAULT_LOCALE) return pathname;
  if (pathname === `/${locale}`) return "/";
  return pathname.startsWith(`/${locale}/`) ? pathname.slice(locale.length + 1) : pathname;
}
