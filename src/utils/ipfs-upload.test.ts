import { test, expect, mock } from "bun:test";
import { uploadFileToIpfs, uploadJsonToIpfs, uploadFailureToast, isUserRejection } from "./ipfs-upload.js";

function mockFetchSequence(responses: { ok: boolean; json: unknown }[]) {
  let i = 0;
  return mock(async () => {
    const r = responses[i++]!;
    return { ok: r.ok, json: async () => r.json } as Response;
  });
}

test("uploadFileToIpfs gets a signed URL then uploads and returns the cid/uri", async () => {
  global.fetch = mockFetchSequence([
    { ok: true, json: { url: "https://upload.example/signed" } },
    { ok: true, json: { data: { cid: "bafyabc" } } },
  ]) as unknown as typeof fetch;

  const result = await uploadFileToIpfs(new File(["x"], "a.png"), "tok", "image");
  expect(result).toEqual({ cid: "bafyabc", uri: "ipfs://bafyabc" });
});

test("uploadFileToIpfs throws when the signed-url request fails", async () => {
  global.fetch = mockFetchSequence([{ ok: false, json: { error: "no token" } }]) as unknown as typeof fetch;
  await expect(uploadFileToIpfs(new File(["x"], "a.png"), null)).rejects.toThrow("no token");
});

test("uploadFileToIpfs throws when the upload step returns no cid", async () => {
  global.fetch = mockFetchSequence([
    { ok: true, json: { url: "https://upload.example/signed" } },
    { ok: true, json: {} },
  ]) as unknown as typeof fetch;
  await expect(uploadFileToIpfs(new File(["x"], "a.png"), "tok")).rejects.toThrow("Upload to IPFS failed");
});

test("uploadJsonToIpfs returns the uri on success", async () => {
  global.fetch = mock(async () => ({ ok: true, json: async () => ({ uri: "ipfs://metaCid" }) } as Response)) as unknown as typeof fetch;
  const uri = await uploadJsonToIpfs({ name: "x" }, "tok");
  expect(uri).toBe("ipfs://metaCid");
});

test("uploadJsonToIpfs throws with the server's error message on failure", async () => {
  global.fetch = mock(async () => ({ ok: false, json: async () => ({ error: "bad payload" }) } as Response)) as unknown as typeof fetch;
  await expect(uploadJsonToIpfs({}, "tok")).rejects.toThrow("bad payload");
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
