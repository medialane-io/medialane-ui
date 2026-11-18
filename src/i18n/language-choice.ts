import { DEFAULT_LOCALE } from "./locales.js";
import { LOCALE_COOKIE } from "./resolve-locale.js";
import { stripLocale, withLocale } from "./with-locale.js";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function chooseLanguage({ code, pathname, locale, search = "", hash = "" }: { code: string; pathname: string; locale: string; search?: string; hash?: string }) {
  const base = stripLocale(pathname || "/", locale);
  const path = code === DEFAULT_LOCALE ? base : withLocale(base, code);
  return {
    cookie: `${LOCALE_COOKIE}=${code}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`,
    href: `${path}${search}${hash}`,
  };
}
