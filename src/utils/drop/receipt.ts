import { hash } from "starknet";
import type { ReceiptLike } from "@medialane/sdk/starknet";

const CLAIMED = BigInt(hash.getSelectorFromName("Claimed"));
const u256 = (low?: string, high?: string) => BigInt(low ?? "0x0") + (BigInt(high ?? "0x0") << 128n);

/** Token ids minted by a claim, read from the drop's Claimed event. */
export function claimedTokenIds(receipt: ReceiptLike, collection: string): string[] {
  const target = BigInt(collection);
  const event = receipt.events?.find((e) => e.from_address && BigInt(e.from_address) === target && e.keys?.[0] && BigInt(e.keys[0]) === CLAIMED);
  if (!event?.data) return [];
  const quantity = u256(event.data[0], event.data[1]);
  const first = u256(event.data[2], event.data[3]);
  return Array.from({ length: Number(quantity) }, (_, i) => (first + BigInt(i)).toString());
}
