import { ServiceHeader } from '@medialane/ui';
import { Zap, Coins, Music } from 'lucide-react';

const BG = { background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '16px', maxWidth: '600px' };

export const Gradient = () => (
  <div style={BG}>
    <ServiceHeader
      icon={<Zap className="h-4 w-4 text-white" />}
      title="Publish your work"
      subtitle="Upload a file and register it as a tokenized IP asset on Starknet. Free, permanent, yours."
    />
  </div>
);

export const Plain = () => (
  <div style={BG}>
    <ServiceHeader
      plain
      icon={<Coins className="h-4 w-4 text-white" />}
      title="Creator Coins"
      subtitle="Launch a coin tied to your creative identity. Fans can hold a stake in your work."
    />
    <ServiceHeader
      plain
      icon={<Music className="h-4 w-4 text-white" />}
      title="Mint IP Asset"
      subtitle="Tokenize any file — music, art, writing — as a unique NFT under your control."
    />
  </div>
);
