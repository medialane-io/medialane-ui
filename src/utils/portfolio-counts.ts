import { normalizeAddress } from "@medialane/sdk";

export interface CountableOrder {
  status: string;
  offerer: string;
  offer: { itemType: string };
  hasActiveCounterOffer?: boolean;
}

export interface PortfolioCounts {

  received: number;

  listings: number;

  offers: number;

  remix: number;

  counter: number;

  sponsorships: number;
}

function safeNormalize(address: string): string | null {
  try {
    return normalizeAddress("STARKNET", address);
  } catch {
    return null;
  }
}

export function derivePortfolioCounts({
  orders,
  receivedOffers,
  remixOffers,
  address,
  sponsorshipPendingCount = 0,
}: {
  orders: ReadonlyArray<CountableOrder> | null | undefined;
  receivedOffers: ReadonlyArray<CountableOrder> | null | undefined;
  remixOffers: ReadonlyArray<{ status: string }> | null | undefined;
  address: string | null | undefined;
  sponsorshipPendingCount?: number;
}): PortfolioCounts {
  const list = Array.isArray(orders) ? orders : [];
  const addr = address ? safeNormalize(address) : null;

  const received = (Array.isArray(receivedOffers) ? receivedOffers : []).filter(
    (o) =>
      o.status === "ACTIVE" &&
      o.offer.itemType === "ERC20" &&
      safeNormalize(o.offerer) !== addr,
  ).length;

  const listings = list.filter(
    (o) =>
      (o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155") &&
      o.status === "ACTIVE",
  ).length;

  const offers = list.filter((o) => o.offer.itemType === "ERC20" && o.status === "ACTIVE").length;

  const remix = Array.isArray(remixOffers)
    ? remixOffers.filter(
        (o) => o.status === "PENDING" || o.status === "AUTO_PENDING",
      ).length
    : 0;

  const counter = list.filter(
    (o) =>
      o.offer.itemType === "ERC20" &&
      addr !== null &&
      safeNormalize(o.offerer) === addr &&
      o.hasActiveCounterOffer === true,
  ).length;

  return { received, listings, offers, remix, counter, sponsorships: Math.max(0, sponsorshipPendingCount) };
}
