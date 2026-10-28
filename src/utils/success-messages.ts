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
  cancelled: ({ kind }: { kind: string }): SuccessMessage => ({
    title: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} cancelled`,
    description: "The order is cancelled onchain.",
  }),
};
