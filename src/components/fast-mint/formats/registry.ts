import { EDITIONS_FORMAT, SINGLE_FORMAT } from "./nft.js";
import { POP_FORMAT } from "./pop.js";
import { CLUB_FORMAT, TICKETS_FORMAT } from "./tiers.js";
import type { FormatDefinition, MintFormat } from "./types.js";

export const FORMATS: readonly FormatDefinition[] = [SINGLE_FORMAT, EDITIONS_FORMAT, POP_FORMAT, TICKETS_FORMAT, CLUB_FORMAT];

export function getFormat(key: MintFormat): FormatDefinition {
  return FORMATS.find((f) => f.key === key)!;
}

export function initialFormatStates(): Record<MintFormat, unknown> {
  return Object.fromEntries(FORMATS.map((f) => [f.key, f.initial()])) as Record<MintFormat, unknown>;
}
