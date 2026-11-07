"use client";

import { useEffect, useRef, useState } from "react";
import { uploadFailureToast } from "../../utils/ipfs-upload.js";

export function useIpfsUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const previewRef = useRef<string | null>(null);

  const revoke = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
  };

  useEffect(() => revoke, []);

  const start = async (file: File, upload: (file: File) => Promise<string>, onError: (message: string) => void) => {
    revoke();
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setPreview(objectUrl);
    setUri(null);
    setUploading(true);
    try {
      setUri(await upload(file));
    } catch (err) {
      const toast = uploadFailureToast(err);
      onError(toast.description ?? toast.title);
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    revoke();
    setPreview(null);
    setUri(null);
  };

  return { preview, uri, uploading, start, clear };
}
