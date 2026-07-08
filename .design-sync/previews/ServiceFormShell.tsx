import { ServiceFormShell } from '@medialane/ui';
import { Zap } from 'lucide-react';

const FormPlaceholder = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '0.75rem', color: 'hsl(220 10% 55%)', fontWeight: 600 }}>Title</label>
      <input style={{ background: 'hsl(224 40% 8%)', border: '1px solid hsl(262 30% 18%)', borderRadius: '8px', padding: '10px 12px', color: 'hsl(210 20% 95%)', fontSize: '0.875rem', outline: 'none' }} placeholder="Name your work" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '0.75rem', color: 'hsl(220 10% 55%)', fontWeight: 600 }}>Description</label>
      <textarea style={{ background: 'hsl(224 40% 8%)', border: '1px solid hsl(262 30% 18%)', borderRadius: '8px', padding: '10px 12px', color: 'hsl(210 20% 95%)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', minHeight: '80px' }} placeholder="Describe your work" />
    </div>
    <button style={{ background: 'hsl(248 81% 65%)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', alignSelf: 'flex-start' }}>Publish</button>
  </div>
);

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '680px' }}>
    <ServiceFormShell
      icon={<Zap className="h-4 w-4 text-white" />}
      title="Publish your work"
      subtitle="Register your creative work as an IP asset on Starknet. Free and permanent."
    >
      <FormPlaceholder />
    </ServiceFormShell>
  </div>
);
