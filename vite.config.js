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
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue 核心
          'vue-vendor': ['vue', 'vue-router'],
          // UI 框架
          'element-plus': ['element-plus'],
          // Markdown 编辑器（含 mermaid/katex/highlight.js，体积较大）
          'md-editor': ['md-editor-v3'],
        },
      },
    },
  },
});
