import { DEFAULT_LOCALE } from "./locales.js";

const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

const DATE_DEFAULT: Intl.DateTimeFormatOptions = { year: "numeric", month: "numeric", day: "numeric" };
const DATE_TIME_DEFAULT: Intl.DateTimeFormatOptions = { ...DATE_DEFAULT, hour: "numeric", minute: "numeric", second: "numeric" };

function cached<F>(cache: Map<string, F>, locale: string, options: object | undefined, create: () => F): F {
  const key = `${locale}|${options ? JSON.stringify(options) : ""}`;
  let format = cache.get(key);
  if (!format) {
    format = create();
    cache.set(key, format);
  }
  return format;
}

export function numberFormat(locale: string = DEFAULT_LOCALE, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  return cached(numberFormats, locale, options, () => new Intl.NumberFormat(locale, options));
}

export function formatNumber(value: number, locale: string = DEFAULT_LOCALE, options?: Intl.NumberFormatOptions): string {
  return numberFormat(locale, options).format(value);
}

const FIELDS = ["weekday", "era", "year", "month", "day", "dayPeriod", "hour", "minute", "second", "fractionalSecondDigits", "dateStyle", "timeStyle"];
const namesFields = (options: Intl.DateTimeFormatOptions) => FIELDS.some((field) => field in options);

function format(value: Date | number | string, locale: string, options: Intl.DateTimeFormatOptions, defaults: Intl.DateTimeFormatOptions): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid Date";
  const resolved = namesFields(options) ? options : { ...defaults, ...options };
  return cached(dateFormats, locale, resolved, () => new Intl.DateTimeFormat(locale, resolved)).format(date);
}

export function formatDate(value: Date | number | string, locale: string = DEFAULT_LOCALE, options: Intl.DateTimeFormatOptions = {}): string {
  return format(value, locale, options, DATE_DEFAULT);
}

export function formatDateTime(value: Date | number | string, locale: string = DEFAULT_LOCALE, options: Intl.DateTimeFormatOptions = {}): string {
  return format(value, locale, options, DATE_TIME_DEFAULT);
}
