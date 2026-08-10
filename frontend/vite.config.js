import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // Host dev defaults to localhost:3000; the compose frontend service
      // overrides this with VITE_API_PROXY=http://api:3000
      "/api": process.env.VITE_API_PROXY || "http://localhost:3000",
    },
    watch: {
      // Needed for HMR when the source is bind-mounted on Windows
      usePolling: process.env.VITE_USE_POLLING === "true",
    },
  },
});
