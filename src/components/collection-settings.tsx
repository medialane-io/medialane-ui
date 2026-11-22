"use client";

import {
  User, Image as ImageIcon, Globe, Twitter, MessageCircle, Send,
  Lock, Unlock, Sparkles, ShieldCheck, CheckCircle2, ExternalLink,
  Video, Music, Radio, FileText, Link2, Info,
} from "lucide-react";
import { collectionHref } from "@medialane/sdk";
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
import { Textarea } from "./textarea.js";
import { Switch } from "./switch.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.js";
import { Badge } from "./badge.js";
import Link from "./link.js";
import { cn } from "../utils/cn.js";
import { SectionCard, SectionHeader, FieldRow, HelperText } from "./settings-section.js";
import { CollectionSlugClaimSection } from "./collection-slug-claim.js";
import { useCollectionSettings } from "../utils/use-collection-settings.js";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";
import { panelTint } from "./panel.js";
import { IconTile } from "./icon-tile.js";

const DESC_MAX = 500;

const CONTENT_TYPES = [
  { value: "VIDEO",    label: msg("Video"),       icon: Video,    hint: msg("Video URL") },
  { value: "AUDIO",    label: msg("Audio"),        icon: Music,    hint: msg("Audio URL") },
  { value: "STREAM",   label: msg("Live stream"),  icon: Radio,    hint: msg("Stream URL") },
  { value: "DOCUMENT", label: msg("Document"),     icon: FileText, hint: msg("Document URL") },
  { value: "LINK",     label: msg("Link"),         icon: Link2,    hint: msg("Any URL") },
];

export function CollectionSettings({ contract }: { contract: string }) {
  const t = useT();
  const {
    collection, profile, collectionLoading, isLoading, isOwner,
    form, set, update, saving, saveStatus, saveError, save,
  } = useCollectionSettings(contract);
  const descLen = form.description.length;

  if (!collectionLoading && collection && !isOwner) {
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-center">
        <IconTile>
          <Lock />
        </IconTile>
        <p className="text-sm font-medium">{t("Owner access only")}</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {t("Settings open for the collection owner.")}
        </p>
        <Button variant="soft" size="sm" asChild>
          <Link href="/portfolio/collections">{t("Go to my collections")}</Link>
        </Button>
      </div>
    );
  }

  const selectedContentType = CONTENT_TYPES.find(t => t.value === form.gatedContentType);

  return (
    <div className="space-y-6 max-w-2xl pb-16">

      <div>
        <h1 className="text-xl font-semibold">{t("Collection settings")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Customize the collection page.")}
        </p>
        {collection && (
          <Link
            href={collectionHref("STARKNET", contract)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {t("View collection page")}
          </Link>
        )}
      </div>

      <SectionCard id="identity">
        <SectionHeader
          icon={User}
          title={t("Identity")}
          description={t("Public name and description.")}
          badge={
            profile?.displayName ? (
              <Badge variant="soft" className="text-2xs h-4 px-1.5 gap-1 text-brand-blue border-brand-blue/30">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {t("Named")}
              </Badge>
            ) : (
              <Badge variant="soft" className="text-2xs h-4 px-1.5 gap-1 text-brand-orange border-brand-orange/30">
                <Info className="h-2.5 w-2.5" />
                {t("Add a name")}
              </Badge>
            )
          }
        />
        <div className="space-y-4 pt-1 border-t border-border">
          <FieldRow>
            <Label htmlFor="displayName">{t("Display name")}</Label>
            <Input
              id="displayName"
              placeholder={collection?.name ?? t("My Collection")}
              value={form.displayName}
              onChange={set("displayName")}
              disabled={isLoading}
            />
            <HelperText>
              {t("Shown on the collection page.")}
            </HelperText>
          </FieldRow>
          <FieldRow>
            <div className="flex items-center justify-between">
              <Label htmlFor="description">{t("Description")}</Label>
              <span className={cn("text-2xs tabular-nums", descLen > DESC_MAX ? "text-destructive" : "text-muted-foreground")}>
                {descLen}/{DESC_MAX}
              </span>
            </div>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => {
                if (e.target.value.length <= DESC_MAX) set("description")(e);
              }}
              rows={4}
              placeholder={t("The story behind the collection…")}
              disabled={isLoading}
            />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard id="media">
        <SectionHeader
          icon={ImageIcon}
          title={t("Media")}
          description={t("Images for the collection page.")}
        />
        <div className="space-y-4 pt-1 border-t border-border">
          <FieldRow>
            <Label htmlFor="image">{t("Cover image")}</Label>
            <Input
              id="image"
              placeholder={t("ipfs://Qm… or https://…")}
              value={form.image}
              onChange={set("image")}
              disabled={isLoading}
            />
            <HelperText>{t("Shown on collection cards.")}</HelperText>
          </FieldRow>
          <FieldRow>
            <Label htmlFor="bannerImage">{t("Banner image")}</Label>
            <Input
              id="bannerImage"
              placeholder={t("ipfs://Qm… or https://…")}
              value={form.bannerImage}
              onChange={set("bannerImage")}
              disabled={isLoading}
            />
            <HelperText>{t("Wide banner at 1500×500 px.")}</HelperText>
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard id="exclusive" className={form.gatedEnabled ? "border-brand-blue/30 bg-brand-blue/[0.03]" : ""}>
        <SectionHeader
          icon={Lock}
          title={t("Exclusive content")}
          description={t("Exclusive content for holders.")}
          badge={
            form.gatedEnabled ? (
              <Badge variant="soft" className="text-2xs h-4 px-1.5 gap-1 text-brand-blue border-brand-blue/30">
                <Unlock className="h-2.5 w-2.5" />
                {t("Active")}
              </Badge>
            ) : undefined
          }
        />

        <div className="pt-1 border-t border-border space-y-5">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {form.gatedEnabled ? t("Exclusive content is enabled") : t("Enable exclusive content")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.gatedEnabled
                  ? t("Holders unlock it on the collection page.")
                  : t("Add content only holders can open.")}
              </p>
            </div>
            <Switch
              checked={form.gatedEnabled}
              onCheckedChange={(v) => update({ gatedEnabled: v })}
              disabled={isLoading}
            />
          </div>

          {form.gatedEnabled && (
            <div className="space-y-4">

              <FieldRow>
                <Label htmlFor="gatedContentTitle">{t("Content title")}</Label>
                <Input
                  id="gatedContentTitle"
                  placeholder={t("Exclusive track")}
                  value={form.gatedContentTitle}
                  onChange={set("gatedContentTitle")}
                />
                <HelperText>
                  {t("The title is public and the content is for holders.")}
                </HelperText>
              </FieldRow>

              <FieldRow>
                <Label htmlFor="gatedContentUrl">{t("Content URL")}</Label>
                <Input
                  id="gatedContentUrl"
                  placeholder={t("https://…")}
                  value={form.gatedContentUrl}
                  onChange={set("gatedContentUrl")}
                />
                <HelperText>
                  {t("The private link holders receive.")}
                </HelperText>
              </FieldRow>

              <FieldRow>
                <Label>{t("Content type")}</Label>
                <Select
                  value={form.gatedContentType}
                  onValueChange={(v) => update({ gatedContentType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("What kind of content is this?")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {t(label)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedContentType && (
                  <HelperText>{t(selectedContentType.hint)}</HelperText>
                )}
              </FieldRow>

              {form.gatedContentTitle && (
                <div className="panel p-4 space-y-1.5" style={panelTint("blue")}>
                  <p className="text-2xs font-semibold text-brand-blue uppercase tracking-widest">
                    {t("Holder preview")}
                  </p>
                  <p className="text-sm font-semibold">{form.gatedContentTitle || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Verified holders can access this content on your collection page.")}
                  </p>
                </div>
              )}
            </div>
          )}

          {!form.gatedEnabled && (
            <div className="panel p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground">{t("How it works")}</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-3 w-3 text-brand-blue mt-0.5 shrink-0" />
                  {t("Add a private link.")}
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-3 w-3 text-brand-blue mt-0.5 shrink-0" />
                  {t("Access requires holding a token.")}
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="h-3 w-3 text-brand-blue mt-0.5 shrink-0" />
                  {t("Only holders receive the link.")}
                </li>
              </ul>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard id="links">
        <SectionHeader
          icon={Globe}
          title={t("Links")}
          description={t("Social and community links shown to collectors visiting your page.")}
        />
        <div className="space-y-4 pt-1 border-t border-border">
          {([
            { key: "websiteUrl" as const,  icon: Globe,          label: t("Website"),    placeholder: "https://myproject.xyz" },
            { key: "twitterUrl" as const,  icon: Twitter,        label: t("Twitter / X"), placeholder: "https://twitter.com/…" },
            { key: "discordUrl" as const,  icon: MessageCircle,  label: "Discord",    placeholder: "https://discord.gg/…" },
            { key: "telegramUrl" as const, icon: Send,           label: "Telegram",   placeholder: "https://t.me/…" },
          ] as const).map(({ key, icon: Icon, label, placeholder }) => (
            <FieldRow key={key}>
              <Label htmlFor={key} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {t(label)}
              </Label>
              <Input
                id={key}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                disabled={isLoading}
              />
            </FieldRow>
          ))}
        </div>
      </SectionCard>

      <CollectionSlugClaimSection contract={contract} profile={profile} />

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={save}
          disabled={saving || isLoading || descLen > DESC_MAX}
          className="min-w-[120px]"
        >
          {saving ? t("Saving…") : t("Save changes")}
        </Button>
        {saveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-sm text-brand-blue">
            <CheckCircle2 className="h-4 w-4" /> {t("Saved")}
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm text-destructive">{saveError}</span>
        )}
        {descLen > DESC_MAX && (
          <p className="text-xs text-destructive">{t("Description is too long.")}</p>
        )}
      </div>
    </div>
  );
}
