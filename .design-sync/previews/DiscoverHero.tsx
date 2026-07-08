import { DiscoverHero } from '@medialane/ui';

const ORDERS = [
  { orderId: '0x1', nftContract: '0x04a2', nftTokenId: '1', price: '50000000000000000', currency: 'ETH', type: 'sale', metadata: { name: 'Harmonia #1', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&q=80' }, status: 'filled' },
  { orderId: '0x2', nftContract: '0x04b3', nftTokenId: '2', price: '120000000000000', currency: 'STRK', type: 'sale', metadata: { name: 'Neon Study #2', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&q=80' }, status: 'filled' },
  { orderId: '0x3', nftContract: '0x04c4', nftTokenId: '7', price: '200000000000000000', currency: 'ETH', type: 'sale', metadata: { name: 'Open Canvas #7', image: null }, status: 'filled' },
];

export const WithData = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '700px' }}>
    <DiscoverHero
      stats={{ collections: 1842, tokens: 28340, sales: 5120 }}
      orders={ORDERS as never}
      getTickerHref={(o) => `/asset/${(o as { nftContract: string }).nftContract}/${(o as { nftTokenId: string }).nftTokenId}`}
    />
  </div>
);

export const NoData = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '700px' }}>
    <DiscoverHero stats={null} orders={[]} />
  </div>
);
