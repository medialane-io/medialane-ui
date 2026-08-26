"use client";

import type { UseFormReturn } from "react-hook-form";
import { Lock } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "./form.js";
import { Input } from "./input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.js";
import { Switch } from "./switch.js";
import { CollapsibleSection } from "./collapsible-section.js";
import { GATED_CONTENT_TYPES } from "../data/gated-content-types.js";
import type { DropCreateFormValues } from "../data/drop-create-schema.js";

const CONTENT_TYPES = Object.keys(GATED_CONTENT_TYPES).map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

export function ExclusiveContentSection({ form }: { form: UseFormReturn<DropCreateFormValues> }) {
  const gatedEnabled = form.watch("gatedEnabled");

  return (
    <CollapsibleSection
      open={gatedEnabled}
      onOpenChange={(o) => form.setValue("gatedEnabled", o)}
      icon={<Lock className="h-4 w-4 text-primary" />}
      label="Exclusive Content"
      hint={gatedEnabled ? "Holders get a locked tab with this content" : "Optional · reward holders with gated content"}
    >
      <p className="text-xs text-muted-foreground">
        Reward your holders with exclusive access — video, audio, documents, or any link.
        Only verified token holders can access this content.
      </p>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Enable exclusive content</p>
        <Switch
          checked={gatedEnabled}
          onCheckedChange={(checked) => form.setValue("gatedEnabled", checked)}
        />
      </div>

      {gatedEnabled && (
        <>
          <FormField control={form.control} name="gatedContentTitle" render={({ field }) => (
            <FormItem>
              <FormLabel>Content title</FormLabel>
              <FormControl><Input placeholder="e.g. Behind-the-scenes footage" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="gatedContentUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Content URL</FormLabel>
              <FormControl><Input placeholder="https://…" {...field} /></FormControl>
              <FormDescription>Only holders will see this URL. Use a private or unlisted link.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="gatedContentType" render={({ field }) => (
            <FormItem>
              <FormLabel>Content type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  {CONTENT_TYPES.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </>
      )}
    </CollapsibleSection>
  );
}
