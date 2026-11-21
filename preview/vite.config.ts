import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "preview",
  plugins: [react()],
  resolve: {
    alias: {
      "@medialane/ui": "/src",
    },
    extensionAlias: {
      ".js": [".tsx", ".ts", ".jsx", ".js"],
    },
  },
});
