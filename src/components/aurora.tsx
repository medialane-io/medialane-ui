// Oversaturated, heavily-blurred aurora backdrop — the signature action-focus surface.
// CSS-driven only; no 3D or mouse-reactive effects (no mobile story, too heavy).

export interface AuroraProps {
  /** Dark uses deep navy base; light uses off-white. */
  mode?: 'dark' | 'light';
  children?: React.ReactNode;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const DARK_BLOBS = [
  'radial-gradient(38% 50% at 22% 42%, rgba(59,123,255,0.85), transparent 70%)',
  'radial-gradient(40% 52% at 74% 30%, rgba(138,92,246,0.80), transparent 70%)',
  'radial-gradient(42% 48% at 64% 82%, rgba(246,96,143,0.70), transparent 70%)',
  'radial-gradient(34% 40% at 30% 88%, rgba(251,139,70,0.55), transparent 70%)',
  'radial-gradient(30% 38% at 88% 70%, rgba(91,76,230,0.40), transparent 70%)',
];

const LIGHT_BLOBS = [
  'radial-gradient(40% 52% at 20% 38%, rgba(59,123,255,0.55), transparent 70%)',
  'radial-gradient(42% 52% at 76% 28%, rgba(138,92,246,0.48), transparent 70%)',
  'radial-gradient(44% 50% at 66% 84%, rgba(246,96,143,0.42), transparent 70%)',
  'radial-gradient(34% 40% at 28% 86%, rgba(251,139,70,0.40), transparent 70%)',
];

export function Aurora({ mode = 'dark', children, height = 900, className, style }: AuroraProps) {
  const isDark = mode === 'dark';
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        background: isDark ? '#06070f' : '#eef1f8',
        isolation: 'isolate',
        ...style,
      }}
    >
      {/* Blurred blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-15%',
          filter: 'blur(90px) saturate(150%)',
          backgroundImage: (isDark ? DARK_BLOBS : LIGHT_BLOBS).join(', '),
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 28%, rgba(6,7,15,0.62) 100%)'
            : 'radial-gradient(ellipse at center, transparent 35%, rgba(238,241,248,0.5) 100%)',
        }}
      />
      <div style={{ position: 'relative', height: '100%' }}>{children}</div>
    </div>
  );
}
