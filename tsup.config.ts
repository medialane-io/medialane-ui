import { defineConfig } from "tsup";

export default defineConfig([
  // Main components + utils — transpile individually so "use client" directives are preserved
  {
    entry: ["src/index.ts", "src/components/*.tsx", "src/utils/*.ts", "src/data/*.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    bundle: false,
    external: ["react", "react-dom", "next", "next-themes", "lucide-react", "tailwind-merge", "clsx"],
    outDir: "dist",
  },
  // Preset — bundled separately (no React, no "use client" needed)
  {
    entry: { "preset/tailwind": "src/preset/tailwind.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    splitting: false,
    external: ["tailwindcss"],
    outDir: "dist",
  },
]);
