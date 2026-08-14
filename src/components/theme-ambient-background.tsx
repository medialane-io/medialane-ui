"use client";

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
