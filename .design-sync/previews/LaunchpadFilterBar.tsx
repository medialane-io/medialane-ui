import { LaunchpadFilterBar, LAUNCHPAD_SERVICE_GROUPS } from '@medialane/ui';

const sections = LAUNCHPAD_SERVICE_GROUPS.filter((g) => g.key !== 'coming-soon').map((group) => ({ group, count: 3 }));

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '680px' }}>
    <LaunchpadFilterBar query="" onQueryChange={() => {}} sections={sections} />
  </div>
);

export const Filtered = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '680px' }}>
    <LaunchpadFilterBar query="coin" onQueryChange={() => {}} sections={sections.filter((s) => s.group.key === 'coins')} />
  </div>
);
