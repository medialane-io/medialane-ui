"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import EN from "./catalog/en.js";
import { DEFAULT_LOCALE } from "./locales.js";
import { translate, type Catalog } from "./translate.js";

interface I18nValue {
  locale: string;
  messages: Catalog;
}

const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, messages: EN });

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

export function useT(): (key: string, vars?: Record<string, string | number>) => string {
  const { locale, messages } = useContext(I18nContext);
  return useCallback((key, vars) => translate({ locale, messages, key, vars }), [locale, messages]);
}
