import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      punycode: "punycode",
    },
  },
  server: {
    port: 3000,
    https: true,
    allowedHosts: ["note.gishai.top"],
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        // target: 'https://mdpress.glicon.design/common',
        // rewrite: (path) => path.replace(/^\/glicon/, ''),
        changeOrigin: true,
        secure: false,
      }
    },
  },
});
