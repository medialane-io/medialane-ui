"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export interface MedialaneIconProps {
  size?: number;
  href?: string;
  className?: string;
}

export function MedialaneIcon({ size = 256, href = "/", className }: MedialaneIconProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link href={href} className={className}>
        <div style={{ width: size, height: size }} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`transition-opacity hover:opacity-80 drop-shadow-md ${className ?? ""}`}
    >
      <Image
        src={resolvedTheme === "dark" ? "/icon.png" : "/icon.png"}
        alt="Medialane"
        width={size}
        height={size}
        priority
      />
    </Link>
  );
}
