import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Serves the Vercel function api/contact.js during `npm run dev`, so the contact form works locally.
// Env vars are read server-side only; nothing without a VITE_ prefix reaches the browser.
function devApi(mode) {
  return {
    name: 'dev-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
      server.middlewares.use('/api/contact', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/contact.js')
        await handler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(mode)],
  server:{
    host:"0.0.0.0",
    port:3000,
  },
  build: {
    rollupOptions: {
      // Pages: the portfolio, the free tools hub and the QR code generator.
      input: {
        main: 'index.html',
        services: 'services/index.html',
        qr: 'qr-code-generator/index.html',
      },
    },
  },
}))
