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

test("t.rich puts elements where the placeholders are", () => {
  function Rich() {
    const t = useT();
    return <p>{t.rich("Your claim for {name} is pending", { name: <b>Ana</b> })}</p>;
  }
  const { container } = render(<Rich />);
  expect(container.innerHTML).toBe("<p>Your claim for <b>Ana</b> is pending</p>");
});

test("t.rich follows the translation's word order", () => {
  function Rich() {
    const t = useT();
    return <p>{t.rich("Your claim for {name} is pending", { name: <b>Ana</b> })}</p>;
  }
  const { container } = render(
    <I18nProvider locale="pt" messages={{ "Your claim for {name} is pending": "{name}: o seu pedido está pendente" }}>
      <Rich />
    </I18nProvider>,
  );
  expect(container.innerHTML).toBe("<p><b>Ana</b>: o seu pedido está pendente</p>");
});

test("t.rich renders a false or missing value as nothing and keeps unknown placeholders", () => {
  function Rich() {
    const t = useT();
    return <p>{t.rich("Markets {count}{extra}", { count: false, other: <i /> })}</p>;
  }
  const { container } = render(<Rich />);
  expect(container.innerHTML).toBe("<p>Markets {extra}</p>");
});
