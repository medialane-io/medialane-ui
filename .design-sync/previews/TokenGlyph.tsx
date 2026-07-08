import { TokenGlyph, TokenAmount } from '@medialane/ui';

const BG = { background: 'hsl(224 50% 4%)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' as const };

export const Glyphs = () => (
  <div style={BG}>
    <TokenGlyph token="strk" size={20} />
    <TokenGlyph token="eth" size={20} />
    <TokenGlyph token="usdc" size={20} />
    <TokenGlyph token="usdt" size={20} />
    <TokenGlyph token="strk" size={32} />
    <TokenGlyph token="eth" size={32} />
    <TokenGlyph token="usdc" size={32} />
  </div>
);

export const Amounts = () => (
  <div style={{ ...BG, flexDirection: 'column', alignItems: 'flex-start' }}>
    <TokenAmount token="strk" amount="142.5" size={20} />
    <TokenAmount token="eth" amount="0.025" size={20} />
    <TokenAmount token="usdc" amount="1,200" size={20} />
    <TokenAmount token="strk" amount="5,000" size={28} bold />
  </div>
);
