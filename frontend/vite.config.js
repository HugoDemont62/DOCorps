import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Exposition minimale Prometheus (format texte) — requis pour que le scrape Docker soit UP */
function prometheusMetricsPlugin() {
  const body =
    '# HELP frontend_up Frontend dev server is responding.\n' +
    '# TYPE frontend_up gauge\n' +
    'frontend_up 1\n'
  return {
    name: 'prometheus-metrics',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        if (url === '/metrics' || url.startsWith('/metrics?')) {
          res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
          res.statusCode = 200
          res.end(body)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), prometheusMetricsPlugin()],
  server: {
    port: 3000,
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: ['src/__tests__/**'],
    },
  },
})
