import {
  Music, Palette, FileText, Hexagon, Clapperboard, Camera,
  MessageSquare, BookOpen, Building2,
  Music2, AudioLines, Youtube, Video, Twitter, Instagram, Facebook, Globe,
  type LucideIcon,
} from "lucide-react";
import type { IPType } from "./ip.js";
import { msg } from "../i18n/translate.js";

export type EmbedPlatform = "spotify" | "soundcloud" | "youtube" | "tiktok" | "vimeo";

export const EMBED_PLATFORM_META: Record<
  EmbedPlatform,
  { label: string; icon: LucideIcon; traitKey: string; placeholder: string }
> = {
  spotify:    { label: "Spotify",    icon: Music2,     traitKey: "Spotify URL",    placeholder: "https://open.spotify.com/…" },
  soundcloud: { label: "SoundCloud", icon: AudioLines, traitKey: "SoundCloud URL", placeholder: "https://soundcloud.com/…" },
  youtube:    { label: "YouTube",    icon: Youtube,    traitKey: "YouTube URL",    placeholder: "https://youtube.com/watch?v=…" },
  tiktok:     { label: "TikTok",     icon: Video,      traitKey: "TikTok URL",     placeholder: "https://tiktok.com/@…/video/…" },
  vimeo:      { label: "Vimeo",      icon: Video,      traitKey: "Vimeo URL",      placeholder: "https://vimeo.com/…" },
};

export type SocialPlatform = "x" | "instagram" | "facebook" | "tiktok" | "website";

export const SOCIAL_PLATFORM_META: Record<
  SocialPlatform,
  { label: string; icon: LucideIcon; traitKey: string; placeholder: string }
> = {
  x:         { label: "X",         icon: Twitter,   traitKey: "X",         placeholder: "https://x.com/…" },
  instagram: { label: "Instagram", icon: Instagram, traitKey: "Instagram", placeholder: "https://instagram.com/…" },
  facebook:  { label: msg("Facebook"),  icon: Facebook,  traitKey: "Facebook",  placeholder: "https://facebook.com/…" },
  tiktok:    { label: "TikTok",    icon: Video,     traitKey: "TikTok",    placeholder: "https://tiktok.com/@…" },
  website:   { label: "Website",   icon: Globe,     traitKey: "Website",   placeholder: "https://…" },
};

export interface TraitSuggestion {
  key: string;
  placeholder?: string;
  options?: string[];
}

export interface DocUploadConfig {

  traitType: string;


  hint: string;
}

export interface IPTemplate {
  type: IPType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: { bg: string; text: string; border: string };
  embeds?: EmbedPlatform[];
  socials?: SocialPlatform[];
  traitSuggestions?: TraitSuggestion[];

  docUpload?: DocUploadConfig;
}

export const DOC_UPLOAD: DocUploadConfig = {
  traitType: "Document File",
  hint: msg("A dated copy saved permanently"),
};

export const IP_TEMPLATES: Record<IPType, IPTemplate> = {
  Audio: {
    type: "Audio",
    label: msg("Audio"),
    description: msg("Music and podcasts"),
    icon: Music,
    color: { bg: "bg-brand-blue/10", text: "text-brand-blue", border: "border-brand-blue/20" },
    embeds: ["spotify", "soundcloud"],
    traitSuggestions: [
      { key: "Artist" }, { key: "Genre", placeholder: msg("Soundtrack") }, { key: "Mood" }, { key: "Label" },
    ],
  },
  Video: {
    type: "Video",
    label: msg("Video"),
    description: msg("Films and animations"),
    icon: Clapperboard,
    color: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
    embeds: ["youtube", "tiktok", "vimeo"],
    traitSuggestions: [
      { key: "Director" }, { key: "Genre" }, { key: "Cast" }, { key: "Studio" },
    ],
  },
  Art: {
    type: "Art",
    label: msg("Art"),
    description: msg("Artwork and illustrations"),
    icon: Palette,
    color: { bg: "bg-brand-purple/10", text: "text-brand-purple", border: "border-brand-purple/20" },
    traitSuggestions: [
      { key: "Medium", placeholder: msg("Oil on canvas") },
      { key: "Style", placeholder: msg("Impressionism") },
      { key: "Materials" },
      { key: "Series" },
    ],
  },
  Photography: {
    type: "Photography",
    label: msg("Photography"),
    description: msg("Photography"),
    icon: Camera,
    color: { bg: "bg-brand-orange/10", text: "text-brand-orange", border: "border-brand-orange/20" },
    traitSuggestions: [
      { key: "Camera", placeholder: msg("Sony A7 IV") },
      { key: "Location" },
      { key: "Series" },
      { key: "Edition" },
    ],
  },
  Posts: {
    type: "Posts",
    label: msg("Posts"),
    description: msg("Articles and essays"),
    icon: MessageSquare,
    color: { bg: "bg-brand-blue/10", text: "text-brand-blue", border: "border-brand-blue/20" },
    socials: ["x", "instagram", "facebook", "tiktok", "website"],
    traitSuggestions: [
      { key: "Author" }, { key: "Topic" }, { key: "Category" },
    ],
  },
  Publications: {
    type: "Publications",
    label: msg("Publications"),
    description: msg("Books and papers"),
    icon: BookOpen,
    color: { bg: "bg-brand-purple/10", text: "text-brand-purple", border: "border-brand-purple/20" },
    docUpload: DOC_UPLOAD,
    socials: ["x", "instagram", "website"],
    traitSuggestions: [
      { key: "Author" }, { key: "Publisher" }, { key: "Language", placeholder: msg("English") }, { key: "Edition" },
    ],
  },
  Documents: {
    type: "Documents",
    label: msg("Documents"),
    description: msg("Contracts and reports"),
    icon: FileText,
    color: { bg: "bg-muted/10", text: "text-muted-foreground", border: "border-muted/20" },
    docUpload: DOC_UPLOAD,
    traitSuggestions: [
      { key: "Author" }, { key: "Category" }, { key: "Language", placeholder: msg("English") },
    ],
  },
  NFT: {
    type: "NFT",
    label: msg("NFT"),
    description: msg("Digital collectibles"),
    icon: Hexagon,
    color: { bg: "bg-brand-blue/10", text: "text-brand-blue", border: "border-brand-blue/20" },
    traitSuggestions: [
      { key: "Collection" },
      { key: "Edition" },
      { key: "Rarity", options: ["Common", "Uncommon", "Rare", "Epic", "Legendary"] },
    ],
  },
  RWA: {
    type: "RWA",
    label: msg("Real world asset"),
    description: msg("Physical items with a digital record"),
    icon: Building2,
    color: { bg: "bg-brand-blue/10", text: "text-brand-blue", border: "border-brand-blue/20" },
    traitSuggestions: [
      { key: "Asset Type" }, { key: "Location" }, { key: "Category" },
    ],
  },
};

export const TEMPLATE_TRAIT_TYPES = new Set<string>([
  "IP Type",
  DOC_UPLOAD.traitType,
  ...Object.values(EMBED_PLATFORM_META).map((m) => m.traitKey),
  ...Object.values(SOCIAL_PLATFORM_META).map((m) => m.traitKey),
  ...Object.values(IP_TEMPLATES).flatMap((t) => (t.traitSuggestions ?? []).map((s) => s.key)),
]);
