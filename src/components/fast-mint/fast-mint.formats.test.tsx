import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
const actualUpload = await import("../../utils/ipfs-upload.js");
mock.module("../../utils/ipfs-upload.js", () => ({
  ...actualUpload,
  uploadFileToIpfs: async () => ({ uri: "ipfs://uploaded" }),
}));

const { FastMint } = await import("./fast-mint.js");
const { MedialaneAppProvider } = await import("../medialane-app.js");

afterEach(() => cleanup());

const client = {} as MedialaneClient;
const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: "0xabc", onRequireWallet: () => {} };

async function renderWithFile(extra: Partial<Parameters<typeof FastMint>[0]> = {}) {
  const view = render(
    <MedialaneAppProvider value={app}>
      <FastMint
        collections={[]}
        refetchCollections={async () => []}
        hasWallet
        walletAddress="0xabc"
        onRequireWallet={() => {}}
        getUploadToken={async () => "token"}
        getSigner={() => { throw new Error("unused"); }}
        client={client}
        {...extra}
      />
    </MedialaneAppProvider>,
  );
  const input = view.container.querySelector("input[type=file]") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "poster.png", { type: "image/png" })] } });
  await waitFor(() => expect(view.getByRole("radiogroup")).toBeTruthy());
  await waitFor(() => expect(view.getByText("Uploaded")).toBeTruthy());
  return view;
}

test("after the upload the creator picks what to make, with Single NFT chosen", async () => {
  const view = await renderWithFile();
  const radios = view.getAllByRole("radio");
  expect(radios.map((r) => r.textContent?.split(/(?=One copy|Numbered|A badge|Tickets|Membership)/)[0])).toEqual([
    "Single NFT", "Limited Editions", "POP badge", "IP Ticket", "IP Club",
  ]);
  expect(view.getByRole("radio", { name: /Single NFT/ }).getAttribute("aria-checked")).toBe("true");
  expect(view.getByRole("button", { name: "Mint NFT" })).toBeTruthy();
});

test("Limited Editions asks for the number of copies and mints editions", async () => {
  const view = await renderWithFile();
  fireEvent.click(view.getByRole("radio", { name: /Limited Editions/ }));
  expect(view.getByText("Number of copies")).toBeTruthy();
  expect(view.getByRole("button", { name: "Mint Editions" })).toBeTruthy();
});

for (const [label, route] of [["POP badge", "/launchpad/pop/create"], ["IP Ticket", "/launchpad/tickets/create"], ["IP Club", "/launchpad/club/create"]] as const) {
  test(`${label} continues to its create page with the title and the uploaded file`, async () => {
    const navigated: string[] = [];
    let closed = 0;
    const view = await renderWithFile({ onNavigate: (href) => { navigated.push(href); }, onClose: () => { closed++; } });
    fireEvent.change(view.getByPlaceholderText("My Creative Work"), { target: { value: "Summer Fest" } });
    fireEvent.click(view.getByRole("radio", { name: new RegExp(label) }));
    expect(view.queryByRole("button", { name: "Mint NFT" })).toBeNull();
    expect(view.queryByText("Licensing Terms")).toBeNull();
    fireEvent.click(view.getByRole("button", { name: `Continue to ${label}` }));
    expect(navigated).toEqual([`${route}?name=Summer+Fest&image=ipfs%3A%2F%2Fuploaded`]);
    expect(closed).toBe(1);
  });
}

test("switching back to Single NFT brings the minting form back", async () => {
  const view = await renderWithFile();
  fireEvent.click(view.getByRole("radio", { name: /POP badge/ }));
  fireEvent.click(view.getByRole("radio", { name: /Single NFT/ }));
  expect(view.getByText("Licensing Terms")).toBeTruthy();
  expect(view.getByRole("button", { name: "Mint NFT" })).toBeTruthy();
});
