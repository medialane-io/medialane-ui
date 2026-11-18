"use client";

import { useMemo } from "react";
import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";
import { DEFAULT_LOCALE } from "../i18n/locales.js";
import { useLocale } from "../i18n/provider.js";
import { stripLocale, withLocale } from "../i18n/with-locale.js";

export { useSearchParams } from "next/navigation";

export function useRouter() {
  const router = useNextRouter();
  const locale = useLocale();
  return useMemo(() => {
    if (locale === DEFAULT_LOCALE) return router;
    return {
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(withLocale(href, locale), options),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(withLocale(href, locale), options),
      prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => router.prefetch(withLocale(href, locale), options),
    };
  }, [router, locale]);
}

export function usePathname() {
  const pathname = useNextPathname();
  const locale = useLocale();
  return pathname ? stripLocale(pathname, locale) : pathname;
}
