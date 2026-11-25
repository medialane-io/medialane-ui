"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { accountPageUrl } from "@medialane/sdk";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form.js";
import { Input } from "./input.js";
import { useT } from "../i18n/provider.js";

interface LinkValues {
  external_link: string;
}

export function ExternalLinkField({ form, address }: { form: UseFormReturn<any>; address: string | null | undefined }) {
  const t = useT();
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
          <FormLabel>{t("Link")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
          <FormControl>
            <Input placeholder={t("https://yourwebsite.com")} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
