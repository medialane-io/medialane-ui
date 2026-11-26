import { msg } from "../i18n/translate.js";

export interface EmptyMessage {
  title: string;
  description: string;
}

export const emptyMessages = {
  activity: {
    title: msg("Activity appears here"),
    description: msg("Activity appears here."),
  },
  walletActivity: {
    title: msg("Activity appears here"),
    description: msg("Transfers and purchases from this wallet are recorded here."),
  },
  coins: {
    title: msg("Coins appear here"),
    description: msg("Each launched coin is listed with its market."),
  },
  assetsOfType: {
    title: msg("Assets of this type appear here"),
    description: msg("They are listed as they are minted."),
  },
  listings: {
    title: msg("Listings appear here"),
    description: msg("Assets listed for sale are shown here."),
  },
  offers: {
    title: msg("Offers appear here"),
    description: msg("Open offers on assets are shown here."),
  },
  heldLicenses: {
    title: msg("Licenses you hold appear here"),
    description: msg("You receive a license when a bid is accepted."),
  },
  issuedLicenses: {
    title: msg("Licenses issued on your NFTs appear here"),
    description: msg("A license you issue appears here when you accept a bid."),
  },
} satisfies Record<string, EmptyMessage>;
