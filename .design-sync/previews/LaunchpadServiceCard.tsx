import { LaunchpadServiceCard, LAUNCHPAD_SERVICE_DEFINITIONS } from '@medialane/ui';

const def = (key: string) => LAUNCHPAD_SERVICE_DEFINITIONS.find((d) => d.key === key)!;

export const Grid = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: '12px' }}>
    <LaunchpadServiceCard def={def('mint-ip-asset')} override={{ href: '/create/asset', status: 'live' }} index={0} />
    <LaunchpadServiceCard def={def('create-collection')} override={{ href: '/create/collection', status: 'live' }} index={1} />
    <LaunchpadServiceCard def={def('creator-coins')} override={{ href: '/coins/create', status: 'live' }} index={2} />
    <LaunchpadServiceCard def={def('pop-protocol')} override={{ href: '/pop', status: 'live' }} index={3} />
  </div>
);

export const Featured = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', width: '580px' }}>
    <LaunchpadServiceCard def={def('pop-protocol')} override={{ href: '/pop', status: 'live' }} featured index={0} />
  </div>
);

export const ComingSoon = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: '12px' }}>
    <LaunchpadServiceCard def={def('collection-drop')} override={{ status: 'coming-soon' }} index={0} />
    <LaunchpadServiceCard def={def('remix-asset')} override={{ status: 'coming-soon' }} index={1} />
  </div>
);
