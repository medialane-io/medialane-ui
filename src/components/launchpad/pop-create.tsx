"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award } from "lucide-react";
import { buildCollectionMetadata, profileHref } from "@medialane/sdk";
import { Form } from "../form.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { TransactionSuccess } from "../transaction-success.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { PopCreateFields, type PopEventType } from "./pop-create-fields.js";
import { popCreateSchema, type PopCreateValues } from "./pop-create-schema.js";
import { getDefaultClaimWindow, suggestLaunchpadSymbol } from "../../utils/launchpad-defaults.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { claimEndTimestamp, popEventAttributes, popEventIntent } from "../../utils/launchpad-actions.js";
import { uploadJsonToIpfs } from "../../utils/ipfs-upload.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { useLaunchpadImageUpload } from "../../utils/use-launchpad-image-upload.js";
import { useT } from "../../i18n/provider.js";

export function PopCreate({ aside }: { aside?: ReactNode }) {
  const t = useT();
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const tx = useTransaction();
  const upload = useLaunchpadImageUpload({ successMessage: "Certificate image uploaded", failureMessage: "Image upload failed" });
  const { imagePreview, imageUri, imageUploading, uploadError, uploadSuccess, fileInputRef, handleImageSelect, clearImage } = upload;
  const [eventType, setEventType] = useState<PopEventType>("Conference");
  const [isPublic, setIsPublic] = useState(false);
  const [autoSymbol, setAutoSymbol] = useState("");

  const form = useForm<PopCreateValues>({
    resolver: zodResolver(popCreateSchema),
    defaultValues: { name: "", symbol: "", description: "", external_link: "", claimEndDate: "", claimEndTime: "23:59" },
  });
  const eventName = form.watch("name");

  useEffect(() => {
    const defaults = getDefaultClaimWindow();
    if (!form.getValues("claimEndDate")) {
      form.setValue("claimEndDate", defaults.claimEndDate, { shouldDirty: false });
      form.setValue("claimEndTime", defaults.claimEndTime, { shouldDirty: false });
    }
  }, [form]);

  useEffect(() => {
    const suggested = suggestLaunchpadSymbol(eventName);
    if (!suggested) return;
    const current = form.getValues("symbol");
    if (!current || current === autoSymbol) {
      form.setValue("symbol", suggested, { shouldDirty: false });
      setAutoSymbol(suggested);
    }
  }, [autoSymbol, eventName, form]);

  const handleAgain = () => {
    const defaults = getDefaultClaimWindow();
    tx.reset();
    form.reset({ name: "", symbol: "", claimEndDate: defaults.claimEndDate, claimEndTime: defaults.claimEndTime });
    clearImage();
    setEventType("Conference");
    setIsPublic(false);
    setAutoSymbol("");
  };

  const onSubmit = (values: PopCreateValues) => {
    if (!walletAddress) return;
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const baseUri = await uploadJsonToIpfs(api, {
        ...buildCollectionMetadata({
          name: values.name,
          description: values.description,
          image: imageUri,
          externalLink: values.external_link,
          owner: walletAddress,
        }),
        attributes: popEventAttributes(eventType, isPublic),
      });
      await runIntentCalls(signer, () =>
        popEventIntent(api, {
          owner: walletAddress,
          name: values.name,
          symbol: values.symbol,
          baseUri,
          claimEndTimestamp: claimEndTimestamp(values.claimEndDate, values.claimEndTime),
        }),
      );
    });
  };

  return (
    <WalletRequired
      icon={Award}
      iconClassName="text-green-500"
      title={t("Secure an account to create a POP event")}
      description={t("A secured account is needed to deploy a certificate collection onchain.")}
    >
      <TransactionDialog tx={tx} title={t("Create POP event")} workingLabel="Creating the POP event…" firstStepLabel="Upload certificate metadata">
        <TransactionSuccess
          name={eventName || "New event"}
          image={imagePreview}
          title={t("Event created")}
          description={t("Immutable digital asset certificates, recorded onchain.")}
          actions={[{ href: "/launchpad/pop", label: "Back to POP launchpad" }, { label: "Create another", onClick: handleAgain }]}
        >
          <RewardEarned actionType="launch_launchpad" />
        </TransactionSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<Award className="h-4 w-4 text-white" />}
        title={t("Create a POP Event")}
        subtitle={t("Immutable digital asset certificates — free to publish.")}
        aside={
          <>
            <MedialaneCollectionCard
              image={imagePreview}
              name={eventName}
              collection={form.watch("symbol") || "POP Event"}
              creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
              creatorHref={walletAddress ? profileHref({ address: walletAddress }) : undefined}
            />
            {aside}
          </>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <PopCreateFields
              walletAddress={walletAddress}
              form={form}
              eventType={eventType}
              isPublic={isPublic}
              imagePreview={imagePreview}
              imageUri={imageUri}
              imageUploading={imageUploading}
              isSubmitting={tx.phase !== "idle"}
              fileInputRef={fileInputRef}
              onSetEventType={setEventType}
              onSetPublic={setIsPublic}
              onImageSelect={handleImageSelect}
              onClearImage={clearImage}
            />
            {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
            {uploadSuccess && <p className="text-xs text-emerald-500 mt-1">✓ {uploadSuccess}</p>}
          </form>
        </Form>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
