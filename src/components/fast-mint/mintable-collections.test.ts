import { test, expect } from "bun:test";
import type { ApiCollection } from "@medialane/sdk";
import { mintableCollections, collectionKey } from "./mintable-collections.js";

const col = (over: Partial<ApiCollection>): ApiCollection => ({
  name: "c", service: "mip-erc721", standard: "ERC721",
  contractAddress: "0xaaa", collectionId: "cid-1",
  ...over,
} as ApiCollection);

test("single editions offer only Medialane ERC721 collections", () => {
  const out = mintableCollections("single", [
    col({ service: "mip-erc721" }),
    col({ service: "external-erc721", standard: "ERC721" }),
    col({ service: "mip-erc1155", standard: "ERC1155" }),
  ]);
  expect(out.map((c) => c.service)).toEqual(["mip-erc721"]);
});

test("limited editions offer only Medialane ERC1155 collections", () => {
  const out = mintableCollections("editions", [
    col({ service: "mip-erc1155", standard: "ERC1155" }),
    col({ service: "external-erc1155", standard: "ERC1155" }),
    col({ service: "ip-tickets", standard: "ERC1155" }),
    col({ service: "mip-erc721" }),
  ]);
  expect(out.map((c) => c.service)).toEqual(["mip-erc1155"]);
});

test("an external collection is never offered, since minting into it is rejected downstream", () => {
  for (const service of ["external-erc721", "external-erc1155"]) {
    expect(mintableCollections("single", [col({ service })])).toEqual([]);
    expect(mintableCollections("editions", [col({ service, standard: "ERC1155" })])).toEqual([]);
  }
});

test("single editions are keyed by collectionId", () => {
  expect(collectionKey("single")(col({ collectionId: "cid-9" }))).toBe("cid-9");
});

test("limited editions are keyed by contract address, because ERC1155 has no collectionId", () => {
  const c = col({ service: "mip-erc1155", standard: "ERC1155", collectionId: null, contractAddress: "0xbbb" } as Partial<ApiCollection>);
  expect(collectionKey("editions")(c)).toBe("0xbbb");
});

test("reading the wrong key for an ERC1155 collection yields nothing, which is the bug this guards", () => {
  const c = col({ service: "mip-erc1155", standard: "ERC1155", collectionId: null } as Partial<ApiCollection>);
  // Every ERC1155 collection in production has a null collectionId, so keying
  // the picker on it made the submit gate see "nothing chosen" forever.
  expect(collectionKey("single")(c)).toBeNull();
  expect(collectionKey("editions")(c)).toBeTruthy();
});
