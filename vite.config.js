import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { exec } from "child_process";

const localBuildPlugin = () => ({
  name: "local-build-plugin",
  configureServer(server) {
    // Legacy build endpoint removed in favor of /api/build queue system
    // This plugin is now just a placeholder or can be removed entirely if safe
  },
});

export default defineConfig({
  plugins: [vue(), localBuildPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      punycode: "punycode",
    },
  },
  server: {
    port: 3000,
    allowedHosts: ["note.gishai.top"],
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        // target: 'https://mdpress.glicon.design/common',
        // rewrite: (path) => path.replace(/^\/glicon/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
