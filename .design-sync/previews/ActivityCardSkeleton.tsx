import { ActivityCardSkeleton } from '@medialane/ui';

export const Loading = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'flex', gap: '12px' }}>
    <ActivityCardSkeleton />
    <ActivityCardSkeleton />
    <ActivityCardSkeleton />
  </div>
);
