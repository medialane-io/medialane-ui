
export interface CountableOrder {
  status: string;
  offerer: string;
  offer: { itemType: string };
  hasActiveCounterOffer?: boolean;
}

export interface PortfolioCounts {

  received: number;

  listings: number;

  remix: number;

  counter: number;

  sponsorships: number;
}

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
