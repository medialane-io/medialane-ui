import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { loadCatalog } from "../../i18n/catalogs.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { I18nProvider } = await import("../../i18n/provider.js");
const { CollectionSection } = await import("./collection-section.js");

const messages = await loadCatalog("pt");
const draft = { name: "", symbol: "", description: "", setName: () => {}, setSymbol: () => {}, setDescription: () => {}, reset: () => {} };

afterEach(() => cleanup());

for (const [label, heading] of [["Collection", "Coleção"], ["Ticket collection", "Coleção de ingressos"], ["Club", "Clube"]] as const) {
  test(`a new ${label.toLowerCase()} is filled in with Portuguese fields`, () => {
    const view = render(
      <I18nProvider locale="pt" messages={messages}>
        <CollectionSection label={label} mode="new" onModeChange={() => {}} collections={[]} value="" onValue={() => {}} valueOf={() => ""} draft={draft} previewImage={null} />
      </I18nProvider>,
    );
    expect(view.getByText(heading)).toBeTruthy();
    expect(view.getByPlaceholderText("Nome")).toBeTruthy();
    expect(view.getByPlaceholderText("Código curto")).toBeTruthy();
    expect(view.getByPlaceholderText("Sobre o que é esta coleção")).toBeTruthy();
    expect(view.container.textContent).not.toContain("*");
  });
}
