"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { accountPageUrl } from "@medialane/sdk";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form.js";
import { Input } from "./input.js";

interface LinkValues {
  external_link: string;
}

export function ExternalLinkField({ form, address }: { form: UseFormReturn<any>; address: string | null | undefined }) {
  const { control, getValues, setValue } = form as UseFormReturn<LinkValues>;

  useEffect(() => {
    if (address && !getValues("external_link")) setValue("external_link", accountPageUrl(address));
  }, [address, getValues, setValue]);

  return (
    <FormField
      control={control}
      name="external_link"
      render={({ field }) => (
        <FormItem>
          <FormLabel>External link <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
          <FormControl>
            <Input placeholder="https://yourwebsite.com" {...field} />
          </FormControl>
          <FormDescription>Your website, portfolio, or social profile. Defaults to your Medialane account page.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
