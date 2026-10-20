import { LICENSE_TRAIT_TYPES } from "../data/ip.js";
import { EMBED_PLATFORM_META, IP_TEMPLATES, SOCIAL_PLATFORM_META } from "../data/ip-templates.js";
import type { IPType } from "../data/ip.js";

export interface AssetAttribute {
  trait_type?: string;
  value?: string;
}

export function assetAttributes(raw: unknown) {
  const attributes: AssetAttribute[] = Array.isArray(raw) ? (raw as AssetAttribute[]) : [];
  const valueOf = (trait: string) => attributes.find((a) => a.trait_type === trait)?.value ?? null;

  const template = IP_TEMPLATES[(attributes.find((a) => a.trait_type?.toLowerCase() === "ip type")?.value ?? "") as IPType];
  const templateKeys = template
    ? [
        ...(template.embeds ?? []).map((p) => EMBED_PLATFORM_META[p].traitKey),
        ...(template.socials ?? []).map((p) => SOCIAL_PLATFORM_META[p].traitKey),
        ...(template.docUpload ? [template.docUpload.traitType] : []),
      ]
    : [];
  const hidden = new Set<string>(["IP Type", ...templateKeys]);

  return {
    attributes,
    hasTemplateData: templateKeys.some((k) => attributes.some((a) => a.trait_type === k && a.value)),
    isDisplayAttr: (a: AssetAttribute) => !LICENSE_TRAIT_TYPES.has(a.trait_type ?? "") && !hidden.has(a.trait_type ?? ""),
    parentContract: valueOf("Parent Contract"),
    parentTokenId: valueOf("Parent Token ID"),
  };
}
