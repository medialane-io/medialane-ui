import { DEFAULT_LOCALE } from "./locales.js";
import { withLocale } from "./with-locale.js";

type Navigate = (href: string, options?: any) => void;

export function localizeRouter<R extends { push: Navigate; replace: Navigate; prefetch: Navigate }>(router: R, locale: string): R {
  if (locale === DEFAULT_LOCALE) return router;
  const prefixed = (navigate: Navigate): Navigate => (href, options) => navigate(withLocale(href, locale), options);
  return { ...router, push: prefixed(router.push), replace: prefixed(router.replace), prefetch: prefixed(router.prefetch) };
}
