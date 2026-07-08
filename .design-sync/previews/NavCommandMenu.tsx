import { NavCommandMenu } from '@medialane/ui';
import { Home, Search, Zap, BarChart2, Star, Settings, HelpCircle } from 'lucide-react';

const COMMANDS = [
  {
    items: [
      { id: 'home', label: 'Home', icon: Home, href: '/' },
      { id: 'discover', label: 'Discover', icon: Search, href: '/discover', keywords: ['explore', 'browse'] },
      { id: 'launchpad', label: 'Launchpad', icon: Zap, href: '/create', keywords: ['mint', 'create', 'publish'] },
      { id: 'marketplace', label: 'Marketplace', icon: BarChart2, href: '/marketplace', keywords: ['buy', 'trade', 'listings'] },
    ],
  },
  {
    heading: 'Account',
    items: [
      { id: 'portfolio', label: 'My Portfolio', icon: Star, href: '/portfolio' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
      { id: 'help', label: 'Help', icon: HelpCircle, href: '/help' },
    ],
  },
];

export const Open = () => (
  <div style={{ background: 'hsl(224 50% 4%)', minHeight: '480px', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px' }}>
    <div style={{ width: '420px' }}>
      <NavCommandMenu
        commands={COMMANDS}
        trigger={<button style={{ padding: '8px 16px', background: 'hsl(262 30% 18%)', border: '1px solid hsl(262 30% 28%)', borderRadius: '8px', color: 'hsl(210 20% 85%)', cursor: 'pointer', fontSize: '0.875rem' }}>Open menu (⌘K)</button>}
      />
    </div>
  </div>
);
