import { IpTypeBadge } from '@medialane/ui';

const BG = { background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center' };

export const AllTypes = () => (
  <div style={BG}>
    <IpTypeBadge ipType="Music" size="md" />
    <IpTypeBadge ipType="Art" size="md" />
    <IpTypeBadge ipType="Video" size="md" />
    <IpTypeBadge ipType="Literature" size="md" />
    <IpTypeBadge ipType="Photography" size="md" />
    <IpTypeBadge ipType="Software" size="md" />
    <IpTypeBadge ipType="Design" size="md" />
  </div>
);

export const Sizes = () => (
  <div style={BG}>
    <IpTypeBadge ipType="Music" size="sm" />
    <IpTypeBadge ipType="Music" size="md" />
  </div>
);
