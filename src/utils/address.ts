/**
 * Shorten a hex address to a prefix…suffix format.
 * Example: "0x1234567890abcdef" → "0x1234…cdef"
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}
