import { expect, test } from "bun:test";
import { IP_TYPE_BY_KIND, detectMediaKind } from "./media-kind.js";

test("media types map to a kind, and unknown types are refused", () => {
  expect(detectMediaKind("image/png")).toBe("image");
  expect(detectMediaKind("audio/mpeg")).toBe("audio");
  expect(detectMediaKind("video/mp4")).toBe("video");
  expect(detectMediaKind("application/pdf")).toBe("document");
  expect(detectMediaKind("application/x-msdownload")).toBeNull();
  expect(detectMediaKind("image/tiff")).toBeNull();
});

test("each kind starts with its own IP type", () => {
  expect(IP_TYPE_BY_KIND).toEqual({ image: "NFT", audio: "Audio", video: "Video", document: "Documents" });
});
