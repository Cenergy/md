import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/glicon': {
        target: 'https://mdpress.glicon.design/common',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/glicon/, '')
      }
    }
  }
})
