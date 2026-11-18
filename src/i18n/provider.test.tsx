import { expect, mock, test } from "bun:test";
import { render } from "@testing-library/react";

mock.module("./catalog/en.js", () => ({ default: { probe: "English text" } }));

const { I18nProvider, useLocale, useT } = await import("./provider.js");

function Probe() {
  const t = useT();
  return (
    <p>
      {useLocale()}|{t("probe")}|{t("missing")}
    </p>
  );
}

test("useT works without a provider and returns English", () => {
  const { container } = render(<Probe />);
  expect(container.textContent).toBe("en|English text|missing");
});

test("the provider supplies the language and its messages", () => {
  const { container } = render(
    <I18nProvider locale="pt" messages={{ probe: "Texto" }}>
      <Probe />
    </I18nProvider>,
  );
  expect(container.textContent).toBe("pt|Texto|missing");
});
