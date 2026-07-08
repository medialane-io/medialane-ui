import { ActionButton } from '@medialane/ui';
import { Zap, ArrowRight, Star } from 'lucide-react';

export const Primary = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
    <ActionButton action="submit" icon={<Zap size={16} />}>Publish IP</ActionButton>
    <ActionButton action="offer" icon={<Star size={16} />}>Make Offer</ActionButton>
    <ActionButton action="buy" icon={<ArrowRight size={16} />}>Buy Now</ActionButton>
  </div>
);

export const BigHero = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
    <ActionButton action="submit" big icon={<Zap size={18} />}>Create your IP</ActionButton>
    <ActionButton action="buy" big icon={<ArrowRight size={18} />}>Explore market</ActionButton>
  </div>
);

export const Ghost = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
    <ActionButton ghost>Cancel</ActionButton>
    <ActionButton ghost icon={<Star size={16} />}>Save Draft</ActionButton>
  </div>
);

export const ToneVariants = () => (
  <div style={{ background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
    <ActionButton tone="blue">Manage</ActionButton>
    <ActionButton tone="indigo">Transfer</ActionButton>
    <ActionButton tone="red">Burn</ActionButton>
  </div>
);
