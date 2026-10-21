import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { AssetLightbox } from "./asset-lightbox.js";

afterEach(() => cleanup());

test("the zoomed image is not held to the small dialog width on wide screens", () => {
  render(<AssetLightbox open onOpenChange={() => {}} image="https://example.com/a.png" alt="Loop" />);
  const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
  expect(dialog).toBeTruthy();
  expect(dialog.className).not.toContain("sm:max-w-lg");
  expect(dialog.className).toContain("sm:max-w-[96vw]");
});
