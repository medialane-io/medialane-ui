import * as z from "zod";
import { FIELD_LIMITS } from "../../utils/field-limits.js";
import { symbolField, webLinkField } from "../../utils/launchpad-rules.js";
import { msg } from "../../i18n/translate.js";

function parseDateTime(date: string, time: string): number | null {
  const timestamp = new Date(`${date}T${time}:00`).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export const popCreateSchema = z
  .object({
    name: z.string().min(1, "Event name required").max(FIELD_LIMITS.name),
    symbol: symbolField(),
    description: z.string().max(FIELD_LIMITS.description).optional(),
    external_link: webLinkField(),
    claimEndDate: z.string().min(1, "Claim end date required"),
    claimEndTime: z.string().default("23:59"),
  })
  .superRefine((values, context) => {
    const claimEndTimestamp = parseDateTime(values.claimEndDate, values.claimEndTime);

    if (claimEndTimestamp === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["claimEndDate"],
        message: msg("Enter a valid claim end date and time"),
      });
      return;
    }

    if (claimEndTimestamp <= Date.now()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["claimEndDate"],
        message: msg("Claim window must end in the future"),
      });
    }
  });

export type PopCreateValues = z.infer<typeof popCreateSchema>;
