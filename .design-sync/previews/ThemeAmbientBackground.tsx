import { ThemeAmbientBackground } from '@medialane/ui';

// The component is `fixed inset-0 -z-10` by design (a page-level backdrop
// layer). A `transform` on the wrapper creates a new containing block so the
// fixed child is scoped to this card instead of escaping to the viewport.
export const Default = () => (
  <div style={{ position: 'relative', transform: 'scale(1)', width: '400px', height: '240px', overflow: 'hidden', background: 'hsl(224 50% 4%)' }}>
    <ThemeAmbientBackground imageUrl="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80" />
    <div style={{ position: 'relative', padding: '16px', color: '#fff', font: '600 14px system-ui' }}>Ambient backdrop behind page content</div>
  </div>
);
