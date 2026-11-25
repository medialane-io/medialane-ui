import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { useFileUpload, type FileUploadOptions } from "../utils/use-file-upload.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
(globalThis as { URL: typeof URL }).URL.createObjectURL = () => "blob:preview";
(globalThis as { URL: typeof URL }).URL.revokeObjectURL = () => {};

const { ImageUploadField } = await import("./image-upload-field.js");

afterEach(() => cleanup());

function Harness({ options, currentImage }: { options: FileUploadOptions; currentImage?: string }) {
  const upload = useFileUpload(options);
  return <ImageUploadField upload={upload} label="Cover" currentImage={currentImage} />;
}

const input = (view: ReturnType<typeof render>) => view.container.querySelector('input[type="file"]') as HTMLInputElement;
const pick = (view: ReturnType<typeof render>) =>
  fireEvent.change(input(view), { target: { files: [new File(["x"], "cover.png", { type: "image/png" })] } });

test("a failure is announced inside the field with a retry that reuses the file", async () => {
  let attempts = 0;
  const view = render(<Harness options={{ failureMessage: "Image upload failed", upload: async () => { attempts += 1; if (attempts === 1) throw new Error("service down"); return "ipfs://a"; } }} />);
  pick(view);
  await waitFor(() => expect(view.getByRole("alert").textContent).toBe("Image upload failed: service down"));
  expect(view.getByRole("group").contains(view.getByRole("alert"))).toBe(true);
  expect(view.getByRole("group").getAttribute("data-status")).toBe("failed");
  expect(view.queryByText("✓ Uploaded")).toBeNull();
  fireEvent.click(view.getByText("Retry"));
  await waitFor(() => expect(view.getByText("✓ Uploaded")).toBeTruthy());
  expect(view.queryByRole("alert")).toBeNull();
  expect(attempts).toBe(2);
});

test("the picker is emptied so the same file can be chosen again", async () => {
  const view = render(<Harness options={{ upload: async () => "ipfs://a" }} />);
  let cleared = false;
  Object.defineProperty(input(view), "value", { configurable: true, get: () => "", set: (value: string) => { if (value === "") cleared = true; } });
  pick(view);
  await waitFor(() => expect(view.getByText("✓ Uploaded")).toBeTruthy());
  expect(cleared).toBe(true);
});

test("a file that cannot be used offers no retry", async () => {
  const view = render(<Harness options={{ validate: () => "Choose an image.", upload: async () => "ipfs://a" }} />);
  pick(view);
  await waitFor(() => expect(view.getByRole("alert").textContent).toBe("Choose an image."));
  expect(view.queryByText("Retry")).toBeNull();
});

test("a saved image can be removed", () => {
  const changes: (string | null)[] = [];
  const view = render(<Harness currentImage="https://img.example/a.png" options={{ upload: async () => "ipfs://a", onChange: (uri) => changes.push(uri) }} />);
  expect(view.getByText("Change")).toBeTruthy();
  fireEvent.click(view.getByText("Remove"));
  expect(changes).toEqual([null]);
});
