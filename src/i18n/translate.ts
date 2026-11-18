export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>;
export type Entry = string | PluralForms;
export type Catalog = Record<string, Entry>;
export type Vars = Record<string, string | number>;

const pluralRules = new Map<string, Intl.PluralRules>();

function pluralCategory(locale: string, count: number): Intl.LDMLPluralRule {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
}

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => (name in vars ? String(vars[name]) : placeholder));
}

export function translate({ messages, text, vars }: { messages: Catalog; text: string; vars?: Vars }): string {
  const entry = messages[text];
  return fill(typeof entry === "string" ? entry : text, vars);
}

export function translatePlural({
  locale,
  messages,
  one,
  other,
  count,
  vars,
}: {
  locale: string;
  messages: Catalog;
  one: string;
  other: string;
  count: number;
  vars?: Vars;
}): string {
  const entry = messages[one];
  const template =
    typeof entry === "string"
      ? entry
      : entry
        ? (entry[pluralCategory(locale, count)] ?? entry.other ?? (pluralCategory("en", count) === "one" ? one : other))
        : pluralCategory("en", count) === "one"
          ? one
          : other;
  return fill(template, { ...vars, count });
}

export const msg = (text: string): string => text;
