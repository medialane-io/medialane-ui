import { LaunchpadFilterBar, LAUNCHPAD_SERVICE_GROUPS } from '@medialane/ui';

export const Default = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '680px' }}>
    <LaunchpadFilterBar
      query=""
      onQueryChange={() => {}}
      groups={LAUNCHPAD_SERVICE_GROUPS}
      activeGroups={new Set()}
      onToggleGroup={() => {}}
      resultCount={12}
    />
  </div>
);

export const Filtered = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '680px' }}>
    <LaunchpadFilterBar
      query="coin"
      onQueryChange={() => {}}
      groups={LAUNCHPAD_SERVICE_GROUPS}
      activeGroups={new Set(['coins'])}
      onToggleGroup={() => {}}
      resultCount={2}
    />
  </div>
);
