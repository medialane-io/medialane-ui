import { describe, expect, test } from "bun:test";
import { MAX_DROP_METADATA_BYTES, MAX_DROP_SUPPLY, buildDropMetadataFiles, metadataBytes, type DropMetadataInput } from "./metadata.js";

const base: DropMetadataInput = {
  kind: "edition", name: "Neon Tides", description: "Waves", creator: "0x1", coverUri: null,
  license: { ipType: "Art", licenseType: "CC BY-SA", commercialUse: "Yes", derivatives: "Share-Alike", attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Allowed", royalty: "0" },
  items: [{ name: "", description: "", imageUri: "ipfs://art" }],
  supply: 3,
};
const content = (f: { content: unknown }) => f.content as { name: string; image: string; attributes: { trait_type: string; value: string }[] };

describe("drop metadata files", () => {
  test("an edition writes one numbered file per token plus collection.json", () => {
    const files = buildDropMetadataFiles(base);
    expect(files.map((f) => f.name)).toEqual(["1", "2", "3", "collection.json"]);
    expect(content(files[1]!).name).toBe("Neon Tides #2");
    expect(content(files[1]!).image).toBe("ipfs://art");
    expect(content(files[1]!).attributes).toContainEqual({ trait_type: "Edition", value: "2/3" });
    expect(files[3]!.content).toEqual({ name: "Neon Tides", description: "Waves", image: "ipfs://art", drop_kind: "edition" });
  });

  test("a collection writes one file per item, named or numbered", () => {
    const files = buildDropMetadataFiles({
      ...base, kind: "collection", coverUri: "ipfs://cover", supply: 0,
      items: [{ name: "Dawn", description: "d", imageUri: "ipfs://a" }, { name: "", description: "", imageUri: "ipfs://b" }],
    });
    expect(files.map((f) => f.name)).toEqual(["1", "2", "collection.json"]);
    expect(content(files[0]!).name).toBe("Dawn");
    expect(content(files[1]!).name).toBe("Neon Tides #2");
    expect((files[2]!.content as { image: string; drop_kind: string })).toMatchObject({ image: "ipfs://cover", drop_kind: "collection" });
  });

  test("the largest edition fits the upload limit", () => {
    const files = buildDropMetadataFiles({ ...base, name: "N".repeat(100), description: "D".repeat(500), supply: MAX_DROP_SUPPLY });
    expect(files).toHaveLength(MAX_DROP_SUPPLY + 1);
    expect(metadataBytes(files)).toBeLessThan(MAX_DROP_METADATA_BYTES);
  });
});
