import { afterEach, expect, test } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useFileUpload, type FileUploadOptions } from "./use-file-upload.js";

const created: string[] = [];
const revoked: string[] = [];
(globalThis as { URL: typeof URL }).URL.createObjectURL = () => { const url = `blob:${created.length}`; created.push(url); return url; };
(globalThis as { URL: typeof URL }).URL.revokeObjectURL = (url: string) => { revoked.push(url); };

afterEach(() => cleanup());

const png = (name = "cover.png") => new File(["x"], name, { type: "image/png" });

function setup(options: Partial<FileUploadOptions> = {}) {
  return renderHook(() => useFileUpload({ upload: async (file) => `ipfs://${file.name}`, ...options }));
}

test("a picked file is uploaded and its address kept", async () => {
  const view = setup();
  await act(() => view.result.current.select(png()));
  expect(view.result.current.status).toBe("uploaded");
  expect(view.result.current.uri).toBe("ipfs://cover.png");
  expect(view.result.current.preview).toStartWith("blob:");
  expect(view.result.current.error).toBeNull();
});

test("a failed upload says why and retries the same file", async () => {
  const attempts: string[] = [];
  const view = setup({
    failureMessage: "Image upload failed",
    upload: async (file) => {
      attempts.push(file.name);
      if (attempts.length === 1) throw new Error("service down");
      return "ipfs://second";
    },
  });
  await act(() => view.result.current.select(png()));
  expect(view.result.current.status).toBe("failed");
  expect(view.result.current.error).toBe("Image upload failed: service down");
  expect(view.result.current.canRetry).toBe(true);
  await act(() => view.result.current.retry());
  expect(attempts).toEqual(["cover.png", "cover.png"]);
  expect(view.result.current.uri).toBe("ipfs://second");
  expect(view.result.current.error).toBeNull();
});

test("a file that does not pass the check is not uploaded and cannot be retried", async () => {
  let uploads = 0;
  const view = setup({ validate: () => "Choose an image.", upload: async () => { uploads += 1; return "ipfs://x"; } });
  await act(() => view.result.current.select(png()));
  expect(uploads).toBe(0);
  expect(view.result.current.status).toBe("failed");
  expect(view.result.current.error).toBe("Choose an image.");
  expect(view.result.current.canRetry).toBe(false);
  expect(view.result.current.preview).toBeNull();
});

test("a result that arrives after the file was removed is ignored", async () => {
  let finish: (uri: string) => void = () => {};
  const changes: (string | null)[] = [];
  const view = setup({ upload: () => new Promise<string>((resolve) => { finish = resolve; }), onChange: (uri) => changes.push(uri) });
  let pending: Promise<void> = Promise.resolve();
  act(() => { pending = view.result.current.select(png()); });
  act(() => view.result.current.clear());
  await act(async () => { finish("ipfs://late"); await pending; });
  expect(view.result.current.status).toBe("empty");
  expect(view.result.current.uri).toBeNull();
  expect(changes).not.toContain("ipfs://late");
});

test("the owner hears about uploads and removals, and a failed pick can be discarded quietly", async () => {
  const changes: (string | null)[] = [];
  let fail = false;
  const view = setup({ upload: async () => { if (fail) throw new Error("down"); return "ipfs://a"; }, onChange: (uri) => changes.push(uri) });
  await act(() => view.result.current.select(png()));
  act(() => view.result.current.clear());
  fail = true;
  await act(() => view.result.current.select(png()));
  act(() => view.result.current.clear());
  expect(changes).toEqual(["ipfs://a", null]);
});

test("submitting is allowed with nothing picked unless the file is required", async () => {
  const view = setup();
  let allowed = false;
  act(() => { allowed = view.result.current.confirm(); });
  expect(allowed).toBe(true);
  act(() => { allowed = view.result.current.confirm("Add an image."); });
  expect(allowed).toBe(false);
  expect(view.result.current.error).toBe("Add an image.");
});

test("submitting is held back after a failure and the field is brought into view", async () => {
  const view = setup({ upload: async () => { throw new Error("down"); } });
  const field = document.createElement("div");
  field.tabIndex = -1;
  document.body.appendChild(field);
  let scrolled = 0;
  field.scrollIntoView = () => { scrolled += 1; };
  view.result.current.fieldRef.current = field;
  await act(() => view.result.current.select(png()));
  let allowed = true;
  act(() => { allowed = view.result.current.confirm(); });
  expect(allowed).toBe(false);
  expect(scrolled).toBe(1);
  expect(document.activeElement).toBe(field);
  field.remove();
});

test("previews are released when replaced or removed", async () => {
  revoked.length = 0;
  const view = setup();
  await act(() => view.result.current.select(png("a.png")));
  const first = view.result.current.preview!;
  await act(() => view.result.current.select(png("b.png")));
  const second = view.result.current.preview!;
  act(() => view.result.current.clear());
  expect(revoked).toEqual([first, second]);
});
