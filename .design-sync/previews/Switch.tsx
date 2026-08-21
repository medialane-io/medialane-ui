import { Switch } from '@medialane/ui';

export const States = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
    <Switch />
    <Switch defaultChecked />
    <Switch disabled />
  </div>
);
