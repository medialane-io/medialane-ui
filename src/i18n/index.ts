export { translate, translatePlural, msg, type Catalog, type Entry, type PluralForms, type Vars } from "./translate.js";
export { DEFAULT_LOCALE, LOCALES, type LocaleInfo } from "./locales.js";
export { loadCatalog } from "./catalogs.js";
export { I18nProvider, useLocale, useT, type I18nProviderProps, type T } from "./provider.js";
export { stripLocale, withLocale } from "./with-locale.js";
