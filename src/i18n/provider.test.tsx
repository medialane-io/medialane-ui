import { afterEach, expect, test } from "bun:test";
import { render } from "@testing-library/react";

import { EN } from "./catalogs.js";
import { I18nProvider, useLocale, useT } from "./provider.js";

afterEach(() => {
  delete EN.probe;
});

function Probe() {
  const t = useT();
  return (
    <p>
      {useLocale()}|{t("probe")}|{t("missing")}
    </p>
  );
}

test("useT works without a provider and returns English", () => {
  EN.probe = "English text";
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
