import { Play, Music, Radio, FileText, Link2 } from "lucide-react";
import type { ComponentType } from "react";
import { msg } from "../i18n/translate.js";

export interface ContentTypeConfig {
  icon: ComponentType<{ className?: string }>;
  cta: string;
}

export const GATED_CONTENT_TYPES: Record<string, ContentTypeConfig> = {
  VIDEO:    { icon: Play,     cta: msg("Watch now") },
  AUDIO:    { icon: Music,    cta: msg("Listen now") },
  STREAM:   { icon: Radio,    cta: msg("Watch live") },
  DOCUMENT: { icon: FileText, cta: msg("Open document") },
  LINK:     { icon: Link2,    cta: msg("Access content") },
};

export const GATED_CONTENT_TYPE_FALLBACK = GATED_CONTENT_TYPES.LINK;
