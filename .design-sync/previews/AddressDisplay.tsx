import { AddressDisplay } from '@medialane/ui';

const BG = { background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '12px', color: 'hsl(210 20% 95%)' };
const ADDR = '0x04a2d0b8c8fe5cd1f7c3e8b23e9c4b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b';

export const Default = () => (
  <div style={BG}>
    <AddressDisplay address={ADDR} />
    <AddressDisplay address={ADDR} chars={6} />
    <AddressDisplay address={ADDR} showCopy={false} />
  </div>
);
