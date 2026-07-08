import { MedialaneLogoFull } from '@medialane/ui';

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
    <MedialaneLogoFull height={28} />
    <MedialaneLogoFull height={40} />
  </div>
);

export const OnLight = () => (
  <div style={{ background: 'hsl(210 30% 96%)', padding: '32px', display: 'flex', gap: '24px', alignItems: 'center' }}>
    <MedialaneLogoFull height={32} />
  </div>
);
