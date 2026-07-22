/**
 * Minimal structural shape of a marketplace order needed to derive portfolio
 * counts. `ApiOrder` from `@medialane/sdk` is structurally assignable to this,
 * so callers pass their `ApiOrder[]` directly and the package stays decoupled
 * from any specific SDK version.
 */
export interface CountableOrder {
  status: string;
  offerer: string;
  offer: { itemType: string };
  hasActiveCounterOffer?: boolean;
}

export interface PortfolioCounts {
  /** Active ERC-20 offers made by others on the user's assets. */
  received: number;
  /** Active ERC-721/ERC-1155 listings the user is selling. */
  listings: number;
  /** Pending remix offers awaiting the user's action. */
  remix: number;
  /** The user's bids that a seller has countered. */
  counter: number;
  /** Sponsorship proposals/bids awaiting the user's decision. */
  sponsorships: number;
}

/**
 * Derive the portfolio header/subnav counts from the user's orders and remix
 * offers. Pure and server-safe (no React). Guards nullish inputs.
 * `sponsorshipPendingCount` is computed by the caller (received sponsorship
 * proposals + received bids awaiting a decision) since this function has no
 * sponsorship-shape knowledge — it just carries the number through.
 */
export function derivePortfolioCounts(
  orders: ReadonlyArray<CountableOrder> | null | undefined,
  remixOffers: ReadonlyArray<{ status: string }> | null | undefined,
  address: string | null | undefined,
  sponsorshipPendingCount = 0,
): PortfolioCounts {
  const list = Array.isArray(orders) ? orders : [];
  const addr = (address ?? "").toLowerCase();

  const received = list.filter(
    (o) =>
      o.status === "ACTIVE" &&
      o.offer.itemType === "ERC20" &&
      o.offerer.toLowerCase() !== addr,
  ).length;

  const listings = list.filter(
    (o) =>
      (o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155") &&
      o.status === "ACTIVE",
  ).length;

  const remix = Array.isArray(remixOffers)
    ? remixOffers.filter(
        (o) => o.status === "PENDING" || o.status === "AUTO_PENDING",
      ).length
    : 0;

  const counter = list.filter(
    (o) =>
      o.offer.itemType === "ERC20" &&
      o.offerer.toLowerCase() === addr &&
      o.hasActiveCounterOffer === true,
  ).length;

  return { received, listings, remix, counter, sponsorships: Math.max(0, sponsorshipPendingCount) };
}
