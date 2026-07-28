"use client";

/**
 * App-wide ambient background sourced from the signed-in user's own avatar/
 * theme image. Blur + low opacity only — no color extraction, no glow
 * blobs, no tint. Renders nothing when no image is set, so mounting it
 * unconditionally never changes the no-theme-set look of the app.
 */
export function ThemeAmbientBackground({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110"
        style={{ filter: "blur(60px) saturate(1.5)" }}
      />
    </div>
  );
}
