import { StatPill } from '@medialane/ui';

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
    <StatPill value="1,842" label="collections" />
    <StatPill value="28.3K" label="tokens" />
    <StatPill value="0.05 ETH" label="floor" />
    <StatPill value="12" label="listed" />
  </div>
);
