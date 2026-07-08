import { AssetCard } from '@medialane/ui';

const SAMPLE = {
  href: '/asset/0x123/1',
  name: 'Harmonia Suite No. 3',
  image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80',
  subtitle: 'Melodic Echoes',
  ipType: 'Music',
  price: { formatted: '0.05', currency: 'ETH' },
};

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: '12px' }}>
    <AssetCard {...SAMPLE} />
    <AssetCard {...SAMPLE} name="Neon Metropolis" subtitle="Digital Horizons" ipType="Art" price={{ formatted: '1.2', currency: 'STRK' }} />
    <AssetCard {...SAMPLE} name="Solstice Protocol" subtitle="Open Source" ipType="Software" price={null} />
  </div>
);

export const NoImage = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: '12px' }}>
    <AssetCard href="/asset/0x1/42" name="Track 042" fallbackId="42" ipType="Music" price={{ formatted: '0.02', currency: 'ETH' }} />
    <AssetCard href="/asset/0x2/99" name="Untitled Study" fallbackId="99" ipType="Art" />
  </div>
);

export const Indexing = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', width: '200px' }}>
    <AssetCard href="/asset/0x1/1" name="Pending asset" indexing />
  </div>
);
