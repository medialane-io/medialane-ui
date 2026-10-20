"use client";

import { useContext } from "react";
import { MedialaneAppContext } from "../components/medialane-app.js";
import { createImageResolver, type ImageResolver } from "./ipfs.js";

const defaultResolver = createImageResolver();

export function useImageUrl(): ImageResolver {
  return useContext(MedialaneAppContext)?.resolveImage ?? defaultResolver;
}
