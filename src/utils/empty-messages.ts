export interface EmptyMessage {
  title: string;
  description: string;
}

export const emptyMessages = {
  activity: {
    title: "Activity appears here",
    description: "Mints, listings, offers and sales are recorded here as they happen.",
  },
  walletActivity: {
    title: "Activity appears here",
    description: "Transfers and purchases from this wallet are recorded here.",
  },
  coins: {
    title: "Coins appear here",
    description: "Each launched coin is listed with its market.",
  },
  assetsOfType: {
    title: "Assets of this type appear here",
    description: "They are listed as they are minted.",
  },
  listings: {
    title: "Listings appear here",
    description: "Assets listed for sale are shown here.",
  },
  offers: {
    title: "Offers appear here",
    description: "Open offers on assets are shown here.",
  },
  heldLicenses: {
    title: "Licenses you hold appear here",
    description: "You receive a license when a bid is accepted.",
  },
  issuedLicenses: {
    title: "Licenses issued on your work appear here",
    description: "A license you issue appears here when you accept a bid.",
  },
} satisfies Record<string, EmptyMessage>;
