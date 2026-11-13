import * as z from "zod";
import { getListableTokens } from "@medialane/sdk";

export const LISTABLE_CURRENCIES: string[] = getListableTokens().map((token) => token.symbol);

const priceField = z
  .string()
  .min(1, "Price required")
  .refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, "Must be a positive number");

export const orderFormSchema = z.object({
  price: priceField,
  currency: z.string().refine((value) => LISTABLE_CURRENCIES.includes(value), "Invalid currency"),
  durationSeconds: z.number().min(86400),
  amount: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const counterOfferFormSchema = z.object({
  price: priceField,
  durationSeconds: z.number().int().min(3600),
  message: z.string().max(500).optional(),
});
