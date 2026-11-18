"use client";

import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";
import { chooseLanguage } from "../i18n/language-choice.js";
import { LOCALES, type LocaleInfo } from "../i18n/locales.js";
import { useLocale, useT } from "../i18n/provider.js";

export function NavLanguageSwitch({ locales = LOCALES }: { locales?: readonly LocaleInfo[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useNextRouter();
  const pathname = useNextPathname();
  if (locales.length < 2) return null;

  const choose = (code: string) => {
    const { cookie, href } = chooseLanguage({ code, pathname: pathname || "/", locale, search: window.location.search, hash: window.location.hash });
    document.cookie = cookie;
    router.push(href);
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
