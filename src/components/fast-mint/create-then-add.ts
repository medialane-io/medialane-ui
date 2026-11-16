export interface StepInfo {
  label: string;
  index: number;
  total: number;
}

export class PartialCreateError extends Error {
  readonly destination: unknown;
  readonly noun: string;
  readonly reason: unknown;

  constructor(destination: unknown, noun: string, reason: unknown) {
    super(`Your ${noun} was created, but the last step did not finish.`);
    this.name = "PartialCreateError";
    this.destination = destination;
    this.noun = noun;
    this.reason = reason;
  }
}

export async function createThenAdd<D, R>(opts: {
  existing: D | null;
  create: () => Promise<D>;
  add: (destination: D) => Promise<R>;
  labels: { create: string; add: string };
  noun: string;
  onStep: (step: StepInfo) => void;
}): Promise<R> {
  const { existing, create, add, labels, noun, onStep } = opts;
  const total = existing === null ? 2 : 1;

  if (existing !== null) {
    onStep({ label: labels.add, index: 1, total });
    return add(existing);
  }

  onStep({ label: labels.create, index: 1, total });
  const created = await create();
  onStep({ label: labels.add, index: 2, total });
  try {
    return await add(created);
  } catch (reason) {
    throw new PartialCreateError(created, noun, reason);
  }
}
