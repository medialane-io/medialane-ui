export interface SuccessMessage {
  title: string;
  description: string;
}

export const successMessages = {
  listed: ({ name, price }: { name: string; price: string }): SuccessMessage => ({
    title: "Listing created",
    description: `${name} is listed for ${price}. The order is recorded onchain.`,
  }),
  offered: ({ name, price }: { name: string; price: string }): SuccessMessage => ({
    title: "Offer created",
    description: `Your offer of ${price} on ${name} is recorded onchain.`,
  }),
  accepted: ({ name, price }: { name: string; price: string }): SuccessMessage => ({
    title: "Sale completed",
    description: `${name} sold for ${price}. Ownership is recorded onchain with the buyer's wallet.`,
  }),
  countered: ({ name, price }: { name: string; price: string }): SuccessMessage => ({
    title: "Counter-offer created",
    description: `Your counter of ${price} on ${name} is recorded onchain.`,
  }),
  transferred: ({ name, to }: { name: string; to: string }): SuccessMessage => ({
    title: "Transfer completed",
    description: `${name} is owned by ${to}.`,
  }),
  purchased: ({ name, quantity }: { name: string; quantity: number }): SuccessMessage => ({
    title: "Purchase completed",
    description:
      quantity > 1
        ? `${quantity} editions of ${name} are owned by your wallet. The sale is recorded onchain.`
        : `${name} is owned by your wallet. The sale is recorded onchain.`,
  }),
  commented: (): SuccessMessage => ({
    title: "Comment published",
    description: "Your comment is recorded onchain and appears here within about 30 seconds.",
  }),
  claimed: (): SuccessMessage => ({
    title: "Credential claimed",
    description: "The proof of participation is recorded onchain in your wallet.",
  }),
  bidPlaced: (): SuccessMessage => ({
    title: "Bid placed",
    description: "Your bid is recorded onchain.",
  }),
  bidAccepted: (): SuccessMessage => ({
    title: "Bid accepted",
    description: "The license is minted to the sponsor's wallet.",
  }),
  responseSent: (): SuccessMessage => ({
    title: "Response sent",
    description: "Your response is recorded onchain.",
  }),
  proposalWithdrawn: (): SuccessMessage => ({
    title: "Proposal withdrawn",
    description: "The proposal is closed onchain.",
  }),
  ownershipTransferred: ({ name, to }: { name: string; to: string }): SuccessMessage => ({
    title: "Ownership transferred",
    description: `${to} is the owner of ${name}.`,
  }),
  credentialIssued: (): SuccessMessage => ({
    title: "Credential issued",
    description: "The credential is recorded onchain in the participant's wallet.",
  }),
  participantsPublished: ({ count }: { count: number }): SuccessMessage => ({
    title: "Participants published",
    description: `The list of ${count} participant${count !== 1 ? "s" : ""} is recorded onchain. Each one claims with their own link.`,
  }),
  walletActivated: (): SuccessMessage => ({
    title: "Wallet activated",
    description: "Your wallet is recorded onchain and can receive and send assets.",
  }),
  sent: ({ amount, symbol, to }: { amount: string; symbol: string; to: string }): SuccessMessage => ({
    title: "Transfer completed",
    description: `${amount} ${symbol} sent to ${to}. The transfer is recorded onchain.`,
  }),
  licenseGranted: ({ price }: { price: string }): SuccessMessage => ({
    title: "License granted",
    description: `The remix is minted and listed for ${price}. The buyer completes the purchase from their portfolio.`,
  }),
  cancelled: ({ kind }: { kind: string }): SuccessMessage => ({
    title: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} cancelled`,
    description: "The order is cancelled onchain.",
  }),
};
