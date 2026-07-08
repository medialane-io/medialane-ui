import { BadgeShelf } from '@medialane/ui';

const BADGES = [
  { key: 'first-mint', name: 'First Mint', description: 'Minted your first IP asset', icon: 'Zap', color: '#60a5fa', category: 'milestones' },
  { key: 'collector', name: 'Collector', description: 'Purchased 5 tokens', icon: 'ShoppingBag', color: '#a78bfa', category: 'trading' },
  { key: 'voyager', name: 'Voyager', description: 'Reached level 6', icon: 'Rocket', color: '#34d399', category: 'progression' },
  { key: 'creator', name: 'Creator', description: 'Published 10+ works', icon: 'Palette', color: '#f97316', category: 'creation' },
  { key: 'pioneer', name: 'Pioneer', description: 'Early adopter', icon: 'Star', color: '#f43f5e', category: 'special' },
];

export const AllEarned = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '500px' }}>
    <BadgeShelf badges={BADGES} />
  </div>
);

export const PartialWithLocked = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', maxWidth: '500px' }}>
    <BadgeShelf badges={BADGES} earnedKeys={['first-mint', 'voyager']} showLocked />
  </div>
);
