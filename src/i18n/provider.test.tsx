import { expect, test } from "bun:test";
import { render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { I18nProvider, useLocale, useT } from "./provider.js";

function Probe() {
  const t = useT();
  return (
    <p>
      {useLocale()}|{t("Hello {name}", { name: "Ana" })}|{t.plural("{count} item", "{count} items", 2)}
    </p>
  );
}

test("useT works without a provider and returns the sentences as written", () => {
  const { container } = render(<Probe />);
  expect(container.textContent).toBe("en|Hello Ana|2 items");
});

test("the provider supplies the language and its messages", () => {
  const messages = { "Hello {name}": "Olá {name}", "{count} item": { one: "{count} item", other: "{count} itens" } };
  const { container } = render(
    <I18nProvider locale="pt" messages={messages}>
      <Probe />
    </I18nProvider>,
  );
  expect(container.textContent).toBe("pt|Olá Ana|2 itens");
});

test("useT returns the same function while the language and messages are unchanged", () => {
  const messages = {};
  const wrapper = ({ children }: { children: React.ReactNode }) => createElement(I18nProvider, { locale: "pt", messages, children });
  const { result, rerender } = renderHook(() => useT(), { wrapper });
  const first = result.current;
  rerender();
  expect(result.current).toBe(first);
});
