import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 3000,
    // Dev requests are proxied to the deployed backend server-side, so the browser stays same-origin
    // (no CORS needed). To use a local backend instead, change target to http://localhost:4000.
    proxy: {
      "/api/v1": {
        target: "https://intyoza-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
