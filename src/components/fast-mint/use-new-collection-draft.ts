"use client";

import { useEffect, useState } from "react";
import { suggestLaunchpadSymbol } from "../../utils/launchpad-defaults.js";

export function useNewCollectionDraft(assetName: string, assetDescription: string) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [autoSymbol, setAutoSymbol] = useState("");
  const [autoName, setAutoName] = useState("");
  const [autoDescription, setAutoDescription] = useState("");

  useEffect(() => {
    const suggested = suggestLaunchpadSymbol(assetName);
    if (!suggested) return;
    if (!symbol || symbol === autoSymbol) {
      setSymbol(suggested);
      setAutoSymbol(suggested);
    }
    if (!name || name === autoName) {
      setName(assetName);
      setAutoName(assetName);
    }
  }, [assetName, autoSymbol, autoName, symbol, name]);

  useEffect(() => {
    if (!description || description === autoDescription) {
      setDescription(assetDescription);
      setAutoDescription(assetDescription);
    }
  }, [assetDescription, autoDescription, description]);

  const reset = () => {
    setName("");
    setSymbol("");
    setDescription("");
    setAutoSymbol("");
    setAutoName("");
    setAutoDescription("");
  };

  return { name, symbol, description, setName, setSymbol, setDescription, reset };
}
