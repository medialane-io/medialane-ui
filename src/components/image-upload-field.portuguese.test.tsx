import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MedialaneApiError } from "@medialane/sdk";
import type { MedialaneApp } from "./medialane-app.js";
import { loadCatalog } from "../i18n/catalogs.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
(globalThis as { URL: typeof URL }).URL.createObjectURL = () => "blob:preview";
(globalThis as { URL: typeof URL }).URL.revokeObjectURL = () => {};

const { I18nProvider } = await import("../i18n/provider.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");
const { ImageUploadField } = await import("./image-upload-field.js");
const { useImageUpload } = await import("../utils/use-image-upload.js");

const messages = await loadCatalog("pt");

afterEach(() => cleanup());

const app = {
  getClient: () => ({ api: { metadata: { signedUrl: async () => { throw new MedialaneApiError(403, "server wording", undefined, undefined, "/v1/metadata/signed-url", "uploads_unavailable"); } } } }),
  walletAddress: "0x1",
  onRequireWallet: () => {},
} as unknown as MedialaneApp;

function Field() {
  return <ImageUploadField upload={useImageUpload()} label="Capa" />;
}

const view = () => render(
  <I18nProvider locale="pt" messages={messages}>
    <MedialaneAppProvider value={app}><Field /></MedialaneAppProvider>
  </I18nProvider>,
);

const pick = (rendered: ReturnType<typeof render>, file: File) =>
  fireEvent.change(rendered.container.querySelector('input[type="file"]')!, { target: { files: [file] } });

test("an unavailable upload service is explained in Portuguese, not in the server's words", async () => {
  const rendered = view();
  pick(rendered, new File(["x"], "capa.png", { type: "image/png" }));
  await waitFor(() => expect(rendered.getByRole("alert").textContent).toBe(
    "Falha no envio da imagem: Os envios estão temporariamente indisponíveis. Tente novamente mais tarde. Se o erro continuar, fale com o nosso suporte.",
  ));
});

test("a refused file type is explained in Portuguese", async () => {
  const rendered = view();
  pick(rendered, new File(["x"], "capa.heic", { type: "image/heic" }));
  await waitFor(() => expect(rendered.getByRole("alert").textContent).toBe("Escolha uma imagem em JPG, JPEG, PNG, GIF, SVG, WEBP ou AVIF."));
});
