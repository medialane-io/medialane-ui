"use client";

import { useMedialaneApp } from "../components/medialane-app.js";
import { uploadFileToIpfs } from "./ipfs-upload.js";
import { uploadError } from "./upload-limits.js";
import { useFileUpload, type FileUploadOptions } from "./use-file-upload.js";
import { msg } from "../i18n/translate.js";

const SLOW_AFTER_MS = 60_000;

export function useImageUpload({ onChange }: Pick<FileUploadOptions, "onChange"> = {}) {
  const app = useMedialaneApp();

  const upload = async (file: File) => {
    await app.ensureSignedIn?.();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const slow = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("the image service is slow right now — please try again")), SLOW_AFTER_MS);
    });
    try {
      return (await Promise.race([uploadFileToIpfs(app.getClient().api, file, "image"), slow])).uri;
    } finally {
      clearTimeout(timer);
    }
  };

  return useFileUpload({
    upload,
    validate: (file) => uploadError(file, "image"),
    failureMessage: msg("Image upload failed"),
    onChange,
  });
}
