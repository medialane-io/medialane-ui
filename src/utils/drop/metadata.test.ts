import { describe, expect, test } from "bun:test";
import { MAX_DROP_METADATA_BYTES, MAX_DROP_SUPPLY, buildDropMetadataFiles, metadataBytes, tokenOrder, type DropMetadataInput } from "./metadata.js";

const asset = { name: "", description: "", imageUri: "ipfs://a", copies: 1, traits: [] };
const base: DropMetadataInput = {
  name: "Neon Tides", description: "Waves", externalUrl: "", creator: "0x1", coverUri: null,
  license: { ipType: "Art", licenseType: "CC BY-SA", commercialUse: "Yes", derivatives: "Share-Alike", attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Allowed", royalty: "0" },
  assets: [asset],
  order: [0],
};
type Meta = { name: string; description: string; image: string; external_url: string; attributes: { trait_type: string; value: string }[] };
const meta = (files: { content: unknown }[], n: number) => files[n - 1]!.content as Meta;
const collectionFile = (files: { name: string; content: unknown }[]) => files.find((f) => f.name === "collection.json")!.content as Record<string, unknown>;

describe("token order", () => {
  test("grid order repeats each asset by its copies", () => {
    expect(tokenOrder([2, 1], false)).toEqual([0, 0, 1]);
  });

  test("mixed order keeps every asset's count", () => {
    const order = tokenOrder([3, 2, 1], true);
    expect(order).toHaveLength(6);
    expect([0, 1, 2].map((i) => order.filter((x) => x === i).length)).toEqual([3, 2, 1]);
  });

  test("mixed order uses the random source", () => {
    expect(tokenOrder([1, 1, 1], true, () => 0)).not.toEqual([0, 1, 2]);
  });
});

describe("drop metadata files", () => {
  test("token files: asset name or numbered default, own or collection description, edition only with copies", () => {
    const files = buildDropMetadataFiles({
      ...base,
      assets: [{ ...asset, copies: 2 }, { ...asset, name: "Moon", description: "Night", imageUri: "ipfs://b", copies: 1 }],
      order: [0, 1, 0],
    });
    expect(files.map((f) => f.name)).toEqual(["1", "2", "3", "collection.json"]);
    expect(meta(files, 1).name).toBe("Neon Tides #1");
    expect(meta(files, 2).name).toBe("Moon");
    expect(meta(files, 2).description).toBe("Night");
    expect(meta(files, 2).image).toBe("ipfs://b");
    expect(meta(files, 3).name).toBe("Neon Tides #3");
    expect(meta(files, 3).description).toBe("Waves");
    expect(meta(files, 1).attributes).toContainEqual({ trait_type: "Edition", value: "1/2" });
    expect(meta(files, 3).attributes).toContainEqual({ trait_type: "Edition", value: "2/2" });
    expect(meta(files, 2).attributes.some((a) => a.trait_type === "Edition")).toBe(false);
  });

  test("asset traits and the external link reach the token", () => {
    const files = buildDropMetadataFiles({ ...base, externalUrl: "https://neon.art", assets: [{ ...asset, traits: [{ key: "Mood", value: "Calm" }] }] });
    expect(meta(files, 1).attributes).toContainEqual({ trait_type: "Mood", value: "Calm" });
    expect(meta(files, 1).external_url).toBe("https://neon.art");
  });

  test("collection.json: cover or first image, external link, kind by asset count", () => {
    const one = collectionFile(buildDropMetadataFiles(base));
    expect(one).toEqual({ name: "Neon Tides", description: "Waves", image: "ipfs://a", drop_kind: "edition" });
    const two = collectionFile(buildDropMetadataFiles({
      ...base, coverUri: "ipfs://cover", externalUrl: "https://neon.art",
      assets: [asset, { ...asset, imageUri: "ipfs://b" }], order: [0, 1],
    }));
    expect(two).toEqual({ name: "Neon Tides", description: "Waves", image: "ipfs://cover", external_link: "https://neon.art", drop_kind: "collection" });
  });

  test("the largest drop fits the upload limit", () => {
    const files = buildDropMetadataFiles({
      ...base, name: "N".repeat(100), description: "D".repeat(500),
      assets: [{ ...asset, copies: MAX_DROP_SUPPLY }], order: tokenOrder([MAX_DROP_SUPPLY], false),
    });
    expect(files).toHaveLength(MAX_DROP_SUPPLY + 1);
    expect(metadataBytes(files)).toBeLessThan(MAX_DROP_METADATA_BYTES);
  });
});
