import { test, expect, mock } from "bun:test";
import type { ApiClient } from "@medialane/sdk";
import {
  uploadFileToIpfs,
  uploadJsonToIpfs,
  uploadDirectoryToIpfs,
  uploadFailureToast,
  isUserRejection,
} from "./ipfs-upload.js";

function fakeApi(overrides: Partial<Record<keyof ApiClient, unknown>> = {}): ApiClient {
  return {
    getMetadataSignedUrl: async () => ({ data: { url: "https://upload.example/signed" } }),
    uploadMetadata: async () => ({ data: { cid: "metaCid", url: "ipfs://metaCid" } }),
    uploadMetadataDirectory: async () => ({ cid: "bafydir", baseUri: "ipfs://bafydir/" }),
    ...overrides,
  } as unknown as ApiClient;
}

function pinataReturns(json: unknown) {
  global.fetch = mock(async () => ({ ok: true, json: async () => json } as Response)) as unknown as typeof fetch;
}

test("uploadFileToIpfs gets a signed URL through the SDK, uploads, and returns the cid/uri", async () => {
  pinataReturns({ data: { cid: "bafyabc" } });
  const kinds: unknown[] = [];
  const api = fakeApi({
    getMetadataSignedUrl: async (kind: unknown) => {
      kinds.push(kind);
      return { data: { url: "https://upload.example/signed" } };
    },
  });
  const result = await uploadFileToIpfs(api, new File(["x"], "a.png"), "image");
  expect(result).toEqual({ cid: "bafyabc", uri: "ipfs://bafyabc" });
  expect(kinds).toEqual(["image"]);
});

test("uploadFileToIpfs throws the backend's error when the signed-url request fails", async () => {
  const api = fakeApi({ getMetadataSignedUrl: async () => { throw new Error("gateway down"); } });
  await expect(uploadFileToIpfs(api, new File(["x"], "a.png"))).rejects.toThrow("gateway down");
});

test("uploadFileToIpfs throws when the upload step returns no cid", async () => {
  pinataReturns({});
  await expect(uploadFileToIpfs(fakeApi(), new File(["x"], "a.png"))).rejects.toThrow("Upload to IPFS failed");
});

test("uploadJsonToIpfs returns the uri the SDK reports", async () => {
  expect(await uploadJsonToIpfs(fakeApi(), { name: "x" })).toBe("ipfs://metaCid");
});

test("uploadJsonToIpfs throws with the backend's error message on failure", async () => {
  const api = fakeApi({ uploadMetadata: async () => { throw new Error("bad payload"); } });
  await expect(uploadJsonToIpfs(api, {})).rejects.toThrow("bad payload");
});

test("isUserRejection detects wallet-decline-shaped errors", () => {
  expect(isUserRejection(new Error("User rejected the request"))).toBe(true);
  expect(isUserRejection(new Error("Network error"))).toBe(false);
});

test("uploadFailureToast gives a friendly message for a declined signature", () => {
  const t = uploadFailureToast(new Error("User denied signature"));
  expect(t.title).toBe("Signature declined");
});

test("uploadFailureToast falls back to a generic message otherwise", () => {
  const t = uploadFailureToast(new Error("boom"));
  expect(t.title).toBe("Upload failed");
  expect(t.description).toBe("boom");
});

test("a directory pin returns what the SDK reports", async () => {
  expect(await uploadDirectoryToIpfs(fakeApi(), [{ name: "1", content: {} }])).toEqual({
    cid: "bafydir",
    baseUri: "ipfs://bafydir/",
  });
});
