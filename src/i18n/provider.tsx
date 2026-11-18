"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE } from "./locales.js";
import { translate, translatePlural, type Catalog, type Vars } from "./translate.js";

interface I18nValue {
  locale: string;
  messages: Catalog;
}

export interface T {
  (text: string, vars?: Vars): string;
  plural(one: string, other: string, count: number, vars?: Vars): string;
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
  return useMemo(() => {
    const t = ((text: string, vars?: Vars) => translate({ messages, text, vars })) as T;
    t.plural = (one, other, count, vars) => translatePlural({ locale, messages, one, other, count, vars });
    return t;
  }, [locale, messages]);
}
