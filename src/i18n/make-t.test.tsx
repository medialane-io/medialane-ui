import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { makeT, plainT } from "./make-t.js";

test("plainT returns the sentences as written, with values filled in", () => {
  expect(plainT("Hello {name}", { name: "Ana" })).toBe("Hello Ana");
  expect(plainT.plural("{count} item", "{count} items", 1)).toBe("1 item");
  expect(plainT.plural("{count} item", "{count} items", 3)).toBe("3 items");
  expect(renderToStaticMarkup(<>{plainT.rich("Open {link} now", { link: <a href="/x">here</a> })}</>)).toBe('Open <a href="/x">here</a> now');
});

test("makeT translates with the language's messages", () => {
  const t = makeT("pt", { "Hello {name}": "Olá {name}", "{count} item": { one: "{count} item", other: "{count} itens" } });
  expect(t("Hello {name}", { name: "Ana" })).toBe("Olá Ana");
  expect(t.plural("{count} item", "{count} items", 2)).toBe("2 itens");
});
