"use client";

import type { ElementType, RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";
import Image from "../image.js";
import {
  Award,
  BookOpen,
  Code2,
  ImagePlus,
  Loader2,
  Mic2,
  Star,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { acceptFor } from "../../utils/upload-limits.js";
import { Button } from "../button.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.js";
import { FadeIn } from "../motion-primitives.js";
import { ExternalLinkField } from "../external-link-field.js";
import { cn } from "../../utils/cn.js";
import type { PopCreateValues } from "./pop-create-schema.js";
import { useT } from "../../i18n/provider.js";
import { msg } from "../../i18n/translate.js";

export type PopEventType = "Conference" | "Bootcamp" | "Workshop" | "Hackathon" | "Meetup" | "Course" | "Other";

export const EVENT_TYPES: { value: PopEventType; label: string; icon: ElementType; description: string }[] = [
  { value: "Conference", label: msg("Conference"), icon: Mic2, description: msg("Talks & panels") },
  { value: "Bootcamp", label: msg("Bootcamp"), icon: Code2, description: msg("Intensive training") },
  { value: "Workshop", label: msg("Workshop"), icon: Wrench, description: msg("Hands-on learning") },
  { value: "Hackathon", label: msg("Hackathon"), icon: Zap, description: msg("Build & compete") },
  { value: "Meetup", label: msg("Meetup"), icon: Users, description: msg("Community gathering") },
  { value: "Course", label: msg("Course"), icon: BookOpen, description: msg("Structured learning") },
  { value: "Other", label: msg("Other"), icon: Star, description: msg("Something unique") },
];

interface PopCreateFieldsProps {
  form: UseFormReturn<PopCreateValues>;
  walletAddress: string | null | undefined;
  eventType: PopEventType;
  isPublic: boolean;
  imagePreview: string | null;
  imageUri: string | null;
  imageUploading: boolean;
  isSubmitting: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSetEventType: (value: PopEventType) => void;
  onSetPublic: (value: boolean) => void;
  onImageSelect: (file: File) => void;
  onClearImage: () => void;
}

export function PopCreateFields({
  form,
  walletAddress,
  eventType,
  isPublic,
  imagePreview,
  imageUri,
  imageUploading,
  isSubmitting,
  fileInputRef,
  onSetEventType,
  onSetPublic,
  onImageSelect,
  onClearImage,
}: PopCreateFieldsProps) {
  const t = useT();
  return (
    <div className="space-y-5">
      <FadeIn delay={0.06}>
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("What kind of event is this?")}</p>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map(({ value, label, icon: Icon }) => {
              const selected = eventType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSetEventType(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all",
                    selected
                      ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                      : "border-border bg-muted/30 hover:border-green-500/40 hover:bg-green-500/5 text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", selected && "text-green-500")} />
                  <span className="text-2xs font-semibold leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {t(EVENT_TYPES.find((event) => event.value === eventType)?.description ?? "")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("This helps label the certificate collection and makes the event easier to understand at a glance.")}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("Certificate image")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span>
          </p>
          <div className="flex items-center gap-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => !imageUploading && fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (!imageUploading) fileInputRef.current?.click();
                }
              }}
              className="relative h-20 w-20 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-green-500/50 transition-colors"
            >
              {imagePreview ? (
                <Image src={imagePreview} alt={t("Certificate")} fill unoptimized className="object-cover" />
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
                variant="outline"
                size="sm"
                disabled={imageUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    {t("Uploading…")}
                  </>
                ) : imagePreview ? (
                  t("Change")
                ) : (
                  t("Upload certificate art")
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
                {imageUri ? <span className="text-green-500">{t("✓ Uploaded")}</span> : t("JPG, PNG, SVG or WebP")}
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.12}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Event name *")}</FormLabel>
              <FormControl>
                <Input placeholder={t("Starknet Hackathon 2026")} {...field} />
              </FormControl>
              <FormDescription>{t("The event or program name participants will recognize immediately.")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FadeIn>

      <FadeIn delay={0.14}>
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Symbol *")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("SKHACK")}
                  {...field}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  className="max-w-[160px]"
                />
              </FormControl>
              <FormDescription>{t("Short ticker shown in wallets. We suggest one from the event name.")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FadeIn>

      <FadeIn delay={0.15}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Description")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
              <FormControl>
                <Textarea placeholder={t("What this certificate recognizes")} rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FadeIn>

      <FadeIn delay={0.155}>
        <ExternalLinkField form={form} address={walletAddress} />
      </FadeIn>

      <FadeIn delay={0.16}>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{t("Claim window closes *")}</p>
          <div className="flex gap-2 items-center">
            <FormField
              control={form.control}
              name="claimEndDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="claimEndTime"
              render={({ field }) => (
                <FormItem className="w-28">
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Participants can claim certificates until this time. After it closes, the collection remains as the onchain record.")}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.18}>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t("Event visibility")}</p>
            <p className="text-xs text-muted-foreground">
              {isPublic ? t("Listed publicly on the POP launchpad") : t("Only accessible via direct link")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => onSetPublic(!isPublic)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isPublic ? "bg-green-500" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                isPublic ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("Private events remain claimable by link, but won’t appear in the public POP directory.")}
        </p>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl mt-2"
          disabled={isSubmitting || imageUploading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("Creating event…")}
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              {t("Create Event")}
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t("Free to publish — protocol fee is zero.")}
        </p>
      </FadeIn>
    </div>
  );
}
