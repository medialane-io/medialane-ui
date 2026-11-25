import { expect, test, mock, afterEach, afterAll } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { hash } from "starknet";
import { getCoordinates, getService, normalizeAddress } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
const actualUpload = { ...(await import("../../utils/ipfs-upload.js")) };
mock.module("../../utils/ipfs-upload.js", () => ({
  ...actualUpload,
  uploadFileToIpfs: async () => ({ uri: "ipfs://uploaded" }),
}));
afterAll(() => { mock.module("../../utils/ipfs-upload.js", () => actualUpload); });

const { FastMint } = await import("./fast-mint.js");
const { MedialaneAppProvider } = await import("../medialane-app.js");

afterEach(() => cleanup());

const selector = (name: string) => hash.getSelectorFromName(name);
const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const TICKETS_FACTORY = getService("ip-tickets")?.onchain?.STARKNET?.factoryAddress ?? "0x1";
const REGISTRY = getCoordinates("STARKNET").collection721;

interface Scenario {
  receipts?: Record<number, unknown[]>;
  failExecuteOn?: number[];
  collections?: unknown[];
}

function setup(scenario: Scenario = {}) {
  const intents: Array<{ kind: string; params: Record<string, unknown> }> = [];
  const uploads: Array<Record<string, unknown>> = [];
  let executes = 0;
  const hashes: string[] = [];

  const client = {
    provider: {
      getTransactionReceipt: async (txHash: string) => ({ execution_status: "SUCCEEDED", events: scenario.receipts?.[hashes.indexOf(txHash) + 1] ?? [] }),
      callContract: async () => ["0x0", "0x0", "0x0", "0x0", "0x0", "0xaa", "0xbb"],
    },
    api: {
      metadata: { upload: async (m: Record<string, unknown>) => { uploads.push(m); return { data: { url: `ipfs://meta${uploads.length}` } }; } },
      intents: {
        create: async (kind: string, params: Record<string, unknown>) => {
          intents.push({ kind, params });
          return { id: `i${intents.length}`, requiresSignature: false, calls: [{}] };
        },
        confirm: async () => ({}),
        syncTransaction: async () => ({ pending: false }),
      },
      chainReads: { ticketCount: async () => 0, clubMembershipCount: async () => 0 },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;

  const signer = {
    address: ME,
    execute: async () => {
      executes++;
      if (scenario.failExecuteOn?.includes(executes)) throw new Error("User rejected request");
      const txHash = `0x${executes}`;
      hashes.push(txHash);
      return { txHash };
    },
    signTypedData: async () => [],
  };
  const app = { getClient: () => client, getSigner: () => signer, walletAddress: ME, onRequireWallet: () => {} };

  const view = render(
    <MedialaneAppProvider value={app}>
      <FastMint
        collections={(scenario.collections ?? []) as never[]}
        refetchCollections={async () => []}
        hasWallet
        walletAddress={ME}
        onRequireWallet={() => {}}
        getUploadToken={async () => "token"}
        getSigner={() => signer}
        client={client}
      />
    </MedialaneAppProvider>,
  );
  return { view, intents, uploads, executed: () => executes };
}

async function withFile(scenario?: Scenario) {
  const ctx = setup(scenario);
  const input = ctx.view.container.querySelector("input[type=file]") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "poster.png", { type: "image/png" })] } });
  await waitFor(() => expect(ctx.view.getByRole("radiogroup")).toBeTruthy());
  await waitFor(() => expect(ctx.view.getByText("Uploaded")).toBeTruthy());
  return ctx;
}

const pick = (view: ReturnType<typeof render>, name: RegExp) => fireEvent.click(view.getByRole("radio", { name }));
const title = (view: ReturnType<typeof render>, value: string) =>
  fireEvent.change(view.getByPlaceholderText("My Creative Work"), { target: { value } });
const button = (view: ReturnType<typeof render>, name: string) => view.getByRole("button", { name: new RegExp(name) }) as HTMLButtonElement;

test("after the upload the creator picks what to make, with Single NFT chosen", async () => {
  const { view } = await withFile();
  expect(view.getAllByRole("radio").map((r) => r.getAttribute("aria-checked"))).toEqual(["true", "false", "false", "false", "false"]);
  for (const label of ["Single NFT", "Limited Editions", "Immutable certificate", "IP Ticket", "IP Club"]) {
    expect(view.getByRole("radio", { name: new RegExp(label) })).toBeTruthy();
  }
  expect(view.getByRole("button", { name: "Mint NFT" })).toBeTruthy();
});

test("every format keeps the title, description and link, with nothing dropped when switching", async () => {
  const { view } = await withFile();
  fireEvent.change(view.getByPlaceholderText(/The story behind the work/), { target: { value: "A poster" } });
  for (const label of [/Immutable certificate/, /IP Ticket/, /IP Club/, /Limited Editions/, /Single NFT/]) {
    pick(view, label);
    expect(view.getByPlaceholderText("My Creative Work")).toBeTruthy();
    expect((view.getByPlaceholderText(/The story behind the work/) as HTMLTextAreaElement).value).toBe("A poster");
    expect(view.getByPlaceholderText("https://yourwebsite.com")).toBeTruthy();
  }
});

test("each format shows its own part of the form", async () => {
  const { view } = await withFile();
  expect(view.getByText("License terms")).toBeTruthy();
  pick(view, /Limited Editions/);
  expect(view.getByText("Number of copies")).toBeTruthy();
  pick(view, /Immutable certificate/);
  expect(view.getByText("What kind of event is this?")).toBeTruthy();
  expect(view.queryByText("License terms")).toBeNull();
  pick(view, /IP Ticket/);
  expect(view.getByText("Number of tickets *")).toBeTruthy();
  expect(view.getByText("License terms")).toBeTruthy();
  pick(view, /IP Club/);
  expect(view.getByText("Number of memberships *")).toBeTruthy();
});

test("a certificate is created in place, with its metadata, symbol and deadline", async () => {
  const { view, intents, uploads } = await withFile();
  pick(view, /Immutable certificate/);
  title(view, "Rio Summit");
  fireEvent.change(view.getByPlaceholderText(/The story behind the work/), { target: { value: "Conference poster" } });
  await waitFor(() => expect(button(view, "Create certificate").disabled).toBe(false));
  fireEvent.click(button(view, "Create certificate"));
  await waitFor(() => expect(view.getByText("Certificate created")).toBeTruthy());

  expect(uploads[0]).toMatchObject({
    name: "Rio Summit",
    description: "Conference poster",
    image: "ipfs://uploaded",
    attributes: [{ trait_type: "Visibility", value: "Private" }, { trait_type: "Event Type", value: "Conference" }],
  });
  expect(intents).toHaveLength(1);
  expect(intents[0]!.kind).toBe("create-collection");
  expect(intents[0]!.params).toMatchObject({ owner: ME, name: "Rio Summit", baseUri: "ipfs://meta1", service: "pop-protocol" });
  expect(typeof intents[0]!.params.claimEndTimestamp).toBe("number");
  expect(view.getByText("Open POP").closest("a")?.getAttribute("href")).toBe("/launchpad/pop");
});

test("a certificate needs a valid symbol and a claim window that closes in the future", async () => {
  const { view } = await withFile();
  pick(view, /Immutable certificate/);
  title(view, "Rio Summit");
  await waitFor(() => expect(button(view, "Create certificate").disabled).toBe(false));
  fireEvent.change(view.getByLabelText("Claim window closing date"), { target: { value: "2001-01-01" } });
  expect(button(view, "Create certificate").disabled).toBe(true);
  fireEvent.change(view.getByLabelText("Claim window closing date"), { target: { value: "2099-01-01" } });
  expect(button(view, "Create certificate").disabled).toBe(false);
  fireEvent.change(view.getByPlaceholderText("SKHACK"), { target: { value: "A-B" } });
  expect(button(view, "Create certificate").disabled).toBe(true);
});

test("tickets: a new collection is created, then the tickets are minted, in one flow", async () => {
  const deployed = { from_address: TICKETS_FACTORY, keys: [selector("CollectionDeployed"), "0xdead"] };
  const { view, intents, executed } = await withFile({ receipts: { 1: [deployed] } });
  pick(view, /IP Ticket/);
  fireEvent.click(view.getByRole("button", { name: "New" }));
  title(view, "Summer Concert");
  await waitFor(() => expect(button(view, "Create tickets").disabled).toBe(false));
  fireEvent.click(button(view, "Create tickets"));
  await waitFor(() => expect(view.getByText("Tickets minted")).toBeTruthy());

  expect(executed()).toBe(2);
  expect(intents.map((i) => i.kind)).toEqual(["create-collection", "create-tier", "mint"]);
  const contract = normalizeAddress("STARKNET", "0xdead");
  expect(intents[0]!.params).toMatchObject({ owner: ME, name: "Summer Concert", service: "ip-tickets" });
  expect(intents[1]!.params).toMatchObject({ owner: ME, collection: contract, service: "ip-tickets", maxSupply: "100" });
  expect(intents[2]!.params).toMatchObject({ collectionContract: contract, tokenId: "1", amount: "100", recipient: ME });
  expect(view.getByText("View collection").closest("a")?.getAttribute("href")).toContain(contract);
});

test("if the second step fails, the collection is kept and the retry only finishes the tickets", async () => {
  const deployed = { from_address: TICKETS_FACTORY, keys: [selector("CollectionDeployed"), "0xdead"] };
  const { view, intents, executed } = await withFile({ receipts: { 1: [deployed] }, failExecuteOn: [2] });
  pick(view, /IP Ticket/);
  fireEvent.click(view.getByRole("button", { name: "New" }));
  title(view, "Summer Concert");
  await waitFor(() => expect(button(view, "Create tickets").disabled).toBe(false));
  fireEvent.click(button(view, "Create tickets"));
  await waitFor(() => expect(view.getByText(/Your ticket collection was created, but the last step did not finish\./)).toBeTruthy());
  expect(view.getByText(/Nothing was submitted/)).toBeTruthy();
  expect(button(view, "Create tickets").disabled).toBe(false);

  fireEvent.click(button(view, "Create tickets"));
  await waitFor(() => expect(view.getByText("Tickets minted")).toBeTruthy());
  expect(intents.filter((i) => i.kind === "create-collection")).toHaveLength(1);
  expect(executed()).toBe(3);
});

test("a club needs its own supply and creates the membership in the club it just made", async () => {
  const deployed = { from_address: getService("ip-club")?.onchain?.STARKNET?.factoryAddress ?? "0x1", keys: [selector("ClubDeployed"), "0xc1ab"] };
  const { view, intents } = await withFile({ receipts: { 1: [deployed] } });
  pick(view, /IP Club/);
  fireEvent.click(view.getByRole("button", { name: "New" }));
  title(view, "Rio Club");
  fireEvent.change(view.getByLabelText("Number of memberships *"), { target: { value: "0" } });
  expect(button(view, "Create membership").disabled).toBe(true);
  fireEvent.change(view.getByLabelText("Number of memberships *"), { target: { value: "25" } });
  await waitFor(() => expect(button(view, "Create membership").disabled).toBe(false));
  fireEvent.click(button(view, "Create membership"));
  await waitFor(() => expect(view.getByText("Membership created")).toBeTruthy());
  expect(intents[0]!.params).toMatchObject({ service: "ip-club" });
  expect(intents[1]!.params).toMatchObject({ service: "ip-club", maxSupply: "25" });
});

test("a single NFT in a new collection reads the new collection from the receipt, with no waiting on the index", async () => {
  const created = { from_address: REGISTRY, keys: [selector("CollectionCreated"), "0x5", "0x0"] };
  const minted = { from_address: "0xbb", keys: [selector("IPMinted"), "0x7", "0x0"] };
  const { view, intents } = await withFile({ receipts: { 1: [created], 2: [minted] } });
  fireEvent.click(view.getByRole("button", { name: "New" }));
  title(view, "Sunset");
  await waitFor(() => expect(button(view, "Mint NFT").disabled).toBe(false));
  fireEvent.click(button(view, "Mint NFT"));
  await waitFor(() => expect(view.getByText("Asset published")).toBeTruthy());

  expect(intents.map((i) => i.kind)).toEqual(["create-collection", "mint"]);
  expect(intents[1]!.params).toMatchObject({ collectionId: "5", owner: ME, recipient: ME });
  expect(view.getByText("View asset").closest("a")?.getAttribute("href")).toBe(`/asset/STARKNET/${normalizeAddress("STARKNET", "0xbb")}/7`);
});

test("limited editions mint the number of copies into a new editions collection", async () => {
  const deployed = { from_address: getService("mip-erc1155")?.onchain?.STARKNET?.factoryAddress ?? "0x1", keys: [selector("CollectionDeployed"), "0xed17"] };
  const { view, intents } = await withFile({ receipts: { 1: [deployed] } });
  pick(view, /Limited Editions/);
  fireEvent.click(view.getByRole("button", { name: "New" }));
  title(view, "Prints");
  fireEvent.change(view.getByLabelText(/Number of copies/) as HTMLInputElement, { target: { value: "50" } });
  await waitFor(() => expect(button(view, "Mint editions").disabled).toBe(false));
  fireEvent.click(button(view, "Mint editions"));
  await waitFor(() => expect(view.getByText("Asset published")).toBeTruthy());
  expect(intents[1]!.params).toMatchObject({ value: "50", collectionContract: normalizeAddress("STARKNET", "0xed17") });
});

test("a link that is not http or https is refused before anything is sent", async () => {
  const { view, intents } = await withFile();
  fireEvent.click(view.getByRole("button", { name: "New" }));
  title(view, "Sunset");
  fireEvent.change(view.getByPlaceholderText("https://yourwebsite.com"), { target: { value: "ftp://x" } });
  await waitFor(() => expect(button(view, "Mint NFT").disabled).toBe(false));
  fireEvent.click(button(view, "Mint NFT"));
  await waitFor(() => expect(view.getByText("External link must start with http:// or https://")).toBeTruthy());
  expect(intents).toEqual([]);
});

const choose = (view: ReturnType<typeof render>, collection: string) => {
  fireEvent.click(view.getByRole("button", { name: /Choose a collection/ }));
  fireEvent.click(view.getByRole("button", { name: new RegExp(collection) }));
};

test("a single NFT is minted into a collection the creator already has, with one confirmation", async () => {
  const minted = { from_address: "0xbb", keys: [selector("IPMinted"), "0x9", "0x0"] };
  const mine = { service: "mip-erc721", collectionId: "42", contractAddress: "0xbb", name: "My Photos", totalSupply: 3 };
  const { view, intents, executed } = await withFile({ collections: [mine], receipts: { 1: [minted] } });
  choose(view, "My Photos");
  title(view, "Sunset");
  await waitFor(() => expect(button(view, "Mint NFT").disabled).toBe(false));
  fireEvent.click(button(view, "Mint NFT"));
  await waitFor(() => expect(view.getByText("Asset published")).toBeTruthy());
  expect(executed()).toBe(1);
  expect(intents.map((i) => i.kind)).toEqual(["mint"]);
  expect(intents[0]!.params).toMatchObject({ collectionId: "42", owner: ME, recipient: ME });
});

test("tickets are minted into a ticket collection the creator already has, and other collections are not offered", async () => {
  const tickets = { service: "ip-tickets", collectionId: "7", contractAddress: "0x71c", name: "Festival Tickets", totalSupply: 0 };
  const photos = { service: "mip-erc721", collectionId: "42", contractAddress: "0xbb", name: "My Photos", totalSupply: 3 };
  const { view, intents, executed } = await withFile({ collections: [tickets, photos] });
  pick(view, /IP Ticket/);
  fireEvent.click(view.getByRole("button", { name: /Choose a collection/ }));
  expect(view.queryByRole("button", { name: /My Photos/ })).toBeNull();
  fireEvent.click(view.getByRole("button", { name: /Festival Tickets/ }));
  title(view, "Day pass");
  await waitFor(() => expect(button(view, "Create tickets").disabled).toBe(false));
  fireEvent.click(button(view, "Create tickets"));
  await waitFor(() => expect(view.getByText("Tickets minted")).toBeTruthy());
  expect(executed()).toBe(1);
  expect(intents.map((i) => i.kind)).toEqual(["create-tier", "mint"]);
  expect(intents[0]!.params).toMatchObject({ collection: "0x71c", service: "ip-tickets" });
});
