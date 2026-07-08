import { LevelBadge } from '@medialane/ui';

const BG = { background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center' };

export const Levels = () => (
  <div style={BG}>
    <LevelBadge level={1} name="Newcomer" badgeColor="#60a5fa" size="sm" />
    <LevelBadge level={3} name="Explorer" badgeColor="#a78bfa" size="sm" />
    <LevelBadge level={6} name="Voyager" badgeColor="#34d399" size="md" />
    <LevelBadge level={10} name="Creator" badgeColor="#f97316" size="md" />
    <LevelBadge level={15} name="Master" badgeColor="#f43f5e" size="lg" />
  </div>
);
