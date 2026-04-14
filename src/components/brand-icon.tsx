import Image from "next/image";
import Link from "next/link";

export interface MedialaneIconProps {
  size?: number;
  href?: string;
  className?: string;
}

export function MedialaneIcon({ size = 256, href = "/", className }: MedialaneIconProps) {
  return (
    <Link
      href={href}
      className={`transition-opacity hover:opacity-80 drop-shadow-md ${className ?? ""}`}
    >
      <Image
        src="/icon.png"
        alt="Medialane"
        width={size}
        height={size}
        priority
      />
    </Link>
  );
}
