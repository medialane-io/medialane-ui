"use client";

import { useEffect, useRef, useState } from "react";
import { uploadFailureToast } from "./ipfs-upload.js";
import { useT } from "../i18n/provider.js";
import type { Phrase } from "../i18n/translate.js";

export interface FileUploadOptions {
  upload: (file: File) => Promise<string>;
  validate?: (file: File) => string | Phrase | null;
  failureMessage?: string;
  onChange?: (uri: string | null) => void;
}

export type FileUploadStatus = "empty" | "uploading" | "uploaded" | "failed";

interface UploadState {
  status: FileUploadStatus;
  file: File | null;
  preview: string | null;
  uri: string | null;
  error: string | null;
  canRetry: boolean;
}

const EMPTY: UploadState = { status: "empty", file: null, preview: null, uri: null, error: null, canRetry: false };

export function useFileUpload(options: FileUploadOptions) {
  const t = useT();
  const [state, setState] = useState<UploadState>(EMPTY);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<string | null>(null);
  const attemptRef = useRef(0);

  const release = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
  };

  useEffect(() => () => {
    attemptRef.current += 1;
    release();
  }, []);

  const failureText = (err: unknown) => {
    const failure = uploadFailureToast(err);
    const declined = failure.title !== "Upload failed";
    const title = t(declined ? failure.title : options.failureMessage ?? failure.title);
    return failure.description ? `${title}: ${t(failure.description)}` : title;
  };

  const run = async (file: File, preview: string | null) => {
    const attempt = ++attemptRef.current;
    setState({ status: "uploading", file, preview, uri: null, error: null, canRetry: false });
    try {
      const uri = await options.upload(file);
      if (attempt !== attemptRef.current) return;
      setState({ status: "uploaded", file, preview, uri, error: null, canRetry: false });
      options.onChange?.(uri);
    } catch (err) {
      if (attempt !== attemptRef.current) return;
      setState({ status: "failed", file, preview, uri: null, error: failureText(err), canRetry: true });
    }
  };

  const select = async (file: File) => {
    release();
    const problem = options.validate?.(file);
    if (problem) {
      attemptRef.current += 1;
      setState({ status: "failed", file, preview: null, uri: null, error: typeof problem === "string" ? t(problem) : t(problem.text, problem.vars), canRetry: false });
      return;
    }
    previewRef.current = URL.createObjectURL(file);
    await run(file, previewRef.current);
  };

  const retry = async () => {
    if (state.canRetry && state.file) await run(state.file, state.preview);
  };

  const clear = () => {
    attemptRef.current += 1;
    release();
    const discardingFailure = state.status === "failed";
    setState(EMPTY);
    if (!discardingFailure) options.onChange?.(null);
  };

  const reveal = () => {
    fieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    fieldRef.current?.focus({ preventScroll: true });
  };

  const confirm = (requiredMessage?: string): boolean => {
    if (state.status === "uploading" || state.status === "failed") {
      reveal();
      return false;
    }
    if (requiredMessage && !state.uri) {
      setState((current) => ({ ...current, error: t(requiredMessage) }));
      reveal();
      return false;
    }
    return true;
  };

  return { ...state, uploading: state.status === "uploading", fieldRef, select, retry, clear, confirm };
}

export type FileUpload = ReturnType<typeof useFileUpload>;
