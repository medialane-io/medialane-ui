"use client";

import { useState, type RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";
import { ChevronDown, ImagePlus, Layers, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import { acceptFor } from "../../utils/upload-limits.js";
import Image from "../image.js";
import { Button } from "../button.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { CollapsibleSection } from "../collapsible-section.js";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { FadeIn } from "../motion-primitives.js";
import { IPTypeFields, type MetadataField } from "../ip-type-fields.js";
import { ToggleGroup } from "../create-form-primitives.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES, LICENSE_TYPES, type IPType } from "../../data/ip.js";
import { cn } from "../../utils/cn.js";
import type { EditionMintValues } from "./edition-mint-schema.js";
import { useT } from "../../i18n/provider.js";

interface EditionMintFieldsProps {
  form: UseFormReturn<EditionMintValues>;
  imagePreview: string | null;
  imageUri: string | null;
  imageUploading: boolean;
  mintDisabled: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageSelect: (file: File) => void;
  onClearImage: () => void;
  metadataResetKey: number;
  onMetadataFieldsChange: (fields: MetadataField[]) => void;
  uploadDocument: (file: File) => Promise<string>;
}

export function EditionMintFields({
  form,
  imagePreview,
  imageUri,
  imageUploading,
  mintDisabled,
  fileInputRef,
  onImageSelect,
  onClearImage,
  metadataResetKey,
  onMetadataFieldsChange,
  uploadDocument,
}: EditionMintFieldsProps) {
  const t = useT();
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [ipTypeOpen, setIpTypeOpen] = useState(false);

  const handleLicenseChange = (value: string) => {
    form.setValue("licenseType", value);
    const preset = LICENSE_TYPES.find((license) => license.value === value);
    if (preset) {
      form.setValue("commercialUse", preset.commercialUse);
      form.setValue("derivatives", preset.derivatives);
      form.setValue("attribution", preset.attribution);
    }
  };

  return (
    <div className="space-y-5">
      <FadeIn delay={0.06}>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("Asset image")} <span className="text-destructive">*</span>
          </p>
          <div className="flex items-center gap-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => !imageUploading && fileInputRef.current?.click()}
              onKeyDown={(event) => { if (event.key === "Enter") fileInputRef.current?.click(); }}
              className="relative h-20 w-20 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-brand-purple/50 transition-colors"
            >
              {imagePreview ? (
                <Image src={imagePreview} alt={t("Token")} fill unoptimized className="object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
              {imageUploading ? (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptFor("image")}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onImageSelect(file);
                }}
              />
              <Button
                type="button"
                variant="soft"
                size="sm"
                disabled={imageUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    {t("Uploading…")}
                  </>
                ) : (
                  imagePreview ? t("Change") : t("Upload image")
                )}
              </Button>
              {imagePreview ? (
                <button
                  type="button"
                  onClick={onClearImage}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" /> {t("Remove")}
                </button>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {imageUri ? (
                  <span className="text-brand-purple">{t("✓ Uploaded")}</span>
                ) : (
                  t("JPG, PNG, SVG or WebP")
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t("This media and metadata are pinned before the first mint is submitted.")}</p>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("Token name *")}</FormLabel>
            <FormControl><Input placeholder={t("Genesis Track #1")} {...field} /></FormControl>
            <FormDescription>{t("The title collectors will see for this edition.")}</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("Description")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
            <FormControl>
              <Textarea placeholder={t("Describe this digital asset…")} rows={3} {...field} />
            </FormControl>
            <FormDescription>{t("Add context, utility, or creative notes for this token edition.")}</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </FadeIn>

      <FadeIn delay={0.12}>
        <FormField control={form.control} name="external_url" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("External link")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
            <FormControl><Input placeholder={t("https://yourwebsite.com")} {...field} /></FormControl>
            <FormDescription>{t("Canonical link for this edition.")}</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </FadeIn>

      <FadeIn delay={0.14}>
        <FormField control={form.control} name="value" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("Quantity *")}</FormLabel>
            <FormControl>
              <Input type="number" min={1} placeholder="1" className="max-w-[180px]" {...field} />
            </FormControl>
            <FormDescription>{t("Number of copies to mint for this token ID.")}</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </FadeIn>

      <FadeIn delay={0.16}>
        <FormField control={form.control} name="recipient" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("Recipient *")}</FormLabel>
            <FormControl>
              <Input placeholder="0x…" {...field} />
            </FormControl>
            <FormDescription>{t("Account that receives the minted tokens. Defaults to your account.")}</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      </FadeIn>

      <FadeIn delay={0.18}>
        <CollapsibleSection
          open={licensingOpen}
          onOpenChange={setLicensingOpen}
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          label={t("License terms")}
          hint={t("Optional · Berne Convention")}
        >
                <p className="text-xs text-muted-foreground">
                  {t("Set the licensing terms for this edition — saved permanently with it.")}
                </p>

                <FormField control={form.control} name="licenseType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("License")}</FormLabel>
                    <Select value={field.value} onValueChange={handleLicenseChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LICENSE_TYPES.map((license) => (
                          <SelectItem key={license.value} value={license.value}>{t(license.label)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(() => {
                      const preset = LICENSE_TYPES.find((license) => license.value === field.value);
                      return preset ? <p className="text-xs text-muted-foreground mt-1">{t(preset.description)}</p> : null;
                    })()}
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="commercialUse" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Commercial use")}</FormLabel>
                    <ToggleGroup value={field.value} options={["Yes", "No"]} onChange={field.onChange} />
                  </FormItem>
                )} />

                <FormField control={form.control} name="derivatives" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Derivatives")}</FormLabel>
                    <ToggleGroup value={field.value} options={DERIVATIVES_OPTIONS} onChange={field.onChange} />
                  </FormItem>
                )} />

                <FormField control={form.control} name="attribution" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Attribution")}</FormLabel>
                    <ToggleGroup value={field.value} options={["Required", "Not Required"]} onChange={field.onChange} />
                  </FormItem>
                )} />

                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
                      {t("Advanced options")}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-3">
                    <FormField control={form.control} name="geographicScope" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Territory")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("Worldwide")} {...field} />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="aiPolicy" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("AI & data mining")}</FormLabel>
                        <ToggleGroup value={field.value} options={AI_POLICIES} onChange={field.onChange} />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="royalty" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Royalty % (0–50)")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            step={0.5}
                            placeholder="0"
                            {...field}
                            onChange={(event) => field.onChange(parseFloat(event.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CollapsibleContent>
                </Collapsible>
        </CollapsibleSection>
      </FadeIn>

      <FadeIn delay={0.2}>
        <CollapsibleSection
          open={ipTypeOpen}
          onOpenChange={setIpTypeOpen}
          icon={<Layers className="h-4 w-4 text-primary" />}
          label={t("IP type & metadata")}
          hint={t("Optional")}
        >
                <p className="text-xs text-muted-foreground">
                  {t("Choose a content type, fill suggested metadata, or add your own trait pairs.")}
                </p>

                <FormField control={form.control} name="ipType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("IP type")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IP_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <IPTypeFields
                  key={metadataResetKey}
                  ipType={form.watch("ipType") as IPType}
                  onChange={onMetadataFieldsChange}
                  uploadDocument={uploadDocument}
                />
        </CollapsibleSection>
      </FadeIn>

      <FadeIn delay={0.22}>
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl mt-2"
          disabled={mintDisabled}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t("Mint edition")}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t("Free to mint — protocol fee is zero.")}
        </p>
      </FadeIn>
    </div>
  );
}
