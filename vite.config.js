import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

// Mirrors the /api proxies in nginx/templates/default.conf.template so local
// dev behaves like production. Keys come from .env WITHOUT the VITE_ prefix,
// so Vite never exposes them to browser code.
function apiProxy(env) {
  // Swap the path prefix and add params, keeping the browser's own query (?q=…)
  const rewriteWithParams = (path, from, to, extra) => {
    const [pathname, query = ''] = path.split('?')
    const params = new URLSearchParams(query)
    for (const [k, v] of Object.entries(extra)) params.set(k, v)
    return `${pathname.replace(from, to)}?${params}`
  }
  return {
    '/api/plantnet/identify': {
      target: 'https://my-api.plantnet.org',
      changeOrigin: true,
      rewrite: () => `/v2/identify/all?${new URLSearchParams({ 'api-key': env.PLANTNET_KEY || '', lang: 'en', 'nb-results': '5' })}`,
    },
    '/api/perenual': {
      target: 'https://perenual.com',
      changeOrigin: true,
      rewrite: path => rewriteWithParams(path, /^\/api\/perenual/, '/api/v2', { key: env.PERENUAL_KEY || '' }),
    },
    '/api/upc/lookup': {
      target: 'https://api.upcitemdb.com',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api\/upc\/lookup/, '/prod/trial/lookup'),
    },
  }
}

// `vite preview` sends the same security headers as nginx (read from the one
// source of truth) so CSP problems show up locally before deploying.
function productionHeaders() {
  const conf = readFileSync(new URL('./nginx/snippets/security-headers.conf', import.meta.url), 'utf8')
  return Object.fromEntries([...conf.matchAll(/^add_header\s+(\S+)\s+"([^"]*)"/gm)].map(m => [m[1], m[2]]))
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = apiProxy(env)
  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy, headers: productionHeaders() },
    build: {
      outDir: 'dist',
      // Inline small assets to reduce requests
      assetsInlineLimit: 4096,
    },
  }
})
