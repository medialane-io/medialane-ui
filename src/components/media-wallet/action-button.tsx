"use client";

export function TrustNote({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-2xs leading-relaxed text-muted-foreground ${center ? "justify-center" : ""}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
