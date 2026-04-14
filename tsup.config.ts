import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "preset/tailwind": "src/preset/tailwind.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react", "react-dom", "next", "next-themes", "lucide-react", "tailwind-merge", "clsx"],
  outDir: "dist",
});
