import { CollectionShowcase } from '@medialane/ui';

const makeCollection = (overrides: Record<string, unknown> = {}) => ({
  contractAddress: '0x04a2d0b8c8fe5cd1f7c3e8b23e9c4b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  name: 'Harmonia Suite',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  totalSupply: 24,
  chain: 'starknet',
  ...overrides,
});

export const WithCollections = () => (
  <CollectionShowcase
    collections={[
      makeCollection(),
      makeCollection({ contractAddress: '0x2', name: 'Neon Metropolis', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80' }),
      makeCollection({ contractAddress: '0x3', name: 'Open Canvas', image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80' }),
    ]}
    isLoading={false}
    getHref={(col) => `/collections/${col.contractAddress}`}
  />
);

export const Loading = () => (
  <CollectionShowcase collections={[]} isLoading getHref={(col) => `/collections/${col.contractAddress}`} />
);

export const Empty = () => (
  <CollectionShowcase
    collections={[]}
    isLoading={false}
    getHref={(col) => `/collections/${col.contractAddress}`}
    placeholderHrefs={{ markets: '/marketplace', create: '/create' }}
  />
);
