import { buildAssetMetadata, type BuildAssetMetadataInput } from "@medialane/sdk";

export interface UploadedIpfsFile {
  cid: string;
  uri: string;
}

export type SignedUploadKind = "image" | "document" | "media";

export async function uploadFileToIpfs(
  file: File,
  kind: SignedUploadKind = "image",
): Promise<UploadedIpfsFile> {
  const signedRes = await fetch(`/api/proxy/v1/metadata/signed-url?kind=${kind}`);
  const signed = (await signedRes.json().catch(() => ({}))) as {
    data?: { url?: string };
    error?: string;
  };
  const signedUrl = signed.data?.url;
  if (!signedRes.ok || !signedUrl) {
    throw new Error(signed.error ?? "Failed to prepare the upload");
  }

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

export async function uploadJsonToIpfs(payload: unknown): Promise<string> {
  const res = await fetch("/api/proxy/v1/metadata/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    data?: { url?: string };
    error?: string;
  };
  const uri = body.data?.url;
  if (!res.ok || !uri) {
    throw new Error(body.error ?? "Metadata upload failed");
  }

  return uri;
}

export async function uploadDirectoryToIpfs(
  files: { name: string; content: unknown }[],
): Promise<{ cid: string; baseUri: string }> {
  const res = await fetch("/api/proxy/v1/metadata/upload-directory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    data?: { cid?: string; baseUri?: string };
    error?: string;
  };
  if (!res.ok || !body.data?.baseUri || !body.data.cid) {
    throw new Error(body.error ?? "Directory pin failed");
  }
  return { cid: body.data.cid, baseUri: body.data.baseUri };
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

export async function pinAssetMetadata(input: PinAssetMetadataInput): Promise<PinnedAsset> {
  const { imageFile, ...fields } = input;

  let imageUri = fields.imageUri ?? null;
  if (!imageUri && imageFile && imageFile.size > 0) {
    imageUri = (await uploadFileToIpfs(imageFile)).uri;
  }

  const uri = await uploadJsonToIpfs(
    buildAssetMetadata({
      ...fields,
      imageUri,
      externalUrl: fields.externalUrl || "https://medialane.io",
    }),
  );

  return { uri, imageUri };
}
