export interface UploadTask {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "failed";
  uri: string | null;
  error: string | null;
}

/** Uploads every task that isn't done, `concurrency` at a time; never throws — failures stay on their task. */
export async function uploadAll(
  tasks: UploadTask[],
  upload: (file: File) => Promise<string>,
  onChange: (tasks: UploadTask[]) => void,
  concurrency = 4,
): Promise<UploadTask[]> {
  const state = tasks.map((t) => ({ ...t }));
  const set = (i: number, patch: Partial<UploadTask>) => {
    state[i] = { ...state[i]!, ...patch };
    onChange(state.map((t) => ({ ...t })));
  };
  const queue = state.map((t, i) => (t.status === "done" ? -1 : i)).filter((i) => i >= 0);
  const worker = async () => {
    for (let i = queue.shift(); i !== undefined; i = queue.shift()) {
      set(i, { status: "uploading", error: null });
      try {
        set(i, { status: "done", uri: await upload(state[i]!.file) });
      } catch (err) {
        set(i, { status: "failed", error: err instanceof Error ? err.message : "Upload failed" });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
  return state;
}
