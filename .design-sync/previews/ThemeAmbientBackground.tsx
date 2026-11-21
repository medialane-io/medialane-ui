import { ThemeAmbientBackground } from '@medialane/ui';

export const Default = () => (
  <div style={{ position: 'relative', transform: 'scale(1)', width: '400px', height: '240px', overflow: 'hidden', background: 'hsl(224 50% 4%)' }}>
    <ThemeAmbientBackground imageUrl="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80" />
    <div style={{ position: 'relative', padding: '16px', color: '#fff', font: '600 14px system-ui' }}>Ambient backdrop behind page content</div>
  </div>
);
