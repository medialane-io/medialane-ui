import { Aurora } from '@medialane/ui';

export const Dark = () => (
  <div style={{ width: '600px', height: '300px', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
    <Aurora mode="dark" height={300}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
        Aurora background
      </div>
    </Aurora>
  </div>
);

export const Light = () => (
  <div style={{ width: '600px', height: '300px', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
    <Aurora mode="light" height={300}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'hsl(224 40% 10%)', fontSize: '1.5rem', fontWeight: 700 }}>
        Light aurora
      </div>
    </Aurora>
  </div>
);
