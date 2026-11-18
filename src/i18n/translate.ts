export type Catalog = Record<string, string>;

export interface TranslateArgs {
  locale: string;
  messages: Catalog;
  key: string;
  vars?: Record<string, string | number>;
}

const pluralRules = new Map<string, Intl.PluralRules>();

function pluralCategory(locale: string, count: number): string {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
}

export function translate({ locale, messages, key, vars }: TranslateArgs): string {
  const count = vars?.count;
  const form =
    typeof count === "number"
      ? (messages[`${key}.${pluralCategory(locale, count)}`] ?? messages[`${key}.other`])
      : undefined;
  const template = form ?? messages[key];
  if (template === undefined) return key;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    vars && name in vars ? String(vars[name]) : placeholder,
  );
}
