import { XpProgress } from '@medialane/ui';

const BG = { background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '16px' };

export const Bars = () => (
  <div style={BG}>
    <XpProgress totalXp={250} levelXp={200} nextLevelXp={400} badgeColor="#60a5fa" variant="bar" />
    <XpProgress totalXp={850} levelXp={800} nextLevelXp={1000} badgeColor="#a78bfa" variant="bar" />
    <XpProgress totalXp={1000} levelXp={1000} nextLevelXp={null} badgeColor="#f97316" variant="bar" />
  </div>
);

export const Rings = () => (
  <div style={{ ...BG, flexDirection: 'row', alignItems: 'center', gap: '24px' }}>
    <XpProgress totalXp={250} levelXp={200} nextLevelXp={400} badgeColor="#60a5fa" variant="ring" size={48} />
    <XpProgress totalXp={850} levelXp={800} nextLevelXp={1000} badgeColor="#a78bfa" variant="ring" size={64} />
    <XpProgress totalXp={1000} levelXp={1000} nextLevelXp={null} badgeColor="#f97316" variant="ring" size={80} />
  </div>
);
