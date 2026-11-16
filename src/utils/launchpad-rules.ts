import * as z from "zod";
import { FIELD_LIMITS } from "./field-limits.js";

export const SYMBOL_PATTERN = new RegExp(`^[A-Z0-9]{1,${FIELD_LIMITS.symbol}}$`);
export const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;
export const WEB_LINK_MESSAGE = "Must start with http:// or https://";

export function isSymbol(value: string): boolean {
  return SYMBOL_PATTERN.test(value);
}

export function isPositiveInteger(value: string): boolean {
  return POSITIVE_INTEGER_PATTERN.test(value.trim());
}

export function isWebLink(value: string | undefined | null): boolean {
  return !value || value.startsWith("http://") || value.startsWith("https://");
}

export function symbolField() {
  return z
    .string()
    .min(1, "Symbol required")
    .max(FIELD_LIMITS.symbol, `Max ${FIELD_LIMITS.symbol} characters`)
    .regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only");
}

export function webLinkField() {
  return z.string().max(500).refine(isWebLink, { message: WEB_LINK_MESSAGE }).optional();
}

export function positiveIntegerField(requiredMessage: string) {
  return z.string().min(1, requiredMessage).regex(POSITIVE_INTEGER_PATTERN, "Enter a whole number, 1 or more");
}
