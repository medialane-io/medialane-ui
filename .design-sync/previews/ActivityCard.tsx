import { ActivityCard } from '@medialane/ui';

const makeActivity = (type: string, overrides: Record<string, unknown> = {}) => ({
  id: `act-${type}-1`,
  type,
  nftContract: '0x04a2d0b8c8fe5cd1f7c3e8b23e9c4b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  nftTokenId: '1',
  price: '50000000000000000',
  currency: 'ETH',
  from: '0x0abc',
  to: '0x0def',
  offerer: null,
  fulfiller: null,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  metadata: {
    name: 'Harmonia Suite #1',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80',
  },
  ...overrides,
});

export const Grid = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 180px)', gap: '12px' }}>
    <ActivityCard activity={makeActivity('sale') as never} />
    <ActivityCard activity={makeActivity('mint', { price: null, metadata: { name: 'Open Canvas #7', image: null } }) as never} />
    <ActivityCard activity={makeActivity('list', { metadata: { name: 'Neon Study #2', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80' } }) as never} />
  </div>
);
