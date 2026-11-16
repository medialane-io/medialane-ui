"use client";

import { useEffect } from "react";
import { FIELD_LIMITS } from "./field-limits.js";

export type HandoffFormat = "pop" | "tickets" | "club";

export const HANDOFF_ROUTES: Record<HandoffFormat, string> = {
  pop: "/launchpad/pop/create",
  tickets: "/launchpad/tickets/create",
  club: "/launchpad/club/create",
};

export interface Handoff {
  name: string;
  imageUri: string;
}

export function handoffHref(format: HandoffFormat, { name, imageUri }: Handoff): string {
  const params = new URLSearchParams();
  if (name.trim()) params.set("name", name.trim());
  params.set("image", imageUri);
  return `${HANDOFF_ROUTES[format]}?${params.toString()}`;
}

export function readHandoff(search: string): Partial<Handoff> | null {
  const params = new URLSearchParams(search);
  const name = (params.get("name") ?? "").trim().slice(0, FIELD_LIMITS.name);
  const image = params.get("image") ?? "";
  const imageUri = image.startsWith("ipfs://") ? image : "";
  if (!name && !imageUri) return null;
  return { ...(name && { name }), ...(imageUri && { imageUri }) };
}

export function useAppliedHandoff(apply: (handoff: Partial<Handoff>) => void) {
  useEffect(() => {
    const handoff = readHandoff(window.location.search);
    if (handoff) apply(handoff);
  }, []);
}
