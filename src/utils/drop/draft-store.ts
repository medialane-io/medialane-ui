"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_DRAFT, type DropDraft } from "./draft.js";

export interface DraftStore {
  load(): Promise<DropDraft | null>;
  save(d: DropDraft): Promise<void>;
  clear(): Promise<void>;
}

export function memoryDraftStore(): DraftStore {
  let saved: DropDraft | null = null;
  return {
    async load() { return saved; },
    async save(d) { saved = d; },
    async clear() { saved = null; },
  };
}

const DB = "medialane-drop";
const STORE = "draft";
const KEY = "current";

function request<T>(run: (store: IDBObjectStore) => IDBRequest<T>, mode: IDBTransactionMode): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const req = run(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => { db.close(); resolve(req.result); };
      req.onerror = () => { db.close(); reject(req.error); };
    };
  });
}

async function quietly<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    if (typeof indexedDB === "undefined") return fallback;
    return await run();
  } catch {
    return fallback;
  }
}

export function indexedDbDraftStore(): DraftStore {
  return {
    load: () => quietly(async () => ((await request((s) => s.get(KEY), "readonly")) as DropDraft | undefined) ?? null, null),
    save: (d) => quietly(async () => { await request((s) => s.put(d, KEY), "readwrite"); }, undefined),
    clear: () => quietly(async () => { await request((s) => s.delete(KEY), "readwrite"); }, undefined),
  };
}

const isEmpty = (d: DropDraft) => !d.collection.name.trim() && d.assets.length === 0;

type Patch = Partial<DropDraft> | ((d: DropDraft) => Partial<DropDraft>);

export function useSavedDraft(store: DraftStore) {
  const [draft, setDraftState] = useState<DropDraft>(EMPTY_DRAFT);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    let live = true;
    void store.load().then((saved) => {
      if (!live) return;
      if (saved && !isEmpty(saved)) {
        setDraftState({ ...EMPTY_DRAFT, ...saved });
        setRestored(true);
      }
      setReady(true);
    });
    return () => { live = false; };
  }, [store]);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => { void store.save(draft); }, 500);
    return () => clearTimeout(timer);
  }, [draft, store]);

  const setDraft = useCallback((patch: Patch) => {
    dirty.current = true;
    setDraftState((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
  }, []);

  const startOver = useCallback(() => {
    dirty.current = false;
    setDraftState(EMPTY_DRAFT);
    setRestored(false);
    void store.clear();
  }, [store]);

  const clearSaved = useCallback(async () => {
    dirty.current = false;
    await store.clear();
  }, [store]);

  return { draft, setDraft, ready, restored, startOver, clearSaved };
}
