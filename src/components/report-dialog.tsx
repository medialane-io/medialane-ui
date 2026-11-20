"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Flag, Loader2 } from "lucide-react";
import { MedialaneApiError } from "@medialane/sdk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog.js";
import { Button } from "./button.js";
import { Checkbox } from "./checkbox.js";
import { Textarea } from "./textarea.js";
import { Label } from "./label.js";
import { useMedialaneApp, type ReportTarget } from "./medialane-app.js";
import { describeError } from "../utils/describe-error.js";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";

const CATEGORIES = [
  { value: "COPYRIGHT_PIRACY", label: msg("Copyright / piracy") },
  { value: "VIOLENCE_GRAPHIC", label: msg("Violence / Graphic content") },
  { value: "HATE_SPEECH", label: msg("Hate speech") },
  { value: "SCAM_FRAUD", label: msg("Scam / fraud") },
  { value: "SPAM", label: msg("Spam") },
  { value: "NSFW", label: msg("NSFW / Adult content") },
  { value: "OTHER", label: msg("Other") },
] as const;

export interface ReportDialogProps {
  target: ReportTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ target, open, onOpenChange }: ReportDialogProps) {
  const t = useT();
  const { getClient, ensureSignedIn } = useMedialaneApp();
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [submitStep, setSubmitStep] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const close = () => {
    setCategories([]);
    setDescription("");
    setSubmitStep("idle");
    setSubmitError(null);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && submitStep !== "submitting") close();
  };

  const handleSubmit = async () => {
    if (categories.length === 0 || submitStep === "submitting") return;
    setSubmitStep("submitting");
    setSubmitError(null);

    try {
      await ensureSignedIn?.();
      await getClient().api.platform.submitReport({
          targetType: target.type,
          categories,
          description: description.trim() || undefined,
          ...(target.type === "TOKEN" ? { targetContract: target.contract, targetTokenId: target.tokenId } : {}),
          ...(target.type === "COLLECTION" ? { targetContract: target.contract } : {}),
          ...(target.type === "CREATOR" ? { targetAddress: target.address } : {}),
          ...(target.type === "COMMENT" ? { targetId: target.commentId } : {}),
        });

      setSubmitStep("success");
    } catch (err) {
      setSubmitStep("error");
      if (err instanceof MedialaneApiError && err.status === 409) {
        setSubmitError("You've already reported this content.");
      } else if (err instanceof MedialaneApiError && err.status === 429) {
        setSubmitError("Too many reports — please wait before trying again.");
      } else {
        setSubmitError(describeError(err).message);
      }
    }
  };

  const targetLabel =
    target.type !== "COMMENT" && target.name
      ? `"${target.name}"`
      : target.type.charAt(0) + target.type.slice(1).toLowerCase();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4" />{t("Report {targetLabel}", { targetLabel })}
          </DialogTitle>
        </DialogHeader>

        {submitStep === "success" ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
            <div className="space-y-1">
              <p className="font-semibold">{t("Report submitted")}</p>
              <p className="text-sm text-muted-foreground">{t("Our team will review it.")}</p>
            </div>
            <Button className="w-full" onClick={close}>{t("Done")}</Button>
          </div>
        ) : submitStep === "error" ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">{submitError}</p>
            <div className="flex gap-2 w-full">
              <Button variant="soft" className="flex-1" onClick={() => { setSubmitStep("idle"); setSubmitError(null); }}>{t("Try again")}</Button>
              <Button variant="soft" className="flex-1" onClick={close}>{t("Dismiss")}</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("What's wrong with this content?")}{" "}
                  <span className="text-muted-foreground font-normal">
                    {t("(select all that apply)")}
                  </span>
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {CATEGORIES.map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={value}
                        checked={categories.includes(value)}
                        onCheckedChange={() => toggleCategory(value)}
                        disabled={submitStep === "submitting"}
                      />
                      <label
                        htmlFor={value}
                        className="text-sm cursor-pointer leading-none"
                      >
                        {t(label)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description" className="text-sm font-medium">
                  {t("Additional details")}{" "}
                  <span className="text-muted-foreground font-normal">{t("(optional)")}</span>
                </Label>
                <Textarea
                  id="report-description"
                  placeholder={t("Describe the issue in more detail (optional)")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="resize-none h-24"
                  disabled={submitStep === "submitting"}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/500
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("Reports are reviewed by the Medialane DAO team. Content remains accessible onchain and via the permissionless dapp.")}
              </p>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={close} disabled={submitStep === "submitting"}>
                {t("Cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={categories.length === 0 || submitStep === "submitting"}
              >
                {submitStep === "submitting" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("Submitting…")}</> : t("Submit report")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
