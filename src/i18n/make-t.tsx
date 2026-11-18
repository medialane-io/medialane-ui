import { Fragment } from "react";
import { lookup, translate, translatePlural, type Catalog, type Vars } from "./translate.js";

export interface T {
  (text: string, vars?: Vars): string;
  plural(one: string, other: string, count: number, vars?: Vars): string;
  rich(text: string, values: Record<string, React.ReactNode>): React.ReactNode;
}

export function makeT(locale: string, messages: Catalog): T {
  const t = ((text: string, vars?: Vars) => translate({ messages, text, vars })) as T;
  t.plural = (one, other, count, vars) => translatePlural({ locale, messages, one, other, count, vars });
  t.rich = (text, values) =>
    lookup(messages, text)
      .split(/(\{\w+\})/)
      .map((part, index) => {
        const name = /^\{(\w+)\}$/.exec(part)?.[1];
        return name !== undefined && name in values ? <Fragment key={index}>{values[name]}</Fragment> : part;
      });
  return t;
}

export const plainT: T = makeT("en", {});
