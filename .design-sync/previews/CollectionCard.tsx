import { CollectionCard } from '@medialane/ui';

const makeCollection = (overrides: Record<string, unknown> = {}) => ({
  contractAddress: '0x04a2d0b8c8fe5cd1f7c3e8b23e9c4b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  name: 'Harmonia Suite',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
  totalTokens: 24,
  floorPrice: '0.05',
  chain: 'starknet',
  ...overrides,
});

export const Grid = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 180px)', gap: '12px' }}>
    <CollectionCard collection={makeCollection()} />
    <CollectionCard collection={makeCollection({ name: 'Neon Metropolis', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80', floorPrice: '1.2' })} />
    <CollectionCard collection={makeCollection({ name: 'Open Source Studies', image: null, floorPrice: null })} />
  </div>
);

export const WithSettings = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 180px)', gap: '12px' }}>
    <CollectionCard collection={makeCollection()} settingsHref="/manage/collections/0x04a2d" />
    <CollectionCard collection={makeCollection({ name: 'My Art Drop', image: null })} settingsHref="/manage/collections/0x04b3e" />
  </div>
);
