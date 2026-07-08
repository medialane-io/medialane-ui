import { FeaturedCarousel } from '@medialane/ui';

const makeCollection = (name: string, image: string | null = null) => ({
  contractAddress: `0x0${name.slice(0, 4).toLowerCase()}`,
  name,
  image,
  totalTokens: 12,
  floorPrice: '0.08',
  chain: 'starknet',
});

export const WithCollections = () => (
  <div style={{ width: '700px', height: '420px' }}>
    <FeaturedCarousel
      collections={[
        makeCollection('Harmonia Suite', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'),
        makeCollection('Neon Metropolis', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80'),
        makeCollection('Open Canvas', 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80'),
      ]}
      isLoading={false}
      getHref={(col) => `/collections/${col.contractAddress}`}
      allCollectionsHref="/collections"
    />
  </div>
);

export const Loading = () => (
  <div style={{ width: '700px', height: '420px' }}>
    <FeaturedCarousel collections={[]} isLoading getHref={(col) => `/collections/${col.contractAddress}`} />
  </div>
);
