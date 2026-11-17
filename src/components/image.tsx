"use client";

import { useEffect, useRef, useState } from "react";
import NextImage, { type ImageProps } from "next/image";
import { cn } from "../utils/cn.js";
import { useImageUrl } from "../utils/use-image-url.js";

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 6;

export default function Image({ onError, className, src, ...props }: ImageProps) {
  const resolveImage = useImageUrl();
  const shown = typeof src === "string" && src.startsWith("ipfs://") ? (resolveImage(src) ?? src) : src;
  const [attempt, setAttempt] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <NextImage
      key={attempt}
      {...props}
      src={shown}
      className={cn(className, waiting && "invisible")}
      onLoad={(event) => {
        setWaiting(false);
        props.onLoad?.(event);
      }}
      onError={(event) => {
        if (attempt >= MAX_RETRIES) {
          setWaiting(false);
          onError?.(event);
          return;
        }
        setWaiting(true);
        timer.current = setTimeout(() => setAttempt(attempt + 1), RETRY_DELAY_MS);
      }}
    />
  );
}
