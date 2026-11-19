import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { loadCatalog } from "./catalogs.js";

mock.module("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push() {}, replace() {}, prefetch() {} }), useSearchParams: () => new URLSearchParams() }));

const { I18nProvider } = await import("./provider.js");
const { SectionHeading } = await import("../components/section-heading.js");
const { ToggleGroup } = await import("../components/create-form-primitives.js");
const { EmptyOrError } = await import("../components/empty-or-error.js");
const { DiscoverFeatures } = await import("../components/discover-features.js");
const { DropFeatures } = await import("../components/drop/drop-features.js");

const messages = await loadCatalog("pt");

afterEach(cleanup);

const portuguese = (node: React.ReactNode) => render(<I18nProvider locale="pt" messages={messages}>{node}</I18nProvider>);

test("a section heading translates its link label", () => {
  const { getByText } = portuguese(<SectionHeading icon={null} title="Coleções" href="/collections" />);
  expect(getByText("Ver tudo")).toBeTruthy();
});

test("toggle options show Portuguese while the stored value stays English", () => {
  const { getByText } = portuguese(<ToggleGroup value="Not Allowed" options={["Allowed", "Not Allowed", "Share-Alike"]} onChange={() => {}} />);
  expect(getByText("Não permitido")).toBeTruthy();
  expect(getByText("Permitido")).toBeTruthy();
});

test("an empty state translates the title and description it is given in English", () => {
  const { getByText } = portuguese(
    <EmptyOrError isLoading={false} isEmpty emptyTitle="No offers sent yet" emptyDescription="Browse the marketplace to make offers on assets." />,
  );
  expect(getByText("Nenhuma oferta enviada ainda")).toBeTruthy();
});

test("tables of marked sentences render translated", () => {
  const features = portuguese(<DiscoverFeatures />);
  expect(features.getByText("Resistência à censura")).toBeTruthy();
  cleanup();
  const drop = portuguese(<DropFeatures />);
  expect(drop.getByText("Edição ou coleção")).toBeTruthy();
});
