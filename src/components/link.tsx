"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import NextLink from "next/link";
import { DEFAULT_LOCALE } from "../i18n/locales.js";
import { useLocale } from "../i18n/provider.js";
import { withLocale } from "../i18n/with-locale.js";

type LinkProps = ComponentPropsWithoutRef<typeof NextLink>;

function localizeHref(href: LinkProps["href"], locale: string): LinkProps["href"] {
  if (locale === DEFAULT_LOCALE) return href;
  if (typeof href === "string") return withLocale(href, locale);
  if (typeof href.pathname === "string") return { ...href, pathname: withLocale(href.pathname, locale) };
  return href;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, ...props }, ref) {
  const locale = useLocale();
  return <NextLink ref={ref} href={localizeHref(href, locale)} {...props} />;
});

export default Link;
