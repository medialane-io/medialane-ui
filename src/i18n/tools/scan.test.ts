import { expect, test } from "bun:test";
import { scanSentences } from "./scan.js";

test("finds t, t.plural and msg sentences", () => {
  const { sentences, plurals } = scanSentences({
    "a.tsx": `
      const t = useT();
      export const A = () => <b title={t("Open menu")}>{t("Hello {name}", { name })}</b>;
      export const labels = [msg("Allowed"), msg('Not Allowed')];
      export const n = (c: number) => t.plural("{count} item", "{count} items", c);
    `,
  });
  expect([...sentences].sort()).toEqual(["Allowed", "Hello {name}", "Not Allowed", "Open menu"]);
  expect([...plurals]).toEqual(["{count} item"]);
});

test("ignores dynamic arguments and functions with other names", () => {
  const { sentences, plurals } = scanSentences({
    "b.tsx": `
      t(label); t(\`a \${b}\`); format("Not a sentence"); obj.t("Nor this"); t(); msg(value);
      const x = t("Real");
    `,
  });
  expect([...sentences]).toEqual(["Real"]);
  expect([...plurals]).toEqual([]);
});

test("reads a template literal without variables as a sentence", () => {
  expect([...scanSentences({ "c.ts": "t(`Plain template`)" }).sentences]).toEqual(["Plain template"]);
});

test("reads the sentence of t.rich", () => {
  expect([...scanSentences({ "d.tsx": `t.rich("Your claim for {name} is pending", { name })` }).sentences]).toEqual(["Your claim for {name} is pending"]);
});
