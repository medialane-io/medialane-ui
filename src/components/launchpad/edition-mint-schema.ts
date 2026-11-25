import * as z from "zod";
import { msg } from "../../i18n/translate.js";
import { FIELD_LIMITS } from "../../utils/field-limits.js";
import { positiveIntegerField, webLinkField } from "../../utils/launchpad-rules.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES } from "../../data/ip.js";

export const editionMintSchema = z.object({
  value: positiveIntegerField(msg("Number of copies required")),
  recipient: z
    .string()
    .min(1, msg("Add the wallet address to send to"))
    .regex(/^0x[0-9a-fA-F]+$/, msg("Enter a valid Starknet address")),
  name: z.string().min(1, msg("Name required")).max(FIELD_LIMITS.name),
  description: z.string().max(FIELD_LIMITS.description).optional(),
  external_url: webLinkField(),
  ipType: z.enum(IP_TYPES),
  licenseType: z.string().min(1, msg("License required")),
  commercialUse: z.enum(["Yes", "No"]),
  derivatives: z.enum(DERIVATIVES_OPTIONS),
  attribution: z.enum(["Required", "Not Required"]),
  geographicScope: z.string(),
  aiPolicy: z.enum(AI_POLICIES),
  royalty: z.coerce.number().min(0).max(50),
});

export type EditionMintValues = z.infer<typeof editionMintSchema>;
