import { buildAssetMetadata, type BuildAssetMetadataInput } from "@medialane/sdk";
import type { DraftTrait } from "./draft.js";

export const MAX_DROP_SUPPLY = 2000;
export const MAX_DROP_METADATA_BYTES = 5 * 1024 * 1024;

export type DropKind = "edition" | "collection";

export type DropLicense = Record<
  keyof Pick<BuildAssetMetadataInput, "ipType" | "licenseType" | "commercialUse" | "derivatives" | "attribution" | "geographicScope" | "aiPolicy" | "royalty">,
  string
>;

export interface DropMetadataInput {
  name: string;
  description: string;
  externalUrl: string;
  creator: string;
  coverUri: string | null;
  license: DropLicense;
  assets: { name: string; description: string; imageUri: string; animationUrl?: string | null; copies: number; traits: DraftTrait[] }[];
  order: number[];
}

export interface DropMetadataFile {
  name: string;
  content: unknown;
}

function secureRandom(n: number): number {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value! % n;
}

export function tokenOrder(copies: number[], mix: boolean, random: (n: number) => number = secureRandom): number[] {
  const order = copies.flatMap((count, asset) => Array.from({ length: count }, () => asset));
  if (!mix) return order;
  for (let i = order.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}

export function buildDropMetadataFiles(input: DropMetadataInput): DropMetadataFile[] {
  const externalUrl = input.externalUrl.trim() || null;
  const seen = input.assets.map(() => 0);
  const files: DropMetadataFile[] = input.order.map((index, i) => {
    const id = i + 1;
    const asset = input.assets[index]!;
    seen[index]! += 1;
    const content = buildAssetMetadata({
      ...input.license,
      name: asset.name.trim() || `${input.name} #${id}`,
      description: asset.description.trim() || input.description,
      externalUrl,
      imageUri: asset.imageUri,
      creator: input.creator,
      edition: asset.copies > 1 ? `${seen[index]}/${asset.copies}` : null,
      templateTraits: asset.traits.map((t) => ({ traitType: t.key, value: t.value })),
    });
    return { name: String(id), content: asset.animationUrl ? { ...content, animation_url: asset.animationUrl } : content };
  });
  files.push({
    name: "collection.json",
    content: {
      name: input.name,
      description: input.description,
      image: input.coverUri ?? input.assets[0]?.imageUri ?? null,
      ...(externalUrl ? { external_link: externalUrl } : {}),
      drop_kind: (input.assets.length > 1 ? "collection" : "edition") satisfies DropKind,
    },
  });
  return files;
}

export function metadataBytes(files: DropMetadataFile[]): number {
  return files.reduce((n, f) => n + JSON.stringify(f.content).length, 0);
}
