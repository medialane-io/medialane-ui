"use client";

import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, type LocaleInfo } from "../i18n/locales.js";
import { useLocale, useT } from "../i18n/provider.js";
import { LOCALE_COOKIE } from "../i18n/resolve-locale.js";
import { stripLocale, withLocale } from "../i18n/with-locale.js";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function NavLanguageSwitch({ locales = LOCALES }: { locales?: readonly LocaleInfo[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useNextRouter();
  const pathname = useNextPathname();
  if (locales.length < 2) return null;

  const choose = (code: string) => {
    document.cookie = `${LOCALE_COOKIE}=${code}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
    const base = stripLocale(pathname || "/", locale);
    const target = code === DEFAULT_LOCALE ? base : withLocale(base, code);
    router.push(`${target}${window.location.search}${window.location.hash}`);
  };

  return (
    <select
      aria-label={t("Language")}
      value={locale}
      onChange={(event) => choose(event.target.value)}
      className="h-8 rounded-md border border-border bg-transparent px-2 text-xs text-foreground"
    >
      {locales.map((info) => (
        <option key={info.code} value={info.code} lang={info.code}>
          {info.name}
        </option>
      ))}
    </select>
  );
}
