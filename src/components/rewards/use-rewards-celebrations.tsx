"use client";

import { useEffect, useRef, useState } from "react";

interface RewardsSnapshot {
  currentLevel: number;
  badges: { key: string }[];
}

interface CelebrationState {
  leveledUpTo: number | null;
  newBadgeKeys: string[];
}

const EMPTY: CelebrationState = { leveledUpTo: null, newBadgeKeys: [] };

function storageKey(address: string) {
  return `ml:rewards-seen:${address.toLowerCase()}`;
}

interface SeenState {
  level: number;
  badgeKeys: string[];
}

function readSeen(address: string): SeenState | null {
  try {
    const raw = localStorage.getItem(storageKey(address));
    return raw ? (JSON.parse(raw) as SeenState) : null;
  } catch {
    return null;
  }
}

function writeSeen(address: string, state: SeenState) {
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(state));
  } catch {

  }
}

export function useRewardsCelebrations(
  address: string | null | undefined,
  rewards: RewardsSnapshot | null | undefined
): CelebrationState & { dismiss: () => void } {
  const [state, setState] = useState<CelebrationState>(EMPTY);
  const lastAddress = useRef<string | null>(null);

  useEffect(() => {
    if (!address || !rewards) return;

    const seen = readSeen(address);
    const currentBadgeKeys = rewards.badges.map((b) => b.key);

    if (!seen || lastAddress.current !== address) {

      writeSeen(address, { level: rewards.currentLevel, badgeKeys: currentBadgeKeys });
      lastAddress.current = address;
      return;
    }

    const leveledUpTo = rewards.currentLevel > seen.level ? rewards.currentLevel : null;
    const newBadgeKeys = currentBadgeKeys.filter((k) => !seen.badgeKeys.includes(k));

    if (leveledUpTo !== null || newBadgeKeys.length > 0) {

      writeSeen(address, { level: rewards.currentLevel, badgeKeys: currentBadgeKeys });
      setState({ leveledUpTo, newBadgeKeys });
    }
  }, [address, rewards]);

  const dismiss = () => setState(EMPTY);

  return { ...state, dismiss };
}
