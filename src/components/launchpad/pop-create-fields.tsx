"use client";

import type { ElementType } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Award,
  BookOpen,
  Code2,
  Loader2,
  Mic2,
  Star,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { ImageUploadField } from "../image-upload-field.js";
import type { FileUpload } from "../../utils/use-file-upload.js";
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
  upload: FileUpload;
  isSubmitting: boolean;
  onSetEventType: (value: PopEventType) => void;
  onSetPublic: (value: boolean) => void;
}

export function PopCreateFields({
  form,
  walletAddress,
  eventType,
  isPublic,
  upload,
  isSubmitting,
  onSetEventType,
  onSetPublic,
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
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all",
                    selected
                      ? "bg-brand-blue/15 text-brand-blue"
                      : "bg-background/40 text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", selected && "text-brand-blue")} />
                  <span className="text-2xs font-semibold leading-tight">{t(label)}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {t(EVENT_TYPES.find((event) => event.value === eventType)?.description ?? "")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("Labels the certificate collection.")}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <ImageUploadField
          upload={upload}
          label={t("Cover image")}
          alt={t("Certificate")}
          optional
          buttonLabel={t("Upload image")}
        />
      </FadeIn>

      <FadeIn delay={0.12}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("Starknet Hackathon 2026")} {...field} />
              </FormControl>
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
              <FormLabel>{t("Short code")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("SKHACK")}
                  {...field}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  className="max-w-[160px]"
                />
              </FormControl>
              <FormDescription>{t("A short name shown in wallets.")}</FormDescription>
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
          <p className="text-sm font-medium">{t("Claims close")}</p>
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
        </div>
      </FadeIn>

      <FadeIn delay={0.18}>
        <div className="panel flex items-center justify-between p-4">
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
              isPublic ? "bg-brand-blue" : "bg-muted-foreground/30"
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
      </FadeIn>

      <FadeIn delay={0.2}>
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl mt-2"
          disabled={isSubmitting || upload.uploading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("Creating event…")}
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              {t("Create event")}
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t("Free to publish.")}
        </p>
      </FadeIn>
    </div>
  );
}
