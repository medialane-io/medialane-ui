export interface LocaleInfo {
  code: string;
  name: string;
  dir: "ltr" | "rtl";
}

export const DEFAULT_LOCALE = "en";

export const LOCALES: readonly LocaleInfo[] = [{ code: "en", name: "English", dir: "ltr" }];
