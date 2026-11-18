"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE } from "./locales.js";
import { makeT, type T } from "./make-t.js";
import type { Catalog } from "./translate.js";

interface I18nValue {
  locale: string;
  messages: Catalog;
}

const NO_MESSAGES: Catalog = {};

const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, messages: NO_MESSAGES });

export interface I18nProviderProps {
  locale: string;
  messages: Catalog;
  children: React.ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): string {
  return useContext(I18nContext).locale;
}

export function useT(): T {
  const { locale, messages } = useContext(I18nContext);
  return useMemo(() => makeT(locale, messages), [locale, messages]);
}
