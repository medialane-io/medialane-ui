import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { HiddenContentBanner } from "./hidden-content-banner.js";
import { I18nProvider } from "../i18n/provider.js";

const SENTENCE = "This content is not public visible on Medialane. For more information you can request support.";

test("shows the English sentence without a provider", () => {
  const { container } = render(<HiddenContentBanner />);
  expect(container.textContent).toBe(SENTENCE);
});

test("shows the translated sentence under a provider", () => {
  const { container } = render(
    <I18nProvider locale="pt" messages={{ [SENTENCE]: "Este conteúdo não é público." }}>
      <HiddenContentBanner />
    </I18nProvider>,
  );
  expect(container.textContent).toBe("Este conteúdo não é público.");
});
