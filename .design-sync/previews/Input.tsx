import { Input } from '@medialane/ui';

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
    <Input placeholder="Search creative works" />
    <Input defaultValue="Harmonia Suite #1" />
    <Input placeholder="Disabled" disabled />
  </div>
);
