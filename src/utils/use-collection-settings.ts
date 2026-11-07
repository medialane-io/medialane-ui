"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { normalizeAddress } from "@medialane/sdk";
import { useMedialaneApp } from "../components/medialane-app.js";
import { describeError } from "./describe-error.js";
import { useCollection } from "./use-collections.js";
import { useCollectionProfile } from "./use-profiles.js";
import { EMPTY_SETTINGS_FORM, applyProfile, toProfileInput, type CollectionSettingsForm } from "./collection-settings-form.js";

type SaveStatus = "idle" | "saved" | "error";

export function useCollectionSettings(contract: string) {
  const { walletAddress, getClient, ensureSignedIn } = useMedialaneApp();
  const { collection, isLoading: collectionLoading } = useCollection(contract);
  const { profile, isLoading: profileLoading, mutate } = useCollectionProfile(contract);

  const [form, setForm] = useState<CollectionSettingsForm>(EMPTY_SETTINGS_FORM);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setForm((f) => applyProfile(f, profile));
  }, [profile]);

  const update = useCallback((patch: Partial<CollectionSettingsForm>) => setForm((f) => ({ ...f, ...patch })), []);

  const set = (key: keyof CollectionSettingsForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update({ [key]: e.target.value });

  const isOwner = Boolean(
    walletAddress &&
      collection?.owner &&
      normalizeAddress("STARKNET", walletAddress) === normalizeAddress("STARKNET", collection.owner),
  );

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await ensureSignedIn?.();
      await getClient().api.collections.updateProfile(contract, toProfileInput(form));
      await mutate();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      setSaveStatus("error");
      setSaveError(describeError(e).message);
    } finally {
      setSaving(false);
    }
  };

  return {
    collection,
    profile,
    collectionLoading,
    isLoading: collectionLoading || profileLoading,
    isOwner,
    form,
    set,
    update,
    saving,
    saveStatus,
    saveError,
    save,
  };
}
