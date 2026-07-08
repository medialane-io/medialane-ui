import { AssetCardSkeleton } from '@medialane/ui';

export const Loading = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
    <AssetCardSkeleton />
    <AssetCardSkeleton />
    <AssetCardSkeleton />
  </div>
);
