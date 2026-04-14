"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export interface MedialaneLogoFullProps {
  width?: number;
  height?: number;
  href?: string;
  className?: string;
}

export function MedialaneLogoFull({
  width = 196,
  height = 34,
  href = "/",
  className,
}: MedialaneLogoFullProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Link href={href} className={className}>
          <div style={{ width, height }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={href}
        className={`transition-opacity hover:opacity-80 drop-shadow-md ${className ?? ""}`}
      >
        {resolvedTheme === "dark" ? (
          <Image
            src="/medialane-light-logo.png"
            alt="Medialane"
            width={width}
            height={height}
            priority
          />
        ) : (
          <Image
            src="/medialane-dark-logo.png"
            alt="Medialane"
            width={width}
            height={height}
            priority
          />
        )}
      </Link>
    </div>
  );
}
