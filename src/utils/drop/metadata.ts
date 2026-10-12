import { buildAssetMetadata, type BuildAssetMetadataInput } from "@medialane/sdk";

/** The metadata folder upload holds 2,001 files (tokens + collection.json). */
export const MAX_DROP_SUPPLY = 2000;
export const MAX_DROP_METADATA_BYTES = 5 * 1024 * 1024;

export type DropKind = "edition" | "collection";

export type DropLicense = Required<Pick<BuildAssetMetadataInput,
  "ipType" | "licenseType" | "commercialUse" | "derivatives" | "attribution" | "geographicScope" | "aiPolicy" | "royalty">>;

export interface DropMetadataInput {
  kind: DropKind;
  name: string;
  description: string;
  creator: string;
  coverUri: string | null;
  license: DropLicense;
  registrationDate: string;
  /** Edition: the one artwork. Collection: one per token. */
  items: { name: string; description: string; imageUri: string }[];
  /** Edition copies; ignored for a collection. */
  supply: number;
}

export interface DropMetadataFile {
  name: string;
  content: unknown;
}

/** Token files 1…N (token URI = base URI + id) and collection.json. */
export function buildDropMetadataFiles(input: DropMetadataInput): DropMetadataFile[] {
  const edition = input.kind === "edition";
  const count = edition ? input.supply : input.items.length;
  const files: DropMetadataFile[] = [];
  for (let id = 1; id <= count; id++) {
    const item = edition ? input.items[0]! : input.items[id - 1]!;
    files.push({
      name: String(id),
      content: buildAssetMetadata({
        ...input.license,
        name: edition || !item.name ? `${input.name} #${id}` : item.name,
        description: item.description || input.description,
        imageUri: item.imageUri,
        creator: input.creator,
        edition: edition ? `${id}/${count}` : null,
        registrationDate: input.registrationDate,
      }),
    });
  }
  files.push({
    name: "collection.json",
    content: {
      name: input.name,
      description: input.description,
      image: input.coverUri ?? input.items[0]?.imageUri ?? null,
      drop_kind: input.kind,
    },
  });
  return files;
}

/** Size as the upload route counts it. */
export function metadataBytes(files: DropMetadataFile[]): number {
  return files.reduce((n, f) => n + JSON.stringify(f.content).length, 0);
}
