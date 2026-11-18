import { useMemo } from "react";
import { formatDate, formatDateTime, formatNumber } from "./format.js";
import { useLocale } from "./provider.js";

export interface Format {
  number: (value: number, options?: Intl.NumberFormatOptions) => string;
  date: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
  dateTime: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
}

export function useFormat(): Format {
  const locale = useLocale();
  return useMemo(
    () => ({
      number: (value, options) => formatNumber(value, locale, options),
      date: (value, options) => formatDate(value, locale, options),
      dateTime: (value, options) => formatDateTime(value, locale, options),
    }),
    [locale],
  );
}
