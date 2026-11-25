"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { dropHref } from "@medialane/sdk";
import { buildPopAllowlist, dropClaimLinks, popClaimLinksCsv, type PopClaimLink } from "@medialane/sdk/starknet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../dialog.js";
import { Button } from "../../button.js";
import { ShareButton } from "../../share-button.js";
import { describeError } from "../../../utils/describe-error.js";
import { uploadDirectoryToIpfs, uploadFileToIpfs } from "../../../utils/ipfs-upload.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { buildDropMetadataFiles, metadataBytes, MAX_DROP_METADATA_BYTES, tokenOrder } from "../../../utils/drop/metadata.js";
import { toDropTerms } from "../../../utils/drop/sale.js";
import { assetMedia, assetUploads, dropSymbol, type DropDraft } from "../../../utils/drop/draft.js";
import { uploadAll, type UploadTask } from "../../../utils/drop/upload.js";
import { launchDrop, saveExclusiveContent } from "../../../utils/drop/actions.js";
import { useMedialaneApp } from "../../medialane-app.js";
import { useT } from "../../../i18n/provider.js";

type Step =
  | { kind: "uploading" }
  | { kind: "launching" }
  | { kind: "done"; collection: string; links: PopClaimLink[]; warning: string | null }
  | { kind: "error"; message: string };

const COVER = "cover";

export function LaunchDialog({ open, onClose, draft, onLaunched }: { open: boolean; onClose: () => void; draft: DropDraft; onLaunched: () => void }) {
  const t = useT();
  const app = useMedialaneApp();
  const [step, setStep] = useState<Step>({ kind: "uploading" });
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [baseUri, setBaseUri] = useState<string | null>(null);
  const started = useRef(false);
  const client = app.getClient();
  const name = draft.collection.name.trim();
  const description = draft.collection.description.trim();
  const order = useMemo(() => tokenOrder(draft.assets.map((a) => Number(a.copies)), draft.mixOrder), [draft.assets, draft.mixOrder]);
  const list = useMemo(
    () => (draft.listOnly ? buildPopAllowlist(parseAllowlist(draft.allowlist).addresses) : null),
    [draft.listOnly, draft.allowlist],
  );

  const run = async () => {
    try {
      let uri = baseUri;
      let image: string | undefined;
      if (!uri) {
        setStep({ kind: "uploading" });
        const initial = tasks.length > 0 ? tasks : [
          ...assetUploads(draft.assets).map((u) => ({ ...u, status: "pending" as const, uri: null, error: null })),
          ...(draft.collection.cover ? [{ id: COVER, file: draft.collection.cover, status: "pending" as const, uri: null, error: null }] : []),
        ];
        const done = await uploadAll(initial, async (f) => (await uploadFileToIpfs(client.api, f, f.type.startsWith("image/") ? "image" : "media")).uri, setTasks);
        setTasks(done);
        if (done.some((task) => task.status !== "done")) {
          setStep({ kind: "error", message: t("Retry the remaining uploads.") });
          return;
        }
        const uriOf = (id: string) => done.find((task) => task.id === id)?.uri ?? null;
        const coverUri = uriOf(COVER);
        const metadata = buildDropMetadataFiles({
          name,
          description,
          externalUrl: draft.collection.externalUrl,
          creator: app.walletAddress!,
          coverUri,
          license: draft.license,
          assets: draft.assets.map((a) => ({
            name: a.name, description: a.description, ...assetMedia(a, uriOf), copies: Number(a.copies),
            traits: a.traits.filter((tr) => tr.key.trim() && tr.value.trim()),
          })),
          order,
        });
        if (metadataBytes(metadata) > MAX_DROP_METADATA_BYTES) {
          setStep({ kind: "error", message: t("Shorten the descriptions.") });
          return;
        }
        uri = (await uploadDirectoryToIpfs(client.api, metadata)).baseUri;
        image = coverUri ?? assetMedia(draft.assets[0]!, uriOf).imageUri;
        setBaseUri(uri);
      }
      setStep({ kind: "launching" });
      const signer = await app.getSigner();
      const { collection } = await launchDrop({ client, signer }, {
        owner: app.walletAddress!,
        name,
        symbol: dropSymbol(name),
        baseUri: uri!,
        maxSupply: order.length,
        terms: toDropTerms(draft.sale),
        allowlistRoot: list?.root,
        description: description || undefined,
        image,
      });
      onLaunched();
      let warning: string | null = null;
      if (draft.gated.enabled) {
        try {
          await saveExclusiveContent(client, collection, draft.gated);
        } catch {
          warning = "Add the exclusive content from Manage.";
        }
      }
      setStep({ kind: "done", collection, links: list ? dropClaimLinks(window.location.origin, collection, list) : [], warning });
    } catch (err) {
      setStep({ kind: "error", message: describeError(err).message });
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  });

  const close = () => {
    if (step.kind === "uploading" || step.kind === "launching") return;
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogContent className="gap-5" hideClose={step.kind === "uploading" || step.kind === "launching"}>
        <DialogDescription className="sr-only">{t("Launching the drop.")}</DialogDescription>
        {step.kind === "uploading" && (
          <>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold"><Loader2 className="h-4 w-4 animate-spin" />{t("Uploading")}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t("{done} of {total} files", { done: tasks.filter((task) => task.status === "done").length, total: tasks.length })}</p>
          </>
        )}
        {step.kind === "launching" && (
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold"><Loader2 className="h-4 w-4 animate-spin" />{t("Launching your drop…")}</DialogTitle>
        )}
        {step.kind === "error" && (
          <>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold"><XCircle className="h-4 w-4 text-destructive" />{t("Not launched")}</DialogTitle>
            <p className="text-sm text-muted-foreground">{step.message}</p>
            {tasks.some((t) => t.status === "failed") && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {tasks.filter((t) => t.status === "failed").map((t) => <li key={t.id}>{t.file.name}: {t.error}</li>)}
              </ul>
            )}
            <Button onClick={() => void run()} className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" />{t("Try again")}</Button>
          </>
        )}
        {step.kind === "done" && (
          <>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-brand-blue" />{t("Your drop is live")}</DialogTitle>
            {step.warning && <p className="text-sm text-brand-orange">{step.warning}</p>}
            <div className="flex flex-wrap gap-2">
              <ShareButton title={name} url={`${window.location.origin}${dropHref(step.collection)}`} variant="soft" />
              <Button asChild variant="soft"><a href={dropHref(step.collection)}>{t("View drop")}</a></Button>
              {step.links.length > 0 && (
                <Button variant="soft" onClick={() => downloadCsv(popClaimLinksCsv(step.links), "claim-links.csv")}>{t("Download claim links")}</Button>
              )}
            </div>
            {step.links.length > 0 && <p className="text-xs text-muted-foreground">{t("Send each wallet its claim link.")}</p>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function downloadCsv(csv: string, name: string) {
  const href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href, download: name }).click();
  URL.revokeObjectURL(href);
}
