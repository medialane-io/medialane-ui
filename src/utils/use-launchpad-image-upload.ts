"use client";

import { useEffect, useRef, useState } from "react";
import { uploadError as checkUpload } from "@medialane/sdk";
import { useMedialaneApp } from "../components/medialane-app.js";
import { uploadFileToIpfs } from "./ipfs-upload.js";

interface UseLaunchpadImageUploadOptions {
  successMessage: string;
  failureMessage?: string;
}

export function useLaunchpadImageUpload({ successMessage, failureMessage = "Image upload failed" }: UseLaunchpadImageUploadOptions) {
  const app = useMedialaneApp();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUri(null);
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    const fileError = checkUpload(file, "image");
    if (fileError) {
      setUploadError(fileError);
      return;
    }

    setImageFile(file);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setImagePreview(objectUrl);
    setImageUri(null);
    setImageUploading(true);

    try {
      await app.ensureSignedIn?.();
      const uploaded = await Promise.race([
        uploadFileToIpfs(app.getClient().api, file, "image"),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("the image service is slow right now — please try again")), 60_000),
        ),
      ]);
      setImageUri(uploaded.uri);
      setUploadSuccess(successMessage);
    } catch (error) {
      setImageUri(null);
      const msg = error instanceof Error ? error.message : undefined;
      setUploadError(msg ? `${failureMessage}: ${msg}` : failureMessage);
    } finally {
      setImageUploading(false);
    }
  };

  return {
    imageFile,
    imagePreview,
    imageUri,
    imageUploading,
    uploadError,
    uploadSuccess,
    fileInputRef,
    setImagePreview,
    setImageUri,
    handleImageSelect,
    clearImage,
  };
}
