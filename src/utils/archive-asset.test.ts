import { describe, expect, it } from "bun:test";
import { getCoordinates } from "@medialane/sdk";
import { archiveCall, readArchiveTarget } from "./archive-asset";

const REGISTRY = getCoordinates("STARKNET").collection721;
const NFT = "0x123";

function reader(answers: Record<string, string[]>) {
  const seen: Array<{ entrypoint: string; calldata: unknown }> = [];
  return {
    seen,
    callContract: async ({ entrypoint, calldata }: { entrypoint: string; calldata?: unknown }) => {
      seen.push({ entrypoint, calldata });
      const answer = answers[entrypoint];
      if (!answer) throw new Error("ENTRYPOINT_NOT_FOUND");
      return answer;
    },
  };
}

describe("the archive call", () => {
  it("targets the registry with the collection id and token id as u256 pairs", () => {
    const call = archiveCall("0xabc", 7n, (1n << 128n) + 5n);
    expect(call.contractAddress).toBe("0xabc");
    expect(call.entrypoint).toBe("archive");
    expect(call.calldata).toEqual(["7", "0", "5", "1"]);
  });
});

describe("reading what can be archived", () => {
  it("returns the collection id and whether the token is archived, for a token of the registry", async () => {
    const provider = reader({ get_registry: [REGISTRY], get_collection_id: ["9", "0"], is_archived: ["0"] });
    const target = await readArchiveTarget(provider as never, NFT, "42");
    expect(target).toEqual({ collectionId: 9n, registry: REGISTRY, archived: false });
    expect(provider.seen.find((c) => c.entrypoint === "is_archived")?.calldata).toEqual(["42", "0"]);
  });

  it("reports an archived token", async () => {
    const provider = reader({ get_registry: [REGISTRY], get_collection_id: ["1", "0"], is_archived: ["1"] });
    expect((await readArchiveTarget(provider as never, NFT, "1"))?.archived).toBe(true);
  });

  it("returns nothing when the token belongs to another registry", async () => {
    const provider = reader({ get_registry: ["0xdead"], get_collection_id: ["1", "0"], is_archived: ["0"] });
    expect(await readArchiveTarget(provider as never, NFT, "1")).toBeNull();
  });

  it("returns nothing when the contract is not an IP NFT", async () => {
    expect(await readArchiveTarget(reader({}) as never, NFT, "1")).toBeNull();
  });
});
