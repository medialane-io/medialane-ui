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
    // localStorage unavailable (private mode, quota) — celebrations just won't fire again this session
  }
}

/**
 * Diffs the current rewards snapshot against the last-seen state cached in
 * localStorage (per address) and reports what's new since last time. A
 * first-ever snapshot for an address seeds the cache silently — no
 * celebration on first sight, only on a detected increase/addition.
 * Call `dismiss()` to clear the returned state once the caller has shown it
 * (the storage baseline is written the moment new state is detected, not on
 * dismiss, so a level-up and a badge unlock arriving together can each
 * dismiss on their own timeline without racing the other's write).
 */
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
      // First time we've ever seen this address (or a wallet switch) — seed silently.
      writeSeen(address, { level: rewards.currentLevel, badgeKeys: currentBadgeKeys });
      lastAddress.current = address;
      return;
    }

    const leveledUpTo = rewards.currentLevel > seen.level ? rewards.currentLevel : null;
    const newBadgeKeys = currentBadgeKeys.filter((k) => !seen.badgeKeys.includes(k));

    if (leveledUpTo !== null || newBadgeKeys.length > 0) {
      // Persist the new baseline immediately — a level-up and a badge unlock
      // can arrive in the same snapshot but dismiss independently (the
      // celebration overlay dismisses itself on a timer/tap; the badge
      // toasts fire-and-forget). Gating the write on either UI action
      // dismissing would let the other clear this state first and skip the
      // write. A page refresh mid-celebration correctly won't re-fire either.
      writeSeen(address, { level: rewards.currentLevel, badgeKeys: currentBadgeKeys });
      setState({ leveledUpTo, newBadgeKeys });
    }
  }, [address, rewards]);

  // Purely local UI state — the storage baseline is already written above,
  // the moment new state was detected. This only clears what's on screen.
  const dismiss = () => setState(EMPTY);

  return { ...state, dismiss };
}
