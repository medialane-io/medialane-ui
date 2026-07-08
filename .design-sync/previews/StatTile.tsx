import { StatTile, StatPill } from '@medialane/ui';

export const Grid = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 140px)', gap: '8px' }}>
    <StatTile label="Floor" value="0.05" sub="ETH" />
    <StatTile label="Volume" value="14.2K" sub="STRK" accent="hsl(248 81% 70%)" />
    <StatTile label="Listed" value="12" sub="of 24" />
    <StatTile label="Owners" value="—" />
    <StatTile label="Total sales" value="1,842" big />
    <StatTile label="Creators" value="302" big accent="hsl(21 90% 58%)" />
  </div>
);

export const Pills = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
    <StatPill value="24" label="tokens" />
    <StatPill value="0.05 ETH" label="floor" />
    <StatPill value="12" label="listed" />
  </div>
);
