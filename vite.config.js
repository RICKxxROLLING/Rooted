import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mirrors the /api/upc proxy in nginx.conf — UPC Item DB blocks browser CORS
const proxy = {
  '/api/upc': {
    target: 'https://api.upcitemdb.com',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api\/upc/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
  build: {
    outDir: 'dist',
    // Inline small assets to reduce requests
    assetsInlineLimit: 4096,
  },
})
