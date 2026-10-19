import { test, expect, mock } from "bun:test";
import { UserFacingError, type ApiClient } from "@medialane/sdk";
import {
  uploadFileToIpfs,
  uploadJsonToIpfs,
  uploadDirectoryToIpfs,
  uploadFailureToast,
  isUserRejection,
  FILE_UPLOAD_FAILED,
  setUploadDiagnosticsReporter,
  type UploadDiagnostics,
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
  await expect(uploadFileToIpfs(fakeApi(), new File(["x"], "a.png"))).rejects.toThrow(FILE_UPLOAD_FAILED);
});

test("an upload the browser cannot read says the file was not uploaded and keeps the cause", async () => {
  global.fetch = mock(async () => { throw new TypeError("Load failed"); }) as unknown as typeof fetch;
  const err = await uploadFileToIpfs(fakeApi(), new File(["x"], "a.jpg")).catch((e) => e);
  expect(err).toBeInstanceOf(UserFacingError);
  expect(err.message).toBe(FILE_UPLOAD_FAILED);
  expect((err.cause as Error).message).toBe("Load failed");
});

test("a rejected upload keeps the HTTP status as the cause", async () => {
  global.fetch = mock(async () => ({ ok: false, status: 413, json: async () => ({}) } as Response)) as unknown as typeof fetch;
  const err = await uploadFileToIpfs(fakeApi(), new File(["x"], "a.jpg")).catch((e) => e);
  expect(err.message).toBe(FILE_UPLOAD_FAILED);
  expect((err.cause as Error).message).toContain("413");
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

function unreadableFile(): File {
  const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => {
      throw new DOMException("The file could not be read", "NotReadableError");
    },
  });
  return file;
}

test("a failed upload is retried once with a fresh signed URL and a copy of the file", async () => {
  const reports: UploadDiagnostics[] = [];
  setUploadDiagnosticsReporter((d) => reports.push(d));
  const urls: string[] = [];
  let posts = 0;
  global.fetch = mock(async (_url: unknown, init?: RequestInit) => {
    if (init?.method !== "POST") return { ok: true } as Response;
    posts += 1;
    if (posts === 1) throw new TypeError("Failed to fetch");
    return { ok: true, json: async () => ({ data: { cid: "bafyretry" } }) } as Response;
  }) as unknown as typeof fetch;
  const api = fakeApi({
    getMetadataSignedUrl: async () => {
      urls.push("signed");
      return { data: { url: `https://upload.example/signed/${urls.length}` } };
    },
  });

  const result = await uploadFileToIpfs(api, new File(["xyz"], "a.jpg", { type: "image/jpeg" }));

  expect(result).toEqual({ cid: "bafyretry", uri: "ipfs://bafyretry" });
  expect(urls.length).toBe(2);
  expect(reports.length).toBe(1);
  expect(reports[0]).toMatchObject({
    kind: "image",
    fileSize: 3,
    fileType: "image/jpeg",
    error: "TypeError: Failed to fetch",
    fileReadable: "ok",
    uploadHostReachable: "ok",
    retry: "ok",
  });
  setUploadDiagnosticsReporter(null);
});

test("an upload that keeps failing reports every check and carries the diagnostics on the error", async () => {
  const reports: UploadDiagnostics[] = [];
  setUploadDiagnosticsReporter((d) => reports.push(d));
  global.fetch = mock(async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch;

  const err = await uploadFileToIpfs(fakeApi(), new File(["x"], "a.jpg", { type: "image/jpeg" })).catch((e) => e);

  expect(err.message).toBe(FILE_UPLOAD_FAILED);
  expect(err.diagnostics).toMatchObject({
    fileReadable: "ok",
    uploadHostReachable: "TypeError: Failed to fetch",
    retry: "TypeError: Failed to fetch",
  });
  expect(reports).toEqual([err.diagnostics]);
  setUploadDiagnosticsReporter(null);
});

test("a file the browser can no longer read is reported and not retried", async () => {
  const reports: UploadDiagnostics[] = [];
  setUploadDiagnosticsReporter((d) => reports.push(d));
  let signedUrls = 0;
  global.fetch = mock(async (_url: unknown, init?: RequestInit) => {
    if (init?.method === "POST") throw new TypeError("Failed to fetch");
    return { ok: true } as Response;
  }) as unknown as typeof fetch;
  const api = fakeApi({
    getMetadataSignedUrl: async () => {
      signedUrls += 1;
      return { data: { url: "https://upload.example/signed" } };
    },
  });

  const err = await uploadFileToIpfs(api, unreadableFile()).catch((e) => e);

  expect(err.message).toBe(FILE_UPLOAD_FAILED);
  expect(signedUrls).toBe(1);
  expect(reports[0]).toMatchObject({
    fileReadable: "NotReadableError: The file could not be read",
    uploadHostReachable: "ok",
    retry: "not attempted",
  });
  setUploadDiagnosticsReporter(null);
});

test("a reporter that throws does not change the upload result", async () => {
  setUploadDiagnosticsReporter(() => {
    throw new Error("reporter down");
  });
  global.fetch = mock(async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch;

  const err = await uploadFileToIpfs(fakeApi(), new File(["x"], "a.jpg")).catch((e) => e);

  expect(err.message).toBe(FILE_UPLOAD_FAILED);
  setUploadDiagnosticsReporter(null);
});
