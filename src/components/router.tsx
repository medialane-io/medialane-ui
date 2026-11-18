"use client";

import { useMemo } from "react";
import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";
import { localizeRouter } from "../i18n/localize-router.js";
import { useLocale } from "../i18n/provider.js";
import { stripLocale } from "../i18n/with-locale.js";

export { useSearchParams } from "next/navigation";

export function useRouter() {
  const router = useNextRouter();
  const locale = useLocale();
  return useMemo(() => localizeRouter(router, locale), [router, locale]);
}

export function usePathname() {
  const pathname = useNextPathname();
  const locale = useLocale();
  return pathname ? stripLocale(pathname, locale) : pathname;
}
