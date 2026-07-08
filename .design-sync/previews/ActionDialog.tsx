import { ActionDialog, ActionButton } from '@medialane/ui';
import { Zap } from 'lucide-react';

export const Open = () => (
  <div style={{ background: 'hsl(224 50% 4%)', minHeight: '320px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <ActionDialog open onClose={() => {}} width={400}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ color: 'hsl(210 20% 95%)', fontSize: '1.125rem', fontWeight: 700 }}>Mint your IP</div>
        <div style={{ color: 'hsl(220 10% 55%)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          Your work will be tokenized on Starknet. This is permanent and free — no gas fees.
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <ActionButton action="submit" icon={<Zap size={14} />}>Confirm</ActionButton>
        </div>
      </div>
    </ActionDialog>
  </div>
);
