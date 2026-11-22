import { plainT, type T } from "../i18n/make-t.js";

export interface SuccessMessage {
  title: string;
  description: string;
}

type Named = { name: string };
type Priced = Named & { price: string };

export const successMessages = {
  listed: ({ name, price }: Priced, t: T = plainT): SuccessMessage => ({
    title: t("Listing created"),
    description: t("{name} is listed for {price}.", { name, price }),
  }),
  offered: ({ name, price }: Priced, t: T = plainT): SuccessMessage => ({
    title: t("Offer created"),
    description: t("Your offer of {price} on {name} is recorded onchain.", { name, price }),
  }),
  accepted: ({ name, price }: Priced, t: T = plainT): SuccessMessage => ({
    title: t("Sale completed"),
    description: t("{name} sold for {price}.", { name, price }),
  }),
  countered: ({ name, price }: Priced, t: T = plainT): SuccessMessage => ({
    title: t("Counter-offer created"),
    description: t("Your counter of {price} on {name} is recorded onchain.", { name, price }),
  }),
  archived: ({ name }: Named, t: T = plainT): SuccessMessage => ({
    title: t("Asset archived"),
    description: t("{name} is permanently archived onchain.", { name }),
  }),
  transferred: ({ name, to }: Named & { to: string }, t: T = plainT): SuccessMessage => ({
    title: t("Transfer completed"),
    description: t("{name} is owned by {to}.", { name, to }),
  }),
  purchased: ({ name, quantity }: Named & { quantity: number }, t: T = plainT): SuccessMessage => ({
    title: t("Purchase completed"),
    description:
      quantity > 1
        ? t("{quantity} editions of {name} are yours.", { quantity, name })
        : t("{name} is yours.", { name }),
  }),
  commented: (t: T = plainT): SuccessMessage => ({
    title: t("Comment published"),
    description: t("The comment appears within 30 seconds."),
  }),
  claimed: (t: T = plainT): SuccessMessage => ({
    title: t("Certificate claimed"),
    description: t("The certificate is recorded onchain in the wallet that claimed it."),
  }),
  bidPlaced: (t: T = plainT): SuccessMessage => ({
    title: t("Bid placed"),
    description: t("Your bid is recorded onchain."),
  }),
  bidAccepted: (t: T = plainT): SuccessMessage => ({
    title: t("Bid accepted"),
    description: t("The license is minted to the sponsor's wallet."),
  }),
  responseSent: (t: T = plainT): SuccessMessage => ({
    title: t("Response sent"),
    description: t("Your response is recorded onchain."),
  }),
  proposalWithdrawn: (t: T = plainT): SuccessMessage => ({
    title: t("Proposal withdrawn"),
    description: t("The proposal is closed onchain."),
  }),
  ownershipTransferred: ({ name, to }: Named & { to: string }, t: T = plainT): SuccessMessage => ({
    title: t("Ownership transferred"),
    description: t("{to} is the owner of {name}.", { to, name }),
  }),
  certificateIssued: (t: T = plainT): SuccessMessage => ({
    title: t("Certificate issued"),
    description: t("The certificate is recorded onchain in the participant's wallet."),
  }),
  participantsPublished: ({ count }: { count: number }, t: T = plainT): SuccessMessage => ({
    title: t("Participants published"),
    description: t.plural(
      "The list of {count} participant is recorded onchain.",
      "The list of {count} participants is recorded onchain.",
      count,
    ),
  }),
  walletActivated: (t: T = plainT): SuccessMessage => ({
    title: t("Wallet activated"),
    description: t("Your wallet is recorded onchain and can receive and send assets."),
  }),
  sent: ({ amount, symbol, to }: { amount: string; symbol: string; to: string }, t: T = plainT): SuccessMessage => ({
    title: t("Transfer completed"),
    description: t("{amount} {symbol} sent to {to}.", { amount, symbol, to }),
  }),
  licenseGranted: ({ price }: { price: string }, t: T = plainT): SuccessMessage => ({
    title: t("License granted"),
    description: t("The remix is listed for {price}.", { price }),
  }),
  cancelled: ({ kind }: { kind: "listing" | "offer" }, t: T = plainT): SuccessMessage => ({
    title: kind === "offer" ? t("Offer cancelled") : t("Listing cancelled"),
    description: t("The order is cancelled onchain."),
  }),
};
