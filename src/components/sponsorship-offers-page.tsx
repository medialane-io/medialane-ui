"use client";

import { ArrowRight, Check, Handshake } from "lucide-react";
import { formatAmount, getTokenByAddress, type ApiSponsorshipOffer } from "@medialane/sdk";
import { AssetCard, AssetCardSkeleton } from "./asset-card.js";
import { BackButton } from "./back-button.js";
import Link from "./link.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { ServiceHeader } from "./service-header.js";
import { shortenAddress } from "../utils/address.js";
import { useSponsorshipOffers } from "../utils/use-sponsorship.js";
import { useToken } from "../utils/use-tokens.js";
import { useT } from "../i18n/provider.js";

import { msg } from "../i18n/translate.js";
import { ActionButton } from "./action-button.js";
import { panelTint } from "./panel.js";
import { IconTile } from "./icon-tile.js";
const FEATURES = [
  msg("Direct settlement"),
  msg("Owner-verified on-chain"),
  msg("Open bidding or one invited sponsor"),
];

function OfferCard({ offer }: { offer: ApiSponsorshipOffer }) {
  const { token } = useToken(offer.nftContract, offer.tokenId);
  const paymentToken = getTokenByAddress(offer.paymentToken);
  const min = paymentToken ? `Min ${formatAmount(offer.minAmount, paymentToken.decimals)} ${paymentToken.symbol}` : `Min ${offer.minAmount}`;
  const days = Math.round(Number(offer.duration) / 86400);

  return (
    <AssetCard
      href={`/launchpad/sponsorship/${offer.offerId}`}
      name={token?.metadata?.name ?? `Token #${offer.tokenId}`}
      image={token?.metadata?.image ?? null}
      subtitle={shortenAddress(offer.nftContract)}
      fallbackId={offer.tokenId}
      price={{ formatted: `${min} · ${days}d`, currency: null }}
    />
  );
}

export function SponsorshipOffersPage() {
  const t = useT();
  const { offers, isLoading } = useSponsorshipOffers();
  const openOffers = offers.filter((o) => o.open);

  return (
    <div className="pb-16 space-y-10">
      <section className="px-4 pt-10 max-w-5xl mx-auto">
        <BackButton />
        <FadeIn>
          <div className="mt-6">
            <ServiceHeader
              plain
              icon={<Handshake className="h-4 w-4 text-white" />}
              title={t("IP Sponsorship")}
              subtitle={t("Sponsors bid for a license.")}
            />
          </div>
        </FadeIn>
      </section>

      <section className="px-4 max-w-5xl mx-auto">
        <FadeIn>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-background/40">
                <Check className="h-3 w-3 text-brand-rose shrink-0" />
                {t(f)}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      <section className="px-4 max-w-5xl mx-auto">
        <FadeIn>
          <div className="panel p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" style={panelTint("rose")}>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">{t("Start a sponsorship deal")}</p>
              <p className="text-xs text-muted-foreground">
                {t("Open an asset to sponsors.")}
              </p>
            </div>
            <ActionButton solid small asChild className="shrink-0">
              <Link href="/launchpad/sponsorship/create">
                {t("Get started")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </ActionButton>
          </div>
        </FadeIn>
      </section>

      <section className="px-4 space-y-4 max-w-5xl mx-auto">
        <FadeIn>
          <div>
            <p className="section-label">{t("Open")}</p>
            <h2 className="text-xl font-bold mt-0.5">{t("Sponsorship offers")}</h2>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <AssetCardSkeleton key={i} />)}
          </div>
        ) : openOffers.length === 0 ? (
          <FadeIn>
            <div className="panel relative overflow-hidden p-12 text-center space-y-4">
              <div className="flex justify-center">
                <IconTile size="lg">
                  <Handshake />
                </IconTile>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm">{t("No open sponsorship offers yet")}</p>
                <p className="text-xs text-muted-foreground">{t("Sponsors bid on open offers here.")}</p>
              </div>
            </div>
          </FadeIn>
        ) : (
          <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {openOffers.map((offer) => (
              <StaggerItem key={offer.id}>
                <OfferCard offer={offer} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  );
}
