import { HeroSlider } from '@medialane/ui';

const makeCollection = (overrides: Record<string, unknown> = {}) => ({
  contractAddress: '0x04a2d0b8c8fe5cd1f7c3e8b23e9c4b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  name: 'Harmonia Suite',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  totalTokens: 24,
  floorPrice: '0.05',
  chain: 'starknet',
  ...overrides,
});

export const WithCollections = () => (
  <div style={{ width: '700px', height: '420px' }}>
    <HeroSlider
      collections={[
        makeCollection(),
        makeCollection({ name: 'Neon Metropolis', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80', floorPrice: '1.2' }),
        makeCollection({ name: 'Open Canvas', image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80', floorPrice: null }),
      ]}
      isLoading={false}
      getHref={(col) => `/collections/${col.contractAddress}`}
    />
  </div>
);

export const Loading = () => (
  <div style={{ width: '700px', height: '420px' }}>
    <HeroSlider collections={[]} isLoading getHref={(col) => `/collections/${col.contractAddress}`} />
  </div>
);

export const Empty = () => (
  <div style={{ width: '700px', height: '420px' }}>
    <HeroSlider
      collections={[]}
      isLoading={false}
      getHref={(col) => `/collections/${col.contractAddress}`}
      placeholderHrefs={{ markets: '/marketplace', create: '/create' }}
    />
  </div>
);
