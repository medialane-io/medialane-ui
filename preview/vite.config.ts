import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "preview",
  plugins: [react()],
  resolve: {
    alias: {
      "@medialane/ui": "/src",
    },
    // Every file in src/ imports its siblings with a ".js" specifier that
    // actually resolves to a ".tsx"/".ts" file on disk (TypeScript's
    // "Bundler" moduleResolution convention, already relied on by tsup and
    // tsc elsewhere in this repo). Vite's dev-server resolver takes
    // explicit extensions literally unlike tsup/tsc, so without this it
    // 404s on every internal import — this option tells it to also try
    // .tsx/.ts when a .js specifier doesn't match a real file.
    extensionAlias: {
      ".js": [".tsx", ".ts", ".jsx", ".js"],
    },
  },
});
