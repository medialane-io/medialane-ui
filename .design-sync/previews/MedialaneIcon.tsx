import { MedialaneIcon } from '@medialane/ui';

const BG = { background: 'hsl(224 50% 4%)', padding: '32px', display: 'flex', gap: '24px', alignItems: 'center' };

export const Sizes = () => (
  <div style={BG}>
    <MedialaneIcon size={20} />
    <MedialaneIcon size={32} />
    <MedialaneIcon size={48} />
    <MedialaneIcon size={64} />
  </div>
);
