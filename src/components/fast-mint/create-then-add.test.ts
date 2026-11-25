import { describe, expect, test } from "bun:test";
import { createThenAdd, PartialCreateError, type StepInfo } from "./create-then-add";

const labels = { create: "Creating the collection", add: "Publishing" };
const unfinished = "Your collection was created, but the last step did not finish.";

describe("creating a destination and adding the first item to it", () => {
  test("with an existing destination there is one step and nothing is created", async () => {
    const steps: StepInfo[] = [];
    let created = 0;
    const result = await createThenAdd({
      existing: "0xold",
      create: async () => { created++; return "0xnew"; },
      add: async (d) => `added to ${d}`,
      labels, unfinished, onStep: (s) => steps.push(s),
    });
    expect(result).toBe("added to 0xold");
    expect(created).toBe(0);
    expect(steps).toEqual([{ label: "Publishing", index: 1, total: 1 }]);
  });

  test("without one the destination is created first, then the item is added to it", async () => {
    const steps: StepInfo[] = [];
    const order: string[] = [];
    const result = await createThenAdd({
      existing: null,
      create: async () => { order.push("create"); return "0xnew"; },
      add: async (d) => { order.push(`add ${d}`); return "done"; },
      labels, unfinished, onStep: (s) => steps.push(s),
    });
    expect(result).toBe("done");
    expect(order).toEqual(["create", "add 0xnew"]);
    expect(steps).toEqual([
      { label: "Creating the collection", index: 1, total: 2 },
      { label: "Publishing", index: 2, total: 2 },
    ]);
  });

  test("if the destination cannot be created nothing else is attempted and the error comes through", async () => {
    let added = 0;
    await expect(createThenAdd({
      existing: null,
      create: async () => { throw new Error("rejected"); },
      add: async () => { added++; return 1; },
      labels, unfinished, onStep: () => {},
    })).rejects.toThrow("rejected");
    expect(added).toBe(0);
  });

  test("if adding fails after the destination was created, the error carries the destination so it can be reused", async () => {
    const failure = new Error("wallet closed");
    const error = await createThenAdd({
      existing: null,
      create: async () => "0xnew",
      add: async () => { throw failure; },
      labels, unfinished: "Your ticket collection was created, but the last step did not finish.", onStep: () => {},
    }).catch((e) => e);
    expect(error).toBeInstanceOf(PartialCreateError);
    expect(error.destination).toBe("0xnew");
    expect(error.reason).toBe(failure);
    expect(error.message).toBe("Your ticket collection was created, but the last step did not finish.");
  });

  test("if adding to an existing destination fails, the plain error comes through", async () => {
    await expect(createThenAdd({
      existing: "0xold",
      create: async () => "0xnew",
      add: async () => { throw new Error("nope"); },
      labels, unfinished, onStep: () => {},
    })).rejects.toThrow("nope");
  });
});
