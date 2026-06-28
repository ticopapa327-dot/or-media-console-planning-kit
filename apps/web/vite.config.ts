import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@or-media-console/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:4100",
      "/healthz": "http://127.0.0.1:4100"
    }
  }
});
