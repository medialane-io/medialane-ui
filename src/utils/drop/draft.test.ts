import { expect, test } from "bun:test";
import { EMPTY_DRAFT, assetImage, assetKind, assetMedia, assetUploads, draftTokens, firstMissing, hasErrors, newAsset, validateDropDraft, type DropDraft } from "./draft.js";

const NOW = 1_800_000_000;
const png = (name: string) => new File(["x"], `${name}.png`, { type: "image/png" });
const named = (patch: Partial<DropDraft> = {}): DropDraft => ({
  ...EMPTY_DRAFT,
  collection: { ...EMPTY_DRAFT.collection, name: "Drop" },
  assets: [newAsset(png("a"))],
  ...patch,
});

test("an empty draft asks for a collection name and an asset", () => {
  const e = validateDropDraft(EMPTY_DRAFT, NOW);
  expect(e.collection.name).toEqual({ text: "Name the collection" });
  expect(e.assets.list).toEqual({ text: "Add a work" });
  expect(firstMissing(e)).toEqual({ panel: "collection", message: { text: "Name the collection" } });
  expect(hasErrors(e)).toBe(true);
});

test("a named draft with one asset is complete", () => {
  const e = validateDropDraft(named(), NOW);
  expect(hasErrors(e)).toBe(false);
  expect(firstMissing(e)).toBeNull();
});

test("a new asset starts with one copy and no details", () => {
  const a = newAsset(png("a"));
  expect(a).toMatchObject({ name: "", description: "", copies: "1", traits: [] });
  expect(a.file.name).toBe("a.png");
});

test("tokens are the sum of copies and stop at 2,000", () => {
  const d = named({ assets: [{ ...newAsset(png("a")), copies: "1500" }, { ...newAsset(png("b")), copies: "501" }] });
  expect(draftTokens(d)).toBe(2001);
  expect(validateDropDraft(d, NOW).assets.list).toEqual({ text: "Up to {count} copies", vars: { count: "2,000" } });
  expect(firstMissing(validateDropDraft(d, NOW))).toEqual({ panel: "assets", message: { text: "Up to {count} copies", vars: { count: "2,000" } } });
});

test("copies must be a whole number from 1", () => {
  for (const copies of ["", "0", "1.5", "x"]) {
    const a = { ...newAsset(png("a")), copies };
    const e = validateDropDraft(named({ assets: [a] }), NOW);
    expect(e.assets.byId[a.id]?.copies).toEqual({ text: "Enter 1 or more" });
    expect(firstMissing(e)).toEqual({ panel: "assets", message: { text: "Enter 1 or more" } });
  }
});

test("reserved trait names are refused; blank rows are ignored", () => {
  const a = { ...newAsset(png("a")), traits: [{ key: "License", value: "x" }] };
  expect(validateDropDraft(named({ assets: [a] }), NOW).assets.byId[a.id]?.traits).toEqual({ text: "{name} is set by the license terms", vars: { name: "License" } });
  const b = { ...newAsset(png("b")), traits: [{ key: "", value: "" }] };
  expect(validateDropDraft(named({ assets: [b] }), NOW).assets.byId[b.id]).toBeUndefined();
});

test("the external link must start with https://", () => {
  const d = named({ collection: { ...EMPTY_DRAFT.collection, name: "Drop", externalUrl: "http://x" } });
  expect(validateDropDraft(d, NOW).collection.externalUrl).toEqual({ text: "Add a link starting with https://" });
  const ok = named({ collection: { ...EMPTY_DRAFT.collection, name: "Drop", externalUrl: "https://x.io" } });
  expect(validateDropDraft(ok, NOW).collection.externalUrl).toBeUndefined();
});

test("a list drop needs readable wallet addresses; exclusive content needs a link", () => {
  expect(validateDropDraft(named({ listOnly: true, allowlist: "" }), NOW).settings.allowlist).toEqual({ text: "Add at least one wallet address" });
  expect(validateDropDraft(named({ listOnly: true, allowlist: "0x1\nnope" }), NOW).settings.allowlist).toEqual({ text: "Not wallet addresses: {lines}", vars: { lines: "nope" } });
  expect(validateDropDraft(named({ gated: { enabled: true, title: "", url: "ftp://x", type: "" } }), NOW).settings.gated).toEqual({ text: "Add a link starting with https://" });
});

test("sale errors land in settings", () => {
  const e = validateDropDraft(named({ sale: { ...EMPTY_DRAFT.sale, paid: true, price: "" } }), NOW);
  expect(e.settings.price).toEqual({ text: "Enter a price above 0" });
  expect(firstMissing(e)).toEqual({ panel: "settings", message: { text: "Enter a price above 0" } });
});

test("video, audio and PDF assets need a feature image; images do not", () => {
  const video = newAsset(new File(["x"], "wave.mp4", { type: "video/mp4" }));
  const e = validateDropDraft(named({ assets: [video] }), NOW);
  expect(e.assets.byId[video.id]?.feature).toEqual({ text: "Add a cover image" });
  expect(firstMissing(e)).toEqual({ panel: "assets", message: { text: "Add a cover image" } });
  const withFeature = { ...video, feature: png("cover") };
  expect(validateDropDraft(named({ assets: [withFeature] }), NOW).assets.byId[video.id]).toBeUndefined();
  const image = newAsset(png("a"));
  expect(image.feature).toBeNull();
  expect(validateDropDraft(named({ assets: [image] }), NOW).assets.byId[image.id]).toBeUndefined();
});

test("each asset reports its media kind and the image that represents it", () => {
  const image = newAsset(png("a"));
  expect(assetKind(image)).toBe("image");
  expect(assetImage(image)).toBe(image.file);
  const audio = { ...newAsset(new File(["x"], "song.mp3", { type: "audio/mpeg" })), feature: png("art") };
  expect(assetKind(audio)).toBe("audio");
  expect(assetImage(audio)?.name).toBe("art.png");
  expect(assetKind(newAsset(new File(["x"], "doc.pdf", { type: "application/pdf" })))).toBe("document");
  expect(assetImage(newAsset(new File(["x"], "clip.webm", { type: "video/webm" })))).toBeNull();
});

test("uploads cover each media file and each feature image once", () => {
  const image = newAsset(png("a"));
  const song = { ...newAsset(new File(["x"], "song.mp3", { type: "audio/mpeg" })), feature: png("art") };
  expect(assetUploads([image, song]).map((u) => [u.id, u.file.name])).toEqual([
    [image.id, "a.png"], [song.id, "song.mp3"], [`${song.id}:feature`, "art.png"],
  ]);
});

test("an image asset's image is the file; a media asset's image is its feature and the file is animation_url", () => {
  const image = newAsset(png("a"));
  const song = { ...newAsset(new File(["x"], "song.mp3", { type: "audio/mpeg" })), feature: png("art") };
  const uris: Record<string, string> = { [image.id]: "ipfs://a", [song.id]: "ipfs://song", [`${song.id}:feature`]: "ipfs://art" };
  const uriOf = (id: string) => uris[id] ?? null;
  expect(assetMedia(image, uriOf)).toEqual({ imageUri: "ipfs://a", animationUrl: null });
  expect(assetMedia(song, uriOf)).toEqual({ imageUri: "ipfs://art", animationUrl: "ipfs://song" });
});
