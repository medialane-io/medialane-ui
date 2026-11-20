"use client";

import { Globe } from "lucide-react";
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

  const current = locales.find((info) => info.code === locale)?.name ?? locale;

  return (
    <span className="relative inline-flex h-8 items-center gap-1.5 rounded-2xl px-2 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-within:bg-muted/60 focus-within:text-foreground">
      <Globe className="h-3.5 w-3.5" aria-hidden />
      <span aria-hidden>{current}</span>
      <select
        aria-label={t("Language")}
        value={locale}
        onChange={(event) => choose(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {locales.map((info) => (
          <option key={info.code} value={info.code} lang={info.code}>
            {info.name}
          </option>
        ))}
      </select>
    </span>
  );
}
