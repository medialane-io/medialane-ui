export interface UploadedIpfsFile {
  cid: string;
  uri: string;
}

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadFileToIpfs(
  file: File,
  token: string | null,
  kind: "image" | "document" | "media" = "image",
): Promise<UploadedIpfsFile> {
  const signedRes = await fetch("/api/pinata/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ kind }),
  });
  const signed = (await signedRes.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!signedRes.ok || !signed.url) {
    throw new Error(signed.error ?? "Failed to prepare the upload");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("network", "public");
  formData.append("name", file.name);

  const uploadRes = await fetch(signed.url, { method: "POST", body: formData });
  const uploadJson = (await uploadRes.json().catch(() => ({}))) as { data?: { cid?: string } };
  const cid = uploadJson.data?.cid;
  if (!uploadRes.ok || !cid) {
    throw new Error("Upload to IPFS failed");
  }

  return { cid, uri: `ipfs://${cid}` };
}

export async function uploadJsonToIpfs(payload: unknown, token: string | null): Promise<string> {
  const res = await fetch("/api/pinata/json", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { uri?: string; error?: string };

  if (!res.ok || !data.uri) {
    throw new Error(data.error ?? "Metadata upload failed");
  }

  return data.uri;
}

export function isUserRejection(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /reject|denied|declin|abort|cancel|refus/i.test(msg);
}

export function uploadFailureToast(err: unknown): { title: string; description?: string } {
  if (isUserRejection(err)) {
    return {
      title: "Signature declined",
      description:
        "Uploads need a one-time, free sign-in signature — it's not a transaction and costs nothing. Try again and approve the request in your wallet.",
    };
  }
  return {
    title: "Upload failed",
    description: err instanceof Error ? err.message : undefined,
  };
}
