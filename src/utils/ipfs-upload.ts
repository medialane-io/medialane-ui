import { buildAssetMetadata, type ApiClient, type BuildAssetMetadataInput } from "@medialane/sdk";

export interface UploadedIpfsFile {
  cid: string;
  uri: string;
}

export type SignedUploadKind = "image" | "document" | "media";

export async function uploadFileToIpfs(
  api: ApiClient,
  file: File,
  kind: SignedUploadKind = "image",
): Promise<UploadedIpfsFile> {
  const signedUrl = (await api.getMetadataSignedUrl(kind)).data?.url;
  if (!signedUrl) throw new Error("Failed to prepare the upload");

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("network", "public");
  formData.append("name", file.name);

  const uploadRes = await fetch(signedUrl, { method: "POST", body: formData });
  const uploadJson = (await uploadRes.json().catch(() => ({}))) as { data?: { cid?: string } };
  const cid = uploadJson.data?.cid;
  if (!uploadRes.ok || !cid) {
    throw new Error("Upload to IPFS failed");
  }

  return { cid, uri: `ipfs://${cid}` };
}

export async function uploadJsonToIpfs(api: ApiClient, payload: unknown): Promise<string> {
  const uri = (await api.uploadMetadata(payload as Record<string, unknown>)).data?.url;
  if (!uri) throw new Error("Metadata upload failed");
  return uri;
}

export function uploadDirectoryToIpfs(
  api: ApiClient,
  files: { name: string; content: unknown }[],
): Promise<{ cid: string; baseUri: string }> {
  return api.uploadMetadataDirectory(files);
}

export function isUserRejection(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /reject|denied|declin|abort|cancel|refus/i.test(msg);
}

export function uploadFailureToast(err: unknown): { title: string; description?: string } {
  if (isUserRejection(err)) {
    return {
      title: "Signature declined",
      description: "Try again and approve the request in your wallet.",
    };
  }
  return {
    title: "Upload failed",
    description: err instanceof Error ? err.message : undefined,
  };
}

export interface PinAssetMetadataInput extends Omit<BuildAssetMetadataInput, "registrationDate"> {
  imageFile?: File | null;
}

export interface PinnedAsset {
  uri: string;
  imageUri: string | null;
}

export async function pinAssetMetadata(api: ApiClient, input: PinAssetMetadataInput): Promise<PinnedAsset> {
  const { imageFile, ...fields } = input;

  let imageUri = fields.imageUri ?? null;
  if (!imageUri && imageFile && imageFile.size > 0) {
    imageUri = (await uploadFileToIpfs(api, imageFile)).uri;
  }

  const uri = await uploadJsonToIpfs(
    api,
    buildAssetMetadata({
      ...fields,
      imageUri,
      externalUrl: fields.externalUrl || "https://medialane.io",
    }),
  );

  return { uri, imageUri };
}
