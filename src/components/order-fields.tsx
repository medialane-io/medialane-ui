"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form.js";
import { Input } from "./input.js";
import { CurrencyPicker, DurationPicker } from "./marketplace-dialog-primitives.js";
import { LISTABLE_CURRENCIES, type OrderFormValues } from "../utils/order-form.js";

export interface OrderFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  durationOptions: ReadonlyArray<{ label: string; seconds: number }>;
  busy: boolean;
  priceLabel: string;
  quantity?: { owned?: number };
}

export function OrderFields({ form, durationOptions, busy, priceLabel, quantity }: OrderFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{priceLabel}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                className="h-14 rounded-xl text-2xl font-semibold tabular-nums md:text-2xl placeholder:text-muted-foreground/40"
                disabled={busy}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <FormControl>
              <CurrencyPicker currencies={LISTABLE_CURRENCIES} value={field.value} onChange={field.onChange} disabled={busy} />
            </FormControl>
          </FormItem>
        )}
      />

      {quantity && (
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Quantity</FormLabel>
                {quantity.owned != null && <span className="text-xs text-muted-foreground">You own {quantity.owned}</span>}
              </div>
              <FormControl>
                <Input type="number" min="1" step="1" placeholder="1" disabled={busy} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="durationSeconds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration</FormLabel>
            <FormControl>
              <DurationPicker options={durationOptions} value={field.value} onChange={field.onChange} disabled={busy} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
