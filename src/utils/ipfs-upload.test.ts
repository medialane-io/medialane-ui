import { test, expect, mock } from "bun:test";
import {
  uploadFileToIpfs,
  uploadJsonToIpfs,
  uploadDirectoryToIpfs,
  uploadFailureToast,
  isUserRejection,
} from "./ipfs-upload.js";

function mockFetchSequence(responses: { ok: boolean; json: unknown }[]) {
  let i = 0;
  return mock(async () => {
    const r = responses[i++]!;
    return { ok: r.ok, json: async () => r.json } as Response;
  });
}

test("uploadFileToIpfs gets a signed URL then uploads and returns the cid/uri", async () => {
  global.fetch = mockFetchSequence([
    { ok: true, json: { data: { url: "https://upload.example/signed" } } },
    { ok: true, json: { data: { cid: "bafyabc" } } },
  ]) as unknown as typeof fetch;

  const result = await uploadFileToIpfs(new File(["x"], "a.png"), "image");
  expect(result).toEqual({ cid: "bafyabc", uri: "ipfs://bafyabc" });
});

test("uploadFileToIpfs throws when the signed-url request fails", async () => {
  global.fetch = mockFetchSequence([{ ok: false, json: { error: "gateway down" } }]) as unknown as typeof fetch;
  await expect(uploadFileToIpfs(new File(["x"], "a.png"))).rejects.toThrow("gateway down");
});

test("uploadFileToIpfs throws when the upload step returns no cid", async () => {
  global.fetch = mockFetchSequence([
    { ok: true, json: { data: { url: "https://upload.example/signed" } } },
    { ok: true, json: {} },
  ]) as unknown as typeof fetch;
  await expect(uploadFileToIpfs(new File(["x"], "a.png"))).rejects.toThrow("Upload to IPFS failed");
});

test("uploadJsonToIpfs returns the uri on success", async () => {
  global.fetch = mock(async () => ({ ok: true, json: async () => ({ data: { url: "ipfs://metaCid" } }) } as Response)) as unknown as typeof fetch;
  const uri = await uploadJsonToIpfs({ name: "x" });
  expect(uri).toBe("ipfs://metaCid");
});

test("uploadJsonToIpfs throws with the server's error message on failure", async () => {
  global.fetch = mock(async () => ({ ok: false, json: async () => ({ error: "bad payload" }) } as Response)) as unknown as typeof fetch;
  await expect(uploadJsonToIpfs({})).rejects.toThrow("bad payload");
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

test("an upload asks the proxy for its signed url, never a pinata route", async () => {
  const seen: string[] = [];
  global.fetch = mock(async (url: string) => {
    seen.push(String(url));
    return {
      ok: true,
      json: async () =>
        seen.length === 1 ? { data: { url: "https://upload.example/signed" } } : { data: { cid: "bafy" } },
    } as Response;
  }) as unknown as typeof fetch;

  await uploadFileToIpfs(new File(["x"], "a.png"));
  expect(seen[0]).toBe("/api/proxy/v1/metadata/signed-url?kind=image");
});

test("a directory pin returns what the proxy reports", async () => {
  global.fetch = mock(async () => ({
    ok: true,
    json: async () => ({ data: { cid: "bafydir", baseUri: "ipfs://bafydir/" } }),
  } as Response)) as unknown as typeof fetch;

  expect(await uploadDirectoryToIpfs([{ name: "1", content: {} }])).toEqual({
    cid: "bafydir",
    baseUri: "ipfs://bafydir/",
  });
});
