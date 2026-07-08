// Inline SVG token glyphs — self-contained, no external asset dependency.
// Covers the five tokens active on the platform: STRK, ETH, USDC, USDT, WBTC.

const PRICE_FONT = '"Geist Mono", ui-monospace, SFMono-Regular, monospace';

export type TokenSymbol = 'strk' | 'eth' | 'usdc' | 'usdt' | 'wbtc';

export interface TokenGlyphProps {
  token?: TokenSymbol | string;
  size?: number;
}

export function TokenGlyph({ token = 'strk', size = 20 }: TokenGlyphProps) {
  const gradId = `ml-tg-strk-${size}`;

  switch (token) {
    case 'eth':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#2b2f3a"/>
          <path d="M12 4 7 12.2l5 3 5-3L12 4Z" fill="#e6e8f0"/>
          <path d="M7 13.3 12 20l5-6.7-5 3-5-3Z" fill="#b9bdcc"/>
        </svg>
      );
    case 'usdc':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#2775ca"/>
          <text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="system-ui">$</text>
        </svg>
      );
    case 'usdt':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#26a17b"/>
          <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="system-ui">₮</text>
        </svg>
      );
    case 'wbtc':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#f09242"/>
          <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="system-ui">₿</text>
        </svg>
      );
    default:
      // STRK — magenta→orange gradient coin with swoosh
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="3" y1="3" x2="21" y2="21">
              <stop offset="0" stopColor="#f6608f"/>
              <stop offset="1" stopColor="#fb8b46"/>
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="11" fill={`url(#${gradId})`}/>
          <path d="M5.5 14.5c3.2-5 9.8-5 13 0" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="9" cy="10.5" r="0.9" fill="#fff"/>
        </svg>
      );
  }
}

export interface TokenAmountProps {
  token?: TokenSymbol | string;
  amount: string;
  /** Icon size in px. Text size scales proportionally. */
  size?: number;
  /** Override the amount text color. Defaults to brand-price orange. */
  color?: string;
  bold?: boolean;
  className?: string;
}

export function TokenAmount({
  token = 'strk',
  amount,
  size = 20,
  color,
  bold = true,
  className,
}: TokenAmountProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <TokenGlyph token={token} size={size} />
      <span
        style={{
          fontFamily: PRICE_FONT,
          fontWeight: bold ? 700 : 500,
          fontSize: size * 0.92,
          color: color ?? '#f97316',
          letterSpacing: '-0.01em',
        }}
      >
        {amount}
      </span>
    </span>
  );
}
