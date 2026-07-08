import { TokenCard } from '@medialane/ui';

const makeToken = (overrides: Record<string, unknown> = {}) => ({
  tokenId: '1',
  contractAddress: '0x04a2d0b8c8fe5cd1f7c3e8b23e9c4b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  chain: 'starknet',
  metadata: {
    name: 'Harmonia Suite #1',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80',
    attributes: [],
  },
  activeOrders: [],
  ...overrides,
});

export const Browse = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: '12px' }}>
    <TokenCard token={makeToken()} />
    <TokenCard
      token={makeToken({
        tokenId: '2',
        metadata: { name: 'Neon Metropolis #2', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80', attributes: [] },
        activeOrders: [{ price: '120000000000000', currency: 'ETH', orderId: '0xabc', status: 'active' }],
      })}
      onBuy={() => {}}
    />
    <TokenCard
      token={makeToken({ tokenId: '3', metadata: { name: 'Open Canvas #3', image: null, attributes: [] } })}
      rarityTier="legendary"
    />
  </div>
);

export const Owner = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: '12px' }}>
    <TokenCard
      token={makeToken()}
      isOwner
      onList={() => {}}
      onTransfer={() => {}}
    />
    <TokenCard
      token={makeToken({
        tokenId: '2',
        activeOrders: [{ price: '50000000000000000', currency: 'ETH', orderId: '0xdef', status: 'active' }],
      })}
      isOwner
      onCancel={() => {}}
    />
  </div>
);
