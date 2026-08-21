import { Textarea } from '@medialane/ui';

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
    <Textarea placeholder="Describe your work..." />
    <Textarea defaultValue="An original handmade artwork exploring creation through light and texture." />
  </div>
);
