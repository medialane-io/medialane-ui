import { buildAssetMetadata, UserFacingError, type ApiClient, type BuildAssetMetadataInput } from "@medialane/sdk";

export const FILE_UPLOAD_FAILED =
  "We couldn't upload your file. Check your connection and try again, or choose a different file.";

function uploadFailed(cause: unknown): UserFacingError {
  return Object.assign(new UserFacingError(FILE_UPLOAD_FAILED), { cause });
}

export interface UploadedIpfsFile {
  cid: string;
  uri: string;
}

export type SignedUploadKind = "image" | "document" | "media";

export interface UploadDiagnostics {
  kind: SignedUploadKind;
  fileSize: number;
  fileType: string;
  failedAfterMs: number;
  error: string;
  fileReadable: string;
  uploadHostReachable: string;
  retry: string;
  online: boolean | null;
  connection: string | null;
}

let reportDiagnostics: ((diagnostics: UploadDiagnostics) => void) | null = null;

export function setUploadDiagnosticsReporter(reporter: ((diagnostics: UploadDiagnostics) => void) | null): void {
  reportDiagnostics = reporter;
}

function describe(err: unknown): string {
  const text = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return text.slice(0, 300);
}

function connectionType(): string | null {
  if (typeof navigator === "undefined") return null;
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  return connection?.effectiveType ?? null;
}

async function signedUploadUrl(api: ApiClient, kind: SignedUploadKind): Promise<string> {
  const signedUrl = (await api.metadata.signedUrl(kind)).data?.url;
  if (!signedUrl) throw new Error("Failed to prepare the upload");
  return signedUrl;
}

function postFile(signedUrl: string, file: File): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("network", "public");
  formData.append("name", file.name);
  return fetch(signedUrl, { method: "POST", body: formData });
}

async function uploadedFile(res: Response): Promise<UploadedIpfsFile> {
  const uploadJson = (await res.json().catch(() => ({}))) as { data?: { cid?: string } };
  const cid = uploadJson.data?.cid;
  if (!res.ok || !cid) {
    throw uploadFailed(new Error(`File upload returned HTTP ${res.status}${cid ? "" : " without a cid"}`));
  }
  return { cid, uri: `ipfs://${cid}` };
}

async function recoverUpload(
  api: ApiClient,
  file: File,
  kind: SignedUploadKind,
  signedUrl: string,
  err: unknown,
  failedAfterMs: number,
): Promise<UploadedIpfsFile> {
  const diagnostics: UploadDiagnostics = {
    kind,
    fileSize: file.size,
    fileType: file.type,
    failedAfterMs,
    error: describe(err),
    fileReadable: "not checked",
    uploadHostReachable: "not checked",
    retry: "not attempted",
    online: typeof navigator === "undefined" ? null : navigator.onLine,
    connection: connectionType(),
  };

  let copy: File | null = null;
  try {
    copy = new File([await file.arrayBuffer()], file.name, { type: file.type });
    diagnostics.fileReadable = "ok";
  } catch (readErr) {
    diagnostics.fileReadable = describe(readErr);
  }

  try {
    await fetch(new URL(signedUrl).origin, { mode: "no-cors", cache: "no-store" });
    diagnostics.uploadHostReachable = "ok";
  } catch (probeErr) {
    diagnostics.uploadHostReachable = describe(probeErr);
  }

  let result: UploadedIpfsFile | null = null;
  if (copy) {
    try {
      result = await uploadedFile(await postFile(await signedUploadUrl(api, kind), copy));
      diagnostics.retry = "ok";
    } catch (retryErr) {
      diagnostics.retry = describe(retryErr instanceof UserFacingError && retryErr.cause ? retryErr.cause : retryErr);
    }
  }

  try {
    reportDiagnostics?.(diagnostics);
  } catch {}

  if (result) return result;
  throw Object.assign(uploadFailed(err), { diagnostics });
}

export async function uploadFileToIpfs(
  api: ApiClient,
  file: File,
  kind: SignedUploadKind = "image",
): Promise<UploadedIpfsFile> {
  const signedUrl = await signedUploadUrl(api, kind);
  const startedAt = Date.now();
  let uploadRes: Response;
  try {
    uploadRes = await postFile(signedUrl, file);
  } catch (err) {
    return recoverUpload(api, file, kind, signedUrl, err, Date.now() - startedAt);
  }
  return uploadedFile(uploadRes);
}

export async function uploadJsonToIpfs(api: ApiClient, payload: unknown): Promise<string> {
  const uri = (await api.metadata.upload(payload as Record<string, unknown>)).data?.url;
  if (!uri) throw new Error("Metadata upload failed");
  return uri;
}

export function uploadDirectoryToIpfs(
  api: ApiClient,
  files: { name: string; content: unknown }[],
): Promise<{ cid: string; baseUri: string }> {
  return api.metadata.uploadDirectory(files);
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
