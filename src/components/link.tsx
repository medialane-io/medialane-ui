// Internal indirection over next/link — never import next/link directly
// elsewhere in this package. Every consuming app is Next.js today, so this
// re-exports the real thing; the seam exists so a future non-Next context
// (a bundler/tool that can't resolve next/*, or a genuinely non-Next host)
// is a one-file swap instead of a package-wide grep.
export { default } from "next/link";
