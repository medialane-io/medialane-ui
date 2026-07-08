import { CurrencyIcon, CurrencyAmount } from '@medialane/ui';

const BG = { background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' as const };

export const Icons = () => (
  <div style={BG}>
    <CurrencyIcon symbol="ETH" size={24} />
    <CurrencyIcon symbol="STRK" size={24} />
    <CurrencyIcon symbol="USDC" size={24} />
    <CurrencyIcon symbol="ETH" size={32} />
    <CurrencyIcon symbol="STRK" size={32} />
  </div>
);

export const Amounts = () => (
  <div style={{ ...BG, flexDirection: 'column', alignItems: 'flex-start' }}>
    <CurrencyAmount amount="0.05" symbol="ETH" size={18} />
    <CurrencyAmount amount="142.5" symbol="STRK" size={18} />
    <CurrencyAmount amount="1,200" symbol="USDC" size={18} />
  </div>
);
