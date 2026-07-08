"use client";

// The signature "action focus" dialog shell — the app recedes into a blurred,
// oversaturated backdrop while a single clean decision panel floats centered.
// Requires mlFade / mlPop keyframes from @medialane/ui/styles.

export interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  /** Card width in px. */
  width?: number;
  children: React.ReactNode;
}

export function ActionDialog({ open, onClose, width = 540, children }: ActionDialogProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backdropFilter: 'blur(28px) saturate(150%)',
        WebkitBackdropFilter: 'blur(28px) saturate(150%)',
        background: 'rgba(6,7,15,0.55)',
        animation: 'mlFade .18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-card text-card-foreground border border-border overflow-y-auto"
        style={{
          width,
          maxWidth: '100%',
          maxHeight: '92vh',
          borderRadius: 24,
          boxShadow: '0 50px 120px rgba(0,0,0,0.6)',
          animation: 'mlPop .22s cubic-bezier(.2,.8,.3,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
