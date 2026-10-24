import { test, expect } from "bun:test";
import { UPLOAD_LIMITS, acceptFor, uploadError } from "./upload-limits.js";

const MB = 1024 * 1024;

test("kinds keep their own types", () => {
  expect(UPLOAD_LIMITS.image.mimeTypes).not.toContain("video/mp4");
  expect(UPLOAD_LIMITS.media.mimeTypes).toContain("video/mp4");
});

test("uploadError accepts the kind's types", () => {
  expect(uploadError({ size: 1000, type: "image/png" })).toBeNull();
  expect(uploadError({ size: 1000, type: "image/avif" })).toBeNull();
});

test("uploadError names the accepted types for anything else", () => {
  expect(uploadError({ size: 1000, type: "image/heic" })).toBe("Choose an image in JPG, JPEG, PNG, GIF, SVG, WEBP or AVIF.");
  expect(uploadError({ size: 1000, type: "", name: "x.exe" }, "document")).toBe("Choose a file in PDF, DOC, DOCX, ODT, RTF, TXT or MD.");
});

test("a file without a browser type is accepted by its extension", () => {
  expect(uploadError({ size: 1000, type: "", name: "notes.MD" }, "document")).toBeNull();
});

test("uploadError checks the size after the type", () => {
  expect(uploadError({ size: 95 * MB, type: "image/png" })).toBe("That image is 95 MB. Please choose one under 90 MB.");
});

test("acceptFor lists the types then the extensions", () => {
  expect(acceptFor("image").startsWith("image/jpeg,")).toBe(true);
  expect(acceptFor("image").endsWith(",.avif")).toBe(true);
});
