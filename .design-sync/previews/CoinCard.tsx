import { CoinCard } from '@medialane/ui';

const staticPrice = (quotePerCoin: number, symbol: string) => () => ({
  price: { quotePerCoin, quoteSymbol: symbol },
  isLoading: false,
});
const loadingPrice = () => ({ price: null, isLoading: true });

const makeCollection = (overrides: Record<string, unknown> = {}) => ({
  contractAddress: '0x04a2d0b8c8fe5cd1f7c3e8b23e9c4b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  name: 'MLANE',
  symbol: 'MLANE',
  service: 'creator-coin',
  image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80',
  profile: null,
  chain: 'starknet',
  ...overrides,
});

export const Grid = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 180px)', gap: '12px' }}>
    <CoinCard
      collection={makeCollection() as never}
      usePrice={staticPrice(0.0042, 'ETH') as never}
      href="/coins/0x04a2"
    />
    <CoinCard
      collection={makeCollection({ name: 'MEME42', symbol: 'MEME42', service: 'memecoin', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80' }) as never}
      usePrice={staticPrice(124.5, 'STRK') as never}
      href="/coins/0x04b3"
    />
    <CoinCard
      collection={makeCollection({ name: 'NEON', symbol: 'NEON', image: null }) as never}
      usePrice={loadingPrice as never}
      href="/coins/0x04c4"
    />
  </div>
);
